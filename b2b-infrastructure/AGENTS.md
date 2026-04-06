# AGENTS.md — Role Registry

This file defines every agent's file ownership, dependencies, and interface contracts.
Read CLAUDE.md first. Then read only your team file in `agents/`.

---

## Team 1: Frontend (5 agents)

### fe-design
**Scope**: Design tokens, Tailwind config, typography system, dark/light mode, brand CSS variables, shared UI primitives (Button, Badge, Card, Skeleton, AlertBar).
**Owns**: `tailwind.config.ts`, `src/styles/`, `src/components/ui/`, `src/lib/brand.ts`
**Reads**: `docs/reference/style.css` (prototype CSS), CLAUDE.md
**Ships first** — all other frontend agents depend on the token system.
**Interface**: Exports Tailwind classes and CSS variables. Other agents consume tokens via class names only — no raw hex codes in components.
**Verify**: Dark/light toggle works. All semantic tokens resolve in both themes. `BrandName` component reads from env.

### fe-marketing
**Scope**: Full marketing/landing page — all 10 sections (alert bar, nav, hero, pain, product pillars, tools preview, pricing, track record, weekly brief CTA, footer). Smooth-scroll single page.
**Owns**: `src/app/[locale]/(marketing)/page.tsx`, `src/components/marketing/`
**Depends on**: fe-design (tokens), be-api (data endpoints for tool previews)
**Do NOT own**: Auth, dashboard, individual tool pages (those are fe-tools/fe-dashboard)
**Verify**: All 10 sections render. Real regulatory numbers shown (AED 600K, $8.85M, March 2026). Smooth scroll nav works. Alert bar is dismissible.

### fe-tools
**Scope**: Three free public tools — Regulatory Map (`/tools/regulatory-map`), Exchange True Cost Table (`/tools/exchange-costs`), BTC Treasury Tracker (`/tools/btc-treasury`).
**Owns**: `src/app/[locale]/tools/`, `src/components/tools/`
**Depends on**: fe-design, be-api endpoints (`/api/tools/*`), content-tools data files
**These pages are ungated** — no auth check. Anyone can access.
**Verify**: Each tool loads real data from the API. Exchange table shows all-in cost column. BTC tracker shows current BTC price calculation.

### fe-dashboard
**Scope**: Gated subscriber dashboard for Intelligence and Advisory tiers.
**Owns**: `src/app/[locale]/dashboard/`, `src/components/dashboard/`
**Depends on**: fe-design, be-auth (session context), be-api (brief + regulatory data)
**Gating rule**: Unauthenticated → redirect to `/pricing`. Free tier → redirect to `/pricing`. Intelligence+ → show dashboard.
**Dashboard sections**: Latest weekly brief, jurisdiction tracker, exchange vendor comparison, action items list.
**Verify**: Unauth user hitting `/dashboard` gets redirected. Intelligence subscriber sees current brief.

### fe-seo
**Scope**: Technical SEO — meta tags, JSON-LD schemas, OG images, sitemap, robots.txt.
**Owns**: `src/lib/seo/`, `src/app/sitemap.ts`, `src/app/robots.ts`, `src/app/api/og/route.tsx`
**Depends on**: be-api (for dynamic meta content)
**JSON-LD schemas to implement**: Organization, Product, FAQPage (on pricing page), BreadcrumbList
**Verify**: `<title>` and `<meta description>` present on every route. JSON-LD validates at schema.org/validator. Sitemap includes all tool and regulation pages.

---

## Team 2: Backend + Crawler (5 agents)

