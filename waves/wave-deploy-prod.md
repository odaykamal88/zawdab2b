# Wave: Production Deployment
Model: sonnet | Skip: CLAUDE.md, AGENTS.md
Read: b2b-infrastructure/docs/CURRENT-STATE.md

## Context
Moving zawda-b2b-nextjs from local dev to production on Vercel.
Domain: zawda.me (currently pointing at the old retail app — we'll redirect)
Auth: Clerk (replacing slugified tenant IDs)
Cache/DB: Upstash Redis (replacing local .data/ JSON files)
Storage: Vercel Blob (replacing local file bytes)

## Pre-Flight Check (run these first, report results)

```bash
# 1. Verify build is clean
npm run build

# 2. Check for any .env values hardcoded in source
grep -r "re_\|sk_\|pk_\|upstash\|redis" src/ --include="*.ts" --include="*.tsx" | grep -v ".env"

# 3. Confirm .gitignore has .env.local and .data/
cat .gitignore | grep -E "\.env|\.data"

# 4. Check for any hardcoded localhost URLs
grep -r "localhost:3000\|localhost:3001" src/ --include="*.ts" --include="*.tsx"

# 5. Check current git status
git status
git log --oneline -5
```

Report the output of all 5 checks before doing anything else.

---

## Step 1 — Clean Up for Production

### 1a. Remove hardcoded dev fallbacks (CRITICAL)
Find and fix these before deploy:
- VAULT_MASTER_KEY fallback to hardcoded string → throw error if not set in production
- Any hardcoded tenant IDs or dev credentials
- Any console.log statements with sensitive data

```typescript
// WRONG (current):
const masterKey = process.env.VAULT_MASTER_KEY ?? 'dev-fallback-key-change-me'

// CORRECT:
if (!process.env.VAULT_MASTER_KEY) {
  throw new Error('VAULT_MASTER_KEY environment variable is required')
}
const masterKey = process.env.VAULT_MASTER_KEY
```

Apply this pattern to all environment variables that have dev fallbacks.

### 1b. Replace local .data/ persistence with Upstash Redis

Install: `npm install @upstash/redis`

Create: `src/lib/redis.ts`
```typescript
import { Redis } from '@upstash/redis'

export const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
})
```

Migrate these data stores from JSON files to Redis:
- Subscribers list → Redis key: `subscribers` (JSON array)
- Vault document metadata → Redis key: `vault:{userId}:documents` (JSON array)
- Regulatory updates cache → Redis key: `reg:updates` (JSON, TTL 6h)
- Onboarding state → Redis key: `onboarding:{userId}` (JSON)

For each: create a get/set helper in `src/lib/data/[name].ts`
Pattern:
```typescript
export async function getSubscribers(): Promise<Subscriber[]> {
  return (await redis.get<Subscriber[]>('subscribers')) ?? []
}
export async function saveSubscribers(subscribers: Subscriber[]): Promise<void> {
  await redis.set('subscribers', subscribers)
}
```

### 1c. Replace local file byte storage with Vercel Blob

Install: `npm install @vercel/blob`

In vault upload handler (`/api/vault`):
```typescript
import { put, del } from '@vercel/blob'

// Upload
const blob = await put(`vault/${userId}/${fileId}`, encryptedBytes, {
  access: 'private',  // requires auth to access
  contentType: 'application/octet-stream',
})
// Store blob.url in Redis metadata instead of local path

// Download  
const response = await fetch(blobUrl)
const encryptedBytes = await response.arrayBuffer()

// Delete
await del(blobUrl)
```

---

## Step 2 — Clerk Authentication

Install: `npm install @clerk/nextjs`

### 2a. Middleware
Create/update `src/middleware.ts`:
```typescript
import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server'

const isProtectedRoute = createRouteMatcher([
  '/dashboard(.*)',
  '/onboarding(.*)',
  '/recommendation(.*)',
  '/admin(.*)',
  '/api/vault(.*)',
  '/api/analytics(.*)',
  '/api/dashboard(.*)',
])

export default clerkMiddleware((auth, req) => {
  if (isProtectedRoute(req)) auth().protect()
})

export const config = {
  matcher: ['/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jte?|webp?|png|jpg|jpeg|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)', '/(api|trpc)(.*)'],
}
```

### 2b. Layout wrapper
In `src/app/layout.tsx`, wrap with ClerkProvider:
```typescript
import { ClerkProvider } from '@clerk/nextjs'

export default function RootLayout({ children }) {
  return (
    <ClerkProvider>
      <html>
        <body>{children}</body>
      </html>
    </ClerkProvider>
  )
}
```

### 2c. Replace tenant ID derivation
Find every instance of slugified company name being used as tenant ID.
Replace with Clerk's `auth().userId` from `@clerk/nextjs/server`.

In all `/api/vault` routes:
```typescript
import { auth } from '@clerk/nextjs/server'

export async function GET(req: Request) {
  const { userId } = auth()
  if (!userId) return Response.json({ error: 'Unauthorized' }, { status: 401 })
  // use userId as tenant identifier
}
```

### 2d. Auth pages
The existing /register and /login HTML pages → replace with Clerk's hosted UI:
- Update /login route to use `<SignIn />` component
- Update /register route to use `<SignUp />` component
- Or: use Clerk's hosted sign-in page (simplest — redirect to Clerk's URL)
- After sign-in: redirect to /onboarding (first time) or /dashboard (returning)

