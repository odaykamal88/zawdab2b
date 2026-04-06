# Wave 2 Exec — Crawler + Intelligence Pipeline
Model: sonnet | Skip: CLAUDE.md, AGENTS.md | Read: agents/02-BACKEND-CRAWLER.md, agents/03-CONTENT.md

## Prerequisites
Wave 1 must be complete. Verify before starting:
- `npm run build` passes zero errors
- `src/data/regulatory-status.json` exists with 6 jurisdictions
- Upstash Redis env vars are set in `.env.local`
- Resend API key is set in `.env.local`

## Tasks (complete in this order)

### 1. be-crawler — Regulatory Crawler for All 6 Sources

Build `src/lib/crawlers/` with the following structure:
```
src/lib/crawlers/
├── index.ts          # crawlAllSources() — orchestrates all crawlers, returns results
├── utils.ts          # hasContentChanged(), appendUpdates(), generateId()
├── vara.ts           # crawlVARA()
├── adgm.ts           # crawlADGM() — includes FSRA section
├── cbb.ts            # crawlCBB()
├── sca.ts            # crawlSCA()
└── fatf.ts           # crawlFATF()
```

**For each crawler function**:
1. Fetch the target URL with a 30-second timeout (`AbortController`)
2. Parse HTML with `cheerio`
3. Extract relevant content (entity lists, article titles + dates, regulation titles)
4. Hash the extracted content string
5. Call `hasContentChanged(source, content)` — compare against stored Redis hash
6. If changed: parse the delta, create `RegulatoryUpdate[]`, call `appendUpdates()`
7. If HTTP 403 or 429: log to `src/data/crawler-errors.json`, skip source, do not throw
8. Return `{ source, changed: boolean, newUpdates: RegulatoryUpdate[] }`

**For initial run (no stored hash)**: treat as changed, write full snapshot. Do not spam updates — only write the most recent 3–5 items from the initial snapshot.

**Cron route**: `src/app/api/cron/crawl-regulatory/route.ts`
- Verify `Authorization: Bearer ${CRON_SECRET}` header in production (skip check if env not set — allows local testing)
- Call `crawlAllSources()`
- Return `{ crawledAt, newUpdates: count, errors: [] }`

**Alert pipeline**: After crawl, check if any update has `severity === 'critical' || 'high'`. If yes, call `/api/brief/alert` (build stub — full email in task 3).

**vercel.json**: Create at project root:
```json
{
  "crons": [
    {
      "path": "/api/cron/crawl-regulatory",
      "schedule": "0 */6 * * *"
    }
  ]
}
```

Verify: `curl -H "Authorization: Bearer test" localhost:3000/api/cron/crawl-regulatory` returns JSON with `crawledAt` and `newUpdates` count. Check `src/data/regulatory-updates.json` exists and has entries. Run twice — second run should show fewer/zero new updates (change detection working).

### 2. be-cache — Upstash Redis Caching Layer

Build `src/lib/cache.ts`:

```typescript
import { Redis } from '@upstash/redis'

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
})

export const cache = {
  async get<T>(key: string): Promise<T | null>,
  async set(key: string, value: unknown, ttlSeconds: number): Promise<void>,
  async del(key: string): Promise<void>,
  async getOrFetch<T>(
    key: string,
    fetcher: () => Promise<T>,
    ttlSeconds: number
  ): Promise<{ data: T; cached: boolean }>
}
```

TTL constants (export from cache.ts):
```typescript
export const TTL = {
  REGULATORY: 21600,    // 6 hours
  EXCHANGE_FEES: 86400, // 24 hours
  BTC_PRICE: 300,       // 5 minutes
  TREASURY: 3600,       // 1 hour
  BRIEF: 3600,          // 1 hour
  CRAWLER_HASH: 604800, // 7 days
} as const
```

Verify: Wire cache to existing API routes from Wave 1. Test: first request sets cache, second request hits cache (`X-Cache: HIT`). Confirm in Upstash console that keys are set with correct TTLs.

### 3. be-email — Resend Integration + Subscriber Route

Build the email system:

**`src/lib/email/index.ts`**: Resend client + typed email send function
**`POST /api/subscribe/route.ts`**:
- Body: `{ email, company?, role? }`
- Validate email format (server-side, not just client)
- Add to Resend audience (use Resend Contacts API)
- Append to `src/data/leads.csv` (create if not exists)
- Send welcome email immediately
- Return `{ success: true }` or `{ error: string }` with appropriate status codes
- Rate limit: 1 signup per IP per hour (use Upstash Ratelimit)

**Welcome email**: plain text + HTML multipart. Subject: `Welcome to the MENA Digital Asset Brief`. Body: what to expect every Monday, link to this week's brief (once it exists), unsubscribe link.

**`POST /api/brief/send/route.ts`**:
- Protected: require `Authorization: Bearer ${CRON_SECRET}`
- Body: `{ briefDate: string }`
- Read `src/data/briefs/[briefDate].json`
- Format brief email template (build `src/lib/email/templates/brief.tsx` — React Email compatible)
- Send to all Resend 'intelligence' audience contacts
- Update brief JSON with `sentAt` and `recipientCount`

**Brief email template** (`src/lib/email/templates/brief.tsx`):
- Dark background (#0a0e1a), responsive, 600px max-width
- Gold accent for section headers
- Sections: Summary → Key Updates (from `updates[]`) → Action Items → Sources
- Plain text fallback required

Verify: `curl -X POST localhost:3000/api/subscribe -H "Content-Type: application/json" -d '{"email":"test@example.com"}'` returns `{ success: true }` and sends welcome email. Check Resend dashboard for the contact.

### 4. content-regulatory — Initial Jurisdiction Status Content

**Do not start** until `regulatory-updates.json` exists (even if empty from the first crawler run).

- Review `src/data/regulatory-updates.json` for any detected changes
- Update `src/data/regulatory-status.json` with any new enforcement actions or framework changes found by the crawler
- Write individual jurisdiction docs to `docs/content/regulatory/[country].md`:
  - What changed (if anything) + what it means + what to do by when
  - Source URLs for every claim
  - Flag any outdated information with `[NEEDS VERIFICATION]`
- Write the inaugural weekly brief to `src/data/briefs/[current-monday-date].json`
  - Even if no new crawler updates: write brief with market context and jurisdiction status roundup
  - Follow the brief format exactly as specified in agents/03-CONTENT.md

Verify: `src/data/briefs/[date].json` is valid JSON matching the WeeklyBrief interface. Every `sources[]` URL is a real, fetchable URL (no invented URLs).

---

## Boundaries (do NOT build in Wave 2)
- Do NOT build auth or the subscriber dashboard (Wave 3)
- Do NOT build the full tool pages (Wave 3)
- Do NOT modify marketing page components from Wave 1
- Crawler must NOT write to any file other than `src/data/regulatory-updates.json`, `src/data/crawler-errors.json`, and `.ruflo/logs/`

## Done When
- [ ] `curl localhost:3000/api/cron/crawl-regulatory` executes without error and produces output in `regulatory-updates.json`
- [ ] Re-running the cron route shows 0 new updates (change detection working)
- [ ] `curl localhost:3000/api/subscribe` with a valid email creates a Resend contact and sends welcome email
- [ ] `src/data/briefs/[this-monday].json` exists and is valid JSON
- [ ] Cache TTLs are set correctly (verify in Upstash console)
- [ ] `vercel.json` has cron config
- [ ] `npm run build` zero errors