### be-api
**Scope**: All API routes serving data to the frontend.
**Owns**: `src/app/api/`, `src/lib/api/`
**Contract**: Every endpoint returns `{ data: T, meta: { source: string, timestamp: string, crawledAt: string } }`
**Endpoints to build**:
- `GET /api/regulatory/status` → reads `src/data/regulatory-status.json`
- `GET /api/regulatory/updates` → reads `src/data/regulatory-updates.json`
- `GET /api/tools/exchanges` → reads `src/data/exchanges.json`
- `GET /api/tools/btc-treasury` → reads `src/data/btc-treasury.json`
- `GET /api/brief/latest` → reads latest file from `src/data/briefs/`
**Verify**: All endpoints return 200 with `{ data, meta }` shape. TypeScript types match data shape.

### be-crawler
**Scope**: Autonomous regulatory crawler — fetches, parses, diffs, and writes updates.
**Owns**: `src/lib/crawlers/`, `src/data/regulatory-updates.json`, `src/app/api/cron/crawl-regulatory/route.ts`
**Sources**: VARA, ADGM, CBB, FSRA, SCA, FATF (see `agents/02-BACKEND-CRAWLER.md` for URLs)
**Depends on**: be-cache (Redis for hash storage)
**Output type**: `RegulatoryUpdate[]` (defined in `src/types/regulatory.ts`)
**Do NOT**: Modify any component or page files. Only write to `src/data/` and logs.
**Verify**: Running the cron route produces output in `regulatory-updates.json`. Change detection works (re-running with same content produces no new entries).

### be-cache
**Scope**: Upstash Redis caching layer. TTL management. Cache invalidation on crawler writes.
**Owns**: `src/lib/cache.ts`
**TTLs**:
- Regulatory data: 6 hours (21600s)
- Exchange fees: 24 hours (86400s)
- BTC price: 5 minutes (300s)
- Treasury tracker: 1 hour (3600s)
- Brief content: 1 hour (3600s)
**Interface**: Exports `cache.get<T>()`, `cache.set()`, `cache.del()`, `cache.getOrFetch<T>()`. All API routes use `getOrFetch` — never raw Redis calls in route handlers.
**Verify**: Cache hit on second request (check `X-Cache` response header). TTL set correctly in Redis.

### be-auth
**Scope**: Auth with Clerk. Route protection middleware. Tier-based access control.
**Owns**: `src/lib/auth/`, `src/middleware.ts`
**Protected routes**: `/dashboard/*`, `/api/brief/*` (except `/api/brief/subscribe`)
**Public routes**: `/tools/*`, `/api/tools/*`, `/api/regulatory/status`, `/api/og/*`
**Tier model**: Clerk user metadata `{ tier: 'free' | 'intelligence' | 'advisory' | 'enterprise' }`
**Verify**: Middleware redirects unauth `/dashboard` to `/pricing`. Auth user with `tier: 'free'` also redirected. `tier: 'intelligence'` passes through.

### be-email
**Scope**: Email delivery via Resend. Subscriber management. Brief send pipeline.
**Owns**: `src/lib/email/`, `src/app/api/subscribe/route.ts`, `src/app/api/brief/send/route.ts`
**Resend lists**: `weekly-brief` (free subscribers), `intelligence` (paid tier)
**Templates to build**: welcome email, weekly brief email, "upgrade to Intelligence" drip (week 4)
**Lead storage**: Resend audience + append to `src/data/leads.csv` as local backup
**Verify**: POST `/api/subscribe` with email returns 200 and sends welcome email. Resend dashboard shows contact.

---

## Team 3: Content + Intelligence (3 agents)

### content-regulatory
**Scope**: Regulatory intelligence content — jurisdiction status pages and weekly brief text.
**Owns**: `docs/content/regulatory/`, `src/data/regulatory-status.json`
**Sources**: be-crawler output in `regulatory-updates.json`
**Format**: What changed → What it means → What to do by when. Source URL on every claim.
**Jurisdictions**: UAE (VARA + ADGM/FSRA + SCA), Bahrain (CBB), Saudi Arabia (SAMA/CMA), Egypt (CBE/FRA), Kuwait (CMA), Qatar (QFMA/QFC)
**Verify**: Every regulatory claim has a source URL. No invented fine amounts or deadlines.

