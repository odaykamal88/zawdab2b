# orchestration/LAUNCH-SEQUENCE.md — Human Operator Launch Guide

This is for you, the human operator. Not for agents.
Follow this sequence to go from zero to deployed in 3 phases.

---

## Pre-Launch Checklist (Before Any Code)

**Accounts to create** (do this first — some take minutes to verify):
- [ ] [Upstash](https://console.upstash.com) — create a Redis database. Copy REST URL + token.
- [ ] [Resend](https://resend.com) — create account, verify your domain for sending, get API key.
- [ ] [Clerk](https://clerk.com) — create application (Next.js template). Get publishable + secret keys.
- [ ] [Plausible](https://plausible.io) — add your site. Get tracking script domain.
- [ ] [Microsoft Clarity](https://clarity.microsoft.com) — create project. Get project ID.
- [ ] [Vercel](https://vercel.com) — create account, connect to your GitHub repo.

**DNS**: Point your domain to Vercel. Add Resend DNS records for email sending.

---

## Pre-Spawn (5 minutes — run once before opening Claude Code)

```bash
# 1. Scaffold the Next.js project
npx create-next-app@latest . --typescript --tailwind --app --src-dir --eslint

# 2. Install required packages
npm install @upstash/redis @upstash/ratelimit @clerk/nextjs resend cheerio
npm install next-intl
# Dev dependencies:
npm install -D @types/cheerio

# 3. Copy prototype reference files into docs/reference/
mkdir -p docs/reference
cp /home/user/workspace/zawda-b2b/index.html docs/reference/
cp /home/user/workspace/zawda-b2b/style.css docs/reference/
cp /home/user/workspace/zawda-b2b/app.js docs/reference/
cp /home/user/workspace/zawda-b2b/screenshot-*.png docs/reference/

# 4. Copy this infrastructure repo's agent files into your project
cp -r /home/user/workspace/b2b-infrastructure/. .
# (or git clone both into the same workspace)

# 5. Create .env.local
cat > .env.local << 'EOF'
# Wave 1 minimum
NEXT_PUBLIC_BRAND_NAME=Zawda
NEXT_PUBLIC_SITE_URL=http://localhost:3000

# Wave 2 — fill before running Wave 2
UPSTASH_REDIS_REST_URL=
UPSTASH_REDIS_REST_TOKEN=
RESEND_API_KEY=
CRON_SECRET=change-me-to-a-random-string

# Wave 3 — fill before running Wave 3
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=
CLERK_SECRET_KEY=
NEXT_PUBLIC_PLAUSIBLE_DOMAIN=
NEXT_PUBLIC_CLARITY_ID=
NEXT_PUBLIC_CALENDLY_URL=
EOF

# 6. Verify build before handing to agents
npm run build
# Expected: compiles with no errors (just default Next.js app)
```

---

## Phase 1 — Session 1: Frontend (Wave 1)

Open Claude Code in the project folder. Start a fresh session.

**Paste this prompt exactly**:
```
[WAVE 1] FRONTEND — Model: sonnet
Skip CLAUDE.md and AGENTS.md — use cached knowledge from your initial read.
Read only: agents/01-FRONTEND.md, waves/wave1-exec.md

Complete Wave 1 tasks 1, 2, 3 in order:
1. fe-design: Set up design tokens, Tailwind config, fonts, CSS variables, BrandName component, AlertBar, Button, Skeleton.
2. fe-marketing: Build the complete marketing page (all 10 sections). Use the prototype at docs/reference/ for structure and copy. No placeholder text — real regulatory numbers with source comments.
3. fe-seo: Add metadata export, Organization JSON-LD, sitemap.ts, robots.ts.

Screenshot when: localhost:3000 renders the full page with all 10 sections visible.
Update docs/CURRENT-STATE.md when each task is complete.
```

**Expected output**: Full marketing page rendering at localhost:3000. Both themes working. Mobile responsive.

---

## Phase 1 — Session 2: Backend (Wave 1, parallel with Session 1)

Open a second Claude Code window in the same project folder.

**Paste this prompt exactly**:
```
[WAVE 1] BACKEND + CONTENT — Model: sonnet
Skip CLAUDE.md and AGENTS.md.
Read only: agents/02-BACKEND-CRAWLER.md, agents/03-CONTENT.md, waves/wave1-exec.md

Complete Wave 1 tasks 4 and 5 in parallel (they are independent):
Task 4 (be-api): Build /api/regulatory/status, /api/tools/exchanges, /api/tools/btc-treasury. Wire Upstash Redis caching. All return { data, meta } envelope.
Task 5 (content-tools): Populate src/data/regulatory-status.json (6 jurisdictions), src/data/exchanges.json (6+ exchanges with VERIFIED fees and sourceUrl for each), src/data/btc-treasury.json (MENA companies with confirmed BTC, disclosure URL required).

CRITICAL for task 5: Do NOT invent fee figures. Every exchange entry must have sourceUrl. Every BTC entry must have disclosure URL. If you cannot verify a figure, write "UNVERIFIED" in that field.

Update docs/CURRENT-STATE.md when each task is complete.
Done when: curl localhost:3000/api/tools/exchanges returns { data: [...], meta: {...} } with real data.
```

---

## Phase 1 Verification (before starting Phase 2)

Run this checklist manually before opening any Phase 2 sessions:

```bash
# Marketing page renders
curl -s http://localhost:3000 | grep -q "VARA" && echo "PASS: Marketing page has regulatory content"

# APIs return correct shape
curl -s http://localhost:3000/api/tools/exchanges | node -e "
  const r = JSON.parse(require('fs').readFileSync('/dev/stdin', 'utf8'));
  console.assert(r.data && r.meta, 'FAIL: Missing data or meta');
  console.assert(r.data[0].sourceUrl, 'FAIL: Missing sourceUrl in exchange data');
  console.log('PASS: Exchange API correct shape');
"

# Build passes
npm run build && echo "PASS: Build clean"
npm run lint && echo "PASS: Lint clean"
npx tsc --noEmit && echo "PASS: No TypeScript errors"
```

Only proceed to Phase 2 when all checks pass.

---

## Phase 2 — Session 3: Crawler + Email (Wave 2)

Fill in `.env.local` Wave 2 variables before starting.

**Paste this prompt**:
```
[WAVE 2] CRAWLER + EMAIL — Model: sonnet
Skip CLAUDE.md and AGENTS.md.
Read only: agents/02-BACKEND-CRAWLER.md, waves/wave2-exec.md

Complete Wave 2 tasks 1–3:
1. be-crawler: Build src/lib/crawlers/ for all 6 sources (VARA, ADGM, CBB, FSRA, SCA, FATF). Implement change detection via Redis hash comparison. Build cron route. Create vercel.json.
2. be-cache: Build src/lib/cache.ts with getOrFetch() helper. Wire to existing API routes.
3. be-email: Set up Resend client. Build /api/subscribe route with rate limiting. Build welcome email template. Build /api/brief/send route.

Test each component before moving to next.
Update docs/CURRENT-STATE.md when each task is complete.
Done when: curl the cron route produces output in regulatory-updates.json, and curl /api/subscribe sends a welcome email.
```

---

## Phase 2 — Session 4: Content (Wave 2, parallel with Session 3)

**Paste this prompt**:
```
[WAVE 2] CONTENT — Model: haiku
Skip CLAUDE.md and AGENTS.md.
Read only: agents/03-CONTENT.md, waves/wave2-exec.md

Complete Wave 2 task 4:
- Write jurisdiction status content for all 6 countries (UAE, Bahrain, Saudi Arabia, Egypt, Kuwait, Qatar) into docs/content/regulatory/[country].md
- Verify and update src/data/regulatory-status.json with the current regulatory state for each jurisdiction
- Write the inaugural weekly brief to src/data/briefs/[today's-monday-date].json
  Brief date: [manually fill in the most recent Monday's date, e.g., "2026-04-06"]
  Use real updates from regulatory-updates.json if it exists. If empty, write brief with market context.

Output: file paths created only. Verify every claim has a source URL.
```

---

## Phase 3 — Session 5: Auth + Dashboard + Growth (Wave 3)

Fill in `.env.local` Wave 3 variables before starting. Create the Clerk application and get keys.

**Paste this prompt**:
```
[WAVE 3] AUTH + DASHBOARD + CONVERSION — Model: sonnet
Skip CLAUDE.md and AGENTS.md.
Read: agents/01-FRONTEND.md, agents/02-BACKEND-CRAWLER.md, agents/04-GROWTH.md, waves/wave3-exec.md

Complete all Wave 3 tasks:
Session 1 (auth + email): be-auth with Clerk, middleware protecting /dashboard, upsell email sequence
Session 2 (tools + dashboard, run in parallel): fe-tools (3 tool pages), fe-dashboard (subscriber dashboard)
Session 3 (conversion + analytics): growth-conversion (polish Request Access flow), growth-analytics (wire all track() calls)

Start with be-auth (others depend on it). Then run Sessions 2 and 3 simultaneously if possible.
Done when: unauthenticated /dashboard → redirected. Intelligence user → sees real brief. All tool pages load data.
```

---

## Deployment

After Phase 3 is complete and all local tests pass:

```bash
# Final pre-deploy checks
npm run build       # must be clean
npm run lint        # must be clean
npx tsc --noEmit    # must be clean

# Lighthouse check on marketing page
npx lighthouse http://localhost:3000 --only-categories=performance,accessibility,seo \
  --chrome-flags="--headless" --output=json | \
  node -e "const r=JSON.parse(require('fs').readFileSync('/dev/stdin','utf8')); \
    console.log('Performance:', r.categories.performance.score*100); \
    console.log('SEO:', r.categories.seo.score*100);"
# Target: Performance >90, SEO >90

# Deploy to Vercel
vercel --prod
```

**After deployment**:
1. Set all `.env.local` variables as Vercel Environment Variables (Production)
2. Add `CRON_SECRET` to Vercel env — same value as local
3. Verify `vercel.json` cron is active (Vercel dashboard → Crons tab)
4. Submit sitemap to Google Search Console: `https://yourdomain.com/sitemap.xml`
5. Test `/api/cron/crawl-regulatory` with the production CRON_SECRET to trigger first crawl

---

## Autonomous Agents (After Deployment)

For local development / long-running background mode:
```bash
bash autonomous/start-autonomous.sh
```

For production: Vercel Cron handles the regulatory crawler automatically (configured in `vercel.json`).
The brief generator and content updater run as separate cron jobs — add them to `vercel.json` if still on a plan that supports multiple crons, or trigger manually on the schedule.

**Vercel cron limits**:
- Hobby: 2 cron jobs
- Pro: unlimited

If on Hobby plan, priority order for cron jobs:
1. Regulatory crawler (every 6h) — most critical
2. Brief generator (Monday 06:00) — core product

Content updater and SEO monitor can run via the autonomous shell script locally, or be added to crons when upgrading to Pro.

---

## Monitoring

**Week 1 checks** (do manually):
- [ ] Vercel cron logs show crawler running every 6 hours
- [ ] `src/data/regulatory-updates.json` has entries (crawler is finding data)
- [ ] Monday brief send shows >0 recipients in brief JSON
- [ ] Plausible dashboard shows page views
- [ ] No TypeScript/build errors in Vercel deploy logs

**Ongoing**:
- Check `.ruflo/logs/crawler.log` weekly for persistent source errors
- Check `src/data/crawler-errors.json` — if the same source is failing repeatedly, the site structure may have changed
- Review brief quality before Monday send (the agent writes the brief; you should read it before it sends)

**To review brief before send** (manually gate it):
Remove the auto-send step from `brief-generator.md` and manually run:
```bash
curl -X POST http://localhost:3000/api/brief/send \
  -H "Authorization: Bearer $CRON_SECRET" \
  -H "Content-Type: application/json" \
  -d '{"briefDate": "2026-04-06"}'
```
After you've reviewed the brief JSON at `src/data/briefs/[date].json`.
