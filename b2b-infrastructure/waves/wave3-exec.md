# Wave 3 Exec — Auth Gating + B2B Dashboard + Conversion
Model: sonnet | Skip: CLAUDE.md, AGENTS.md | Read: agents/01-FRONTEND.md, agents/02-BACKEND-CRAWLER.md, agents/04-GROWTH.md

## Prerequisites
Waves 1 and 2 must be complete. Verify before starting:
- Marketing page renders at `localhost:3000`
- Crawler cron route works
- `/api/subscribe` sends emails
- Resend API and Clerk accounts provisioned
- Add to `.env.local`: `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`, `CLERK_SECRET_KEY`

## Tasks (run sessions 1 + 2 in parallel; session 3 after auth is live)

### Session 1: be-auth + be-email (Auth + Email Sequences)

**Clerk Setup**:
1. Install: `npm install @clerk/nextjs`
2. Wrap root layout in `<ClerkProvider>`
3. Create `src/middleware.ts`:
```typescript
import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server'

const isProtectedRoute = createRouteMatcher(['/dashboard(.*)', '/api/brief/(.*)'])

export default clerkMiddleware(async (auth, req) => {
  if (isProtectedRoute(req)) {
    const { userId, sessionClaims } = await auth()
    if (!userId) return redirectToSignIn({ returnBackUrl: req.url })
    
    // Check tier from user metadata
    const tier = (sessionClaims?.metadata as any)?.tier
    if (!tier || tier === 'free') {
      return Response.redirect(new URL('/pricing', req.url))
    }
  }
})

export const config = {
  matcher: ['/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)', '/(api|trpc)(.*)'],
}
```

**Tier model in Clerk metadata**:
```typescript
// Set via Clerk dashboard or backend webhook after Stripe payment:
// user.publicMetadata = { tier: 'intelligence' | 'advisory' | 'enterprise' | 'free' }
```

**Public routes** (do NOT protect):
- Everything in `/(marketing)` — the landing page
- `/tools/*` — all free tools
- `/api/tools/*`, `/api/regulatory/status` — data for public tools
- `/api/subscribe` — brief signup
- `/api/leads` — lead capture
- `/sign-in`, `/sign-up`

**Protected routes**:
- `/dashboard/*` — requires Intelligence+ tier
- `/api/brief/latest` — requires Intelligence+ tier (public brief is delivered by email; API access is paid)
- `/api/brief/send` — requires CRON_SECRET header (not user auth)

Verify: Visiting `localhost:3000/dashboard` without auth redirects to sign-in. Sign in with a test user that has `tier: 'free'` → redirects to `/pricing`. Set `tier: 'intelligence'` → dashboard loads.

**Email sequences** (wire via Resend automations, or build in `src/lib/email/sequences.ts`):
- Brief welcome sequence: trigger on subscribe, send immediately + day-3 follow-up
- Intelligence upsell: trigger when subscriber reaches 4th brief, hasn't upgraded
  Implement as a scheduled cron: `GET /api/cron/upsell-check` — queries leads.csv, checks brief count, sends upsell email if threshold met

### Session 2: fe-tools + fe-dashboard (Parallel with Session 1)

**fe-tools — Build Three Tool Pages**:

Build `src/app/[locale]/tools/` with:
- `/tools` — tools landing page (links to 3 tools)
- `/tools/regulatory-map` — interactive jurisdiction table
- `/tools/exchange-costs` — exchange true cost comparison table
- `/tools/btc-treasury` — BTC treasury tracker

**Regulatory Map page**:
- Fetch from `/api/regulatory/status`
- Table or card grid: country, status badge (Fully Regulated / In Progress / Early Stage / Restricted), primary regulator, link to detail page
- Status badges use green/amber/gray color coding
- "Last updated: [date]" displayed below table
- Click row → `/regulation/[slug]` detail page (static, content from `regulatory-status.json`)
- Wire `track('tool_use', { tool_name: 'regulatory_map', duration_seconds: elapsed })`

**Exchange True Cost Calculator**:
- Fetch from `/api/tools/exchanges`
- Sortable table: Exchange, VARA Licensed (yes/no badge), Trading Fee %, Spread %, Card Deposit Fee, BTC Withdrawal Fee, All-In Cost %
- Highlight lowest "All-In Cost" in green, highest in red (using JetBrains Mono for all numbers)
- "Source: [exchange fee page]" link on each row
- Filter toggle: "VARA Licensed only"
- Wire `track('tool_use', { tool_name: 'exchange_costs', duration_seconds: elapsed })`

