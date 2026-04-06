# docs/CURRENT-STATE.md — Current Build State

**Last updated**: 2026-04-05
**Updated by**: initialization (pre-scaffold)

This file is the single source of truth for what exists, what's stubbed, and what's broken.
Every agent reads this before coding. Every agent updates it when they complete work.

---

## Project Status: Pre-Scaffold

The Next.js project has NOT been created yet. No source code exists.

Reference prototype: HTML/CSS/JS prototype exists at `docs/reference/` (copied from `zawda-b2b/`).
This prototype has the complete design language, copy, and layout — use it as the design spec.

---

## What Exists

### Reference Material
- [x] `docs/reference/index.html` — full marketing page HTML prototype
- [x] `docs/reference/style.css` — complete CSS with all design tokens, dark/light themes, all component styles
- [x] `docs/reference/app.js` — interaction JS (theme toggle, alert bar dismiss, mobile nav, scroll animations)
- [x] `docs/reference/screenshot-desktop.png` — desktop visual reference
- [x] `docs/reference/screenshot-mobile.png` — mobile visual reference
- [x] `docs/reference/screenshot-pricing.png` — pricing section close-up
- [x] `docs/reference/screenshot-trackrecord.png` — track record section close-up

### Infrastructure MDs (this repo)
- [x] `CLAUDE.md` — universal agent rules
- [x] `AGENTS.md` — role registry with file ownership
- [x] `agents/01-FRONTEND.md` — frontend team lead instructions
- [x] `agents/02-BACKEND-CRAWLER.md` — backend + crawler team lead instructions
- [x] `agents/03-CONTENT.md` — content + intelligence team lead instructions
- [x] `agents/04-GROWTH.md` — growth + revenue team lead instructions
- [x] `waves/wave1-exec.md` — Wave 1 execution prompt
- [x] `waves/wave2-exec.md` — Wave 2 execution prompt
- [x] `waves/wave3-exec.md` — Wave 3 execution prompt
- [x] `autonomous/start-autonomous.sh` — autonomous agent scheduler
- [x] `autonomous/agents/regulatory-crawler.md` — crawler agent instructions
- [x] `autonomous/agents/brief-generator.md` — brief generator agent instructions
- [x] `orchestration/LAUNCH-SEQUENCE.md` — human operator launch guide

---

## What Does NOT Exist Yet

### Next.js Project
- [ ] Next.js project (not yet scaffolded — run `npx create-next-app@latest`)
- [ ] `tailwind.config.ts` (Wave 1: fe-design)
- [ ] `src/styles/globals.css` with design tokens (Wave 1: fe-design)
- [ ] `src/components/ui/` (Wave 1: fe-design)
- [ ] `src/components/marketing/` (Wave 1: fe-marketing)
- [ ] `src/app/[locale]/(marketing)/page.tsx` (Wave 1: fe-marketing)
- [ ] `src/lib/brand.ts` (Wave 1: fe-design)
- [ ] `src/lib/cache.ts` (Wave 2: be-cache)
- [ ] `src/lib/crawlers/` (Wave 2: be-crawler)
- [ ] `src/lib/email/` (Wave 2: be-email)
- [ ] `src/lib/auth/` (Wave 3: be-auth)
- [ ] `src/middleware.ts` (Wave 3: be-auth)
- [ ] `src/app/api/` routes (Wave 1 + 2)
- [ ] `src/app/[locale]/tools/` pages (Wave 3: fe-tools)
- [ ] `src/app/[locale]/dashboard/` (Wave 3: fe-dashboard)
- [ ] `src/app/sitemap.ts` (Wave 1: fe-seo)
- [ ] `src/app/robots.ts` (Wave 1: fe-seo)