Check Clerk dashboard → set redirect URLs:
- Sign-in redirect: /dashboard
- Sign-up redirect: /onboarding
- After sign-out: /

---

## Step 3 — Environment Variables Audit

Create a complete list of all required env vars for production.
Check every `process.env.*` usage in the codebase.

Required (confirm these are all present):
```
# Clerk
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_live_...
CLERK_SECRET_KEY=sk_live_...

# Upstash Redis
UPSTASH_REDIS_REST_URL=https://...
UPSTASH_REDIS_REST_TOKEN=...

# Vercel Blob (get from Vercel dashboard after creating blob store)
BLOB_READ_WRITE_TOKEN=vercel_blob_rw_...

# Vault encryption
VAULT_MASTER_KEY=<generate: openssl rand -hex 32>

# Email (Resend)
RESEND_API_KEY=re_...
RESEND_FROM_EMAIL=compliance@zawda.me

# App
NEXT_PUBLIC_APP_URL=https://zawda.me
NEXT_PUBLIC_CALENDLY_URL=https://calendly.com/zawda

# Optional: Chainalysis (for future Wave 5)
# CHAINALYSIS_API_KEY=...
```

Output the full list of env vars needed in a file: `docs/ENV-VARS-REQUIRED.md`

---

## Step 4 — vercel.json Configuration

Create `vercel.json` in project root:
```json
{
  "crons": [
    {
      "path": "/api/cron/crawl",
      "schedule": "0 */6 * * *"
    }
  ],
  "headers": [
    {
      "source": "/api/(.*)",
      "headers": [
        { "key": "X-Content-Type-Options", "value": "nosniff" },
        { "key": "X-Frame-Options", "value": "DENY" }
      ]
    }
  ]
}
```

---

## Step 5 — GitHub Push Prep

```bash
# Verify .gitignore is correct
cat .gitignore

# Must contain:
# .env.local
# .env*.local
# .data/
# node_modules/

# Add all changes
git add .

# Commit everything
git commit -m "feat: production-ready — Clerk auth, Upstash persistence, Vercel Blob storage

- Replace local .data/ JSON with Upstash Redis
- Replace local file storage with Vercel Blob
- Add Clerk middleware protecting all dashboard/vault routes
- Remove all dev fallback hardcoded values
- Add vercel.json with cron config
- Environment variables audit complete"

# Push
git push origin main
```

---

## Step 6 — Rate Limiting on Vault Endpoints

Install: `npm install @upstash/ratelimit` (already have Redis)

Add to all `/api/vault` routes:
```typescript
import { Ratelimit } from '@upstash/ratelimit'
import { redis } from '@/lib/redis'

const ratelimit = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(30, '1 m'), // 30 req/min per user
})

// In handler:
const { success } = await ratelimit.limit(userId)
if (!success) return Response.json({ error: 'Too many requests' }, { status: 429 })
```

---

## Done When
- [ ] `npm run build` passes with zero errors
- [ ] No hardcoded dev fallback values remain
- [ ] Vault metadata reads/writes from Upstash Redis (not .data/)
- [ ] Vault file bytes read/write from Vercel Blob (not local fs)
- [ ] Clerk middleware protects all /dashboard/* and /api/vault/* routes
- [ ] Unauthenticated request to /dashboard → redirects to /sign-in
- [ ] `docs/ENV-VARS-REQUIRED.md` lists every required env var
- [ ] `vercel.json` created with cron config
- [ ] `git push origin main` succeeds with clean history
- [ ] Rate limiting active on vault endpoints