### content-tools
**Scope**: Data for the three free public tools.
**Owns**: `src/data/regulatory-map.json`, `src/data/exchanges.json`, `src/data/btc-treasury.json`
**Exchange fee data must be verified** — include source URL as a field in each exchange object. Do not mark any exchange "spread free" without a verified source URL.
**BTC treasury data**: MENA companies with publicly disclosed BTC holdings only. Source field required.
**Verify**: Every exchange entry has `sourceUrl` and `lastVerified` fields. Every BTC entry has `disclosure` field with URL or "public statement" reference.

### content-seo
**Scope**: Page copy, meta descriptions, FAQ content, i18n message strings.
**Owns**: `docs/content/seo/`, `messages/en.json`
**Target rankings**: "VARA license requirements UAE", "ADGM virtual asset framework", "CBB crypto license Bahrain", "MENA crypto regulation 2026", "UAE Travel Rule compliance", "Bitcoin treasury corporate MENA"
**Output format**: Write copy to `docs/content/seo/[page].md` — fe-seo agent implements. Do NOT write directly to component files.
**Verify**: Each page's meta description is ≤160 chars. FAQ content has ≥5 questions per page.

---

## Team 4: Growth + Revenue (3 agents)

### growth-analytics
**Scope**: Analytics implementation — Plausible + Clarity event taxonomy and wiring.
**Owns**: `src/lib/analytics.ts`
**Event taxonomy** (canonical list — frontend agents must use these exact event names):
- `page_view` (automatic via Plausible)
- `cta_click` → props: `{ section, button_label, tier }`
- `pricing_view` → props: `{ tier_hovered }`
- `tool_use` → props: `{ tool_name, duration_seconds }`
- `brief_signup` → props: `{ source_section }`
- `demo_request` → props: `{ tier_interest, company_size }`
**Verify**: `track('cta_click', {...})` fires on Request Access button (check Plausible dashboard or console in dev).

### growth-conversion
**Scope**: Pricing page optimization, lead capture forms, "Request Access" flow.
**Owns**: `src/components/conversion/`, `src/app/api/leads/route.ts`
**Request Access flow**: Modal form (email + company + role + tier interest) → POST `/api/leads` → Resend notification to founder + confirmation email to lead
**Leads stored**: Resend audience + `src/data/leads.csv` backup
**Verify**: Submitting form creates entry in leads.csv and sends two emails (founder notification + lead confirmation).

### growth-seo
**Scope**: Keyword strategy, GSC integration spec, backlink opportunities.
**Owns**: `docs/growth/seo-strategy.md`
**Boundary**: Produces strategy docs only. Does NOT write code or component files.
**Target keywords**: See `agents/04-GROWTH.md` for full keyword list.
**Verify**: `docs/growth/seo-strategy.md` includes keyword difficulty estimates and content gap analysis.

---

## Cross-Team Handoff Points

| Producer | Artifact | Consumer |
|---|---|---|
| be-crawler | `src/data/regulatory-updates.json` (new entries) | content-regulatory (writes brief) |
| content-tools | `src/data/exchanges.json` with verified fees | fe-tools (renders exchange table) |
| content-tools | `src/data/regulatory-map.json` | fe-tools (renders regulatory map) |
| growth-analytics | `src/lib/analytics.ts` with `track()` | fe-marketing, fe-tools, fe-dashboard (wire calls) |
| be-auth | Clerk session + tier | fe-dashboard (gates content) |
| content-seo | `docs/content/seo/*.md` | fe-seo (implements in metadata exports) |
| be-email | `/api/subscribe` route | fe-marketing (brief signup form posts here) |
| growth-conversion | `src/app/api/leads/route.ts` | fe-marketing ("Request Access" modal posts here) |

**Handoff rule**: When a producer completes their artifact, they update `docs/CURRENT-STATE.md` with the new item marked `[x]`. Consumers check CURRENT-STATE.md before assuming an artifact exists.