**BTC Treasury Tracker**:
- Fetch from `/api/tools/btc-treasury`
- Table: Company, Country, BTC Held, Approx Value (calculate live: holdings × current BTC price from `/api/tools/btc-price`), Disclosure Date, Source link
- Current BTC price: build `GET /api/tools/btc-price` — fetches from CoinGecko free API, caches 5 min
- "New this week" badge on entries added in last 7 days
- Wire `track('tool_use', { tool_name: 'btc_treasury', duration_seconds: elapsed })`

**fe-dashboard — Subscriber Dashboard**:

Build `src/app/[locale]/dashboard/page.tsx` — this is the gated B2B dashboard.

**Layout**: Two-column on desktop, single column on mobile. Left sidebar for navigation, main area for content.

**Dashboard sections**:
1. **Welcome header**: "Good [morning/afternoon], [first name]" + current date + tier badge
2. **Alert block**: Pull any `severity: critical` items from `/api/regulatory/updates` → show as dismissible red cards at top
3. **Latest Brief** (main): Pull from `/api/brief/latest` → render brief.headline, brief.summary, brief.updates (list), brief.actionItems (checklist), brief.sources
4. **Jurisdiction Tracker**: Compact version of regulatory map — 6 rows, status + "last changed" date
5. **Exchange Vendor Comparison**: Same data as public tool but with advisory notes added (column: "Recommended for...")
6. **Action Items**: brief.actionItems rendered as a checklist the user can check off (localStorage-persisted per brief date)

Verify: Dashboard renders for Intelligence user. Each section shows real data (not mock). Jurisdiction tracker updates when regulatory-status.json is updated. Action items checklist state persists on reload.

### Session 3: growth-conversion + growth-analytics (After Auth Works)

**growth-conversion**:
- Polish "Request Access" modal (from Wave 1) — add company size dropdown, ensure all `track()` calls fire
- Build the "Upgrade" page at `/upgrade` — shown to users with `tier: 'free'` who try to access dashboard
  - Show comparison table: Intelligence vs Advisory features
  - CTA: "Schedule a Call" → Calendly embed or link (founder's calendar URL via env `NEXT_PUBLIC_CALENDLY_URL`)
  - Alternative CTA: "Contact Us" → opens modal, posts to `/api/leads` with `tierInterest: 'upgrade'`
- Verify leads.csv captures all form submissions

**growth-analytics**:
- Wire Plausible script in `src/app/layout.tsx` (via `NEXT_PUBLIC_PLAUSIBLE_DOMAIN` env)
- Wire Clarity snippet in `src/app/layout.tsx` (via `NEXT_PUBLIC_CLARITY_ID` env)
- Audit all `track()` call sites — verify every button/form from AGENTS.md event taxonomy is firing
- Test in browser console: `window.plausible('cta_click', { props: { section: 'hero', button_label: 'request_access' } })` → verify in Plausible dashboard

---

## Boundaries (do NOT build in Wave 3)
- Do NOT build Stripe billing — Advisory/Enterprise customers are closed manually; Stripe is post-Wave 3
- Do NOT build real-time data feeds — all data still from JSON files + CoinGecko for BTC price only
- Do NOT build white-label or API access features (Enterprise, post-launch)
- Do NOT modify crawler code from Wave 2

## Done When
- [ ] Unauthenticated user hitting `/dashboard` gets redirected to `/sign-in`
- [ ] Authenticated user with `tier: 'free'` hitting `/dashboard` gets redirected to `/pricing`
- [ ] Authenticated user with `tier: 'intelligence'` sees the full dashboard with real data
- [ ] All 3 tool pages load data from the API
- [ ] Exchange table highlights cheapest and most expensive options
- [ ] `track()` fires on all key CTAs (verify in Plausible + browser console)
- [ ] "Request Access" modal submits to `/api/leads` and sends founder notification email
- [ ] `npm run build` zero errors
- [ ] Lighthouse Performance score >90 on marketing page (run `npx lighthouse localhost:3000 --only-categories=performance`)