### Data Files
- [ ] `src/data/regulatory-status.json` (Wave 1: content-tools)
- [ ] `src/data/exchanges.json` (Wave 1: content-tools)
- [ ] `src/data/btc-treasury.json` (Wave 1: content-tools)
- [ ] `src/data/regulatory-updates.json` (Wave 2: be-crawler — initialized on first crawl)
- [ ] `src/data/briefs/` directory (Wave 2: content-regulatory)
- [ ] `src/data/leads.csv` (Wave 3: growth-conversion — initialized on first lead)
- [ ] `messages/en.json` (Wave 1: content-seo)

### External Integrations
- [ ] Upstash Redis project (human: create at console.upstash.com)
- [ ] Resend account + API key (human: create at resend.com)
- [ ] Clerk application (human: create at clerk.com — needed for Wave 3)
- [ ] Plausible site (human: add site at plausible.io — needed for Wave 3)
- [ ] Microsoft Clarity project (human: create at clarity.microsoft.com — needed for Wave 3)
- [ ] Vercel project (human: connect repo at vercel.com)
- [ ] Google Search Console property (human: add after deploy)

---

## Known Issues / Decisions

### Open Decisions (human must decide before Wave 3)
1. **Domain name**: What domain will this deploy to? Needed for:
   - Resend "from" email domain verification
   - Plausible domain config
   - GSC property setup
   - OG image absolute URLs
   Set in `.env.local` as `NEXT_PUBLIC_SITE_URL=https://yourdomain.com`

2. **Calendly URL**: Founder's booking link for Advisory calls. Set as `NEXT_PUBLIC_CALENDLY_URL`.

3. **Brand name for launch**: Is it "Zawda" or a different name? Set as `NEXT_PUBLIC_BRAND_NAME` in `.env.local` and `NEXT_PUBLIC_BRAND_NAME` in Vercel env vars. The prototype uses "Zawda" — change this before launch if rebranding.

### Technical Constraints
- **Vercel Cron on free tier**: Limited to 2 cron jobs. The regulatory crawler (`/api/cron/crawl-regulatory`) is the primary one. The upsell check (`/api/cron/upsell-check`) may need to be scheduled differently or combined.
- **File writes in serverless**: `src/data/` JSON files are written by the crawler. On Vercel, serverless functions have a read-only filesystem except for `/tmp`. The crawler writes to the filesystem — this only works locally or with a persistent server. **For production**: replace JSON file writes with Upstash Redis storage or a Vercel KV store. This is a post-Wave-3 concern — develop locally with file writes, then migrate.
- **cheerio in serverless**: `cheerio` is a Node.js-only package. Ensure it's in `dependencies`, not `devDependencies`. Test bundle size — may need to use `@dqbd/tiktoken` alternative or a lighter HTML parser if bundle exceeds Vercel's 50MB limit.

### Regulatory Data Freshness Warning
The regulatory figures cited in the marketing copy (AED 600K VARA fines, $8.85M ADGM penalty) are from Q4 2025 and early 2026 reports. Before launch, verify these figures are still the most recent enforcement actions. See `docs/reference/index.html` for source comment placeholders in the code.

---

## Update Protocol

When an agent completes work:
1. Mark the relevant items above as `[x]`
2. Add the completion date and agent name in a comment: `<!-- completed 2026-04-07 by fe-design -->`
3. Add any new known issues to the Known Issues section

When data files are created, add the `_meta` block per agents/03-CONTENT.md format.

---

## Environment Variables Required

### Wave 1 (minimum to run)
```
NEXT_PUBLIC_BRAND_NAME=Zawda
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

### Wave 2 (crawler + email)
```
UPSTASH_REDIS_REST_URL=https://...upstash.io
UPSTASH_REDIS_REST_TOKEN=...
RESEND_API_KEY=re_...
CRON_SECRET=<random-secret-string>
```

### Wave 3 (auth + analytics)
```
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_...
CLERK_SECRET_KEY=sk_...
NEXT_PUBLIC_PLAUSIBLE_DOMAIN=yourdomain.com
NEXT_PUBLIC_CLARITY_ID=...
NEXT_PUBLIC_CALENDLY_URL=https://calendly.com/...
```
