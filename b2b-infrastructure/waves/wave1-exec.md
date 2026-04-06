# Wave 1 Exec — Marketing Site + Data APIs
Model: sonnet | Skip: CLAUDE.md, AGENTS.md | Read: agents/01-FRONTEND.md, agents/02-BACKEND-CRAWLER.md

## Context
The Next.js project has been scaffolded (see orchestration/LAUNCH-SEQUENCE.md pre-spawn steps).
Reference prototype is at `docs/reference/` — use it for copy, structure, and design tokens.
Data files do not exist yet. APIs read from JSON files (no external services needed in Wave 1).

## Tasks (complete in this order)

### 1. fe-design — Design System Foundation
Set up the complete token system before anything else.

- Copy CSS variables from `docs/reference/style.css` into `src/styles/globals.css`
- Extend `tailwind.config.ts` with full color palette, font families, and type scale
- Create `src/lib/brand.ts` with `BRAND_NAME` export
- Create `src/components/ui/BrandName.tsx` (reads from `NEXT_PUBLIC_BRAND_NAME` env)
- Create `src/components/ui/AlertBar.tsx` (red bar, dismissible, localStorage-persisted)
- Create `src/components/ui/Skeleton.tsx` (animated pulse skeleton, no spinners anywhere)
- Create `src/components/ui/Button.tsx` with variants: primary (gold), ghost, outline
- Load Cabinet Grotesk + Satoshi from Fontshare CDN in `src/app/layout.tsx`
- Load JetBrains Mono from Google Fonts in `src/app/layout.tsx`
- Wire dark/light theme toggle via `data-theme` attribute on `<html>`

Verify: Storybook or a test page at `/test-design` showing all tokens, both themes, all button variants.

### 2. fe-marketing — Full Marketing Page (all 10 sections)
Build after fe-design is complete. All 10 sections, real copy, no placeholders.

- Implement sections 1–10 exactly as specified in agents/01-FRONTEND.md
- Use real regulatory numbers: AED 600K (VARA Q4 2025), $8.85M (ADGM), March 2026 (Travel Rule)
- Include source URLs as comments above each stat: `{/* Source: vara.ae/news — Q4 2025 enforcement */}`
- Wire "Subscribe" form to POST `/api/subscribe` (handle loading/error states via state — no spinner, use button loading text)
- Wire "Request Access" to open a modal (build `src/components/conversion/RequestAccessModal.tsx`)
- RequestAccessModal posts to POST `/api/leads`
- All `track()` calls wired per agents/04-GROWTH.md event taxonomy
- MENA network visualization: implement the SVG node animation from the prototype (see `docs/reference/index.html`)
- Smooth-scroll navigation with anchor IDs on each section

Verify: `localhost:3000` renders all 10 sections. Real copy throughout. Both themes work. Mobile at 375px has no horizontal overflow.

### 3. fe-seo — Basic Meta Tags + Organization Schema
Wire after marketing page renders.

- Export `metadata` from `src/app/[locale]/(marketing)/page.tsx` with title, description, OG tags
- Add JSON-LD Organization schema in `src/app/layout.tsx`
- Create `src/app/sitemap.ts` with static routes (add dynamic routes in Wave 2)
- Create `src/app/robots.ts`

Verify: View source shows `<title>` and `<meta name="description">`. Paste URL into opengraph.xyz — OG preview renders.

### 4. be-api — Three Data API Routes
Build after data files exist (task 5 can run in parallel).

- `GET /api/regulatory/status` → read `src/data/regulatory-status.json`, return `{ data, meta }`
- `GET /api/tools/exchanges` → read `src/data/exchanges.json`, return `{ data, meta }`
- `GET /api/tools/btc-treasury` → read `src/data/btc-treasury.json`, return `{ data, meta }`
- Wire Upstash Redis caching via `cache.getOrFetch()` (TTLs: regulatory 6h, exchanges 24h, btc 1h)
- Add `X-Cache: HIT|MISS` response header for debugging
- TypeScript types must match data shapes — define in `src/types/`

Verify: `curl localhost:3000/api/tools/exchanges` returns `{ data: [...], meta: { source, timestamp, cached } }`. Second request shows `X-Cache: HIT`.

### 5. content-tools — Populate All Three Data Files (run in parallel with task 4)
Build `src/data/regulatory-status.json`, `src/data/exchanges.json`, `src/data/btc-treasury.json`.

- `regulatory-status.json`: 6 jurisdictions (UAE, Bahrain, Saudi Arabia, Egypt, Kuwait, Qatar) per schema in agents/03-CONTENT.md
- `exchanges.json`: 6+ exchanges (Rain, BitOasis, OKX UAE, Binance UAE, CoinMENA, Bybit Dubai) — verify each fee figure, include sourceUrl
- `btc-treasury.json`: MENA companies with publicly confirmed BTC holdings — include disclosure URL for each

**Critical rule**: Every fee figure in exchanges.json must have a `sourceUrl`. Every BTC holding entry must have a `disclosure` field. No invented figures.

After writing files, add `_meta` block at top of each file (see agents/03-CONTENT.md format).

Verify: JSON files are valid (run `node -e "JSON.parse(require('fs').readFileSync('src/data/exchanges.json','utf8'))"` for each). Every exchange entry has `sourceUrl`. Every BTC entry has `disclosure`.

---

## Boundaries (do NOT build in Wave 1)
- Do NOT build the regulatory crawler (Wave 2)
- Do NOT build auth or the dashboard (Wave 3)
- Do NOT build individual tool pages (`/tools/*`) — only the marketing page tool preview mockups
- Do NOT integrate external data APIs — all data comes from local JSON files

## Done When
- [ ] `localhost:3000` renders the full marketing page (all 10 sections, real copy)
- [ ] Both dark and light themes work correctly
- [ ] Mobile layout at 375px has no horizontal overflow
- [ ] `curl localhost:3000/api/tools/exchanges` returns `{ data, meta }` with exchange data
- [ ] `curl localhost:3000/api/regulatory/status` returns 6 jurisdictions
- [ ] View source shows title and meta description
- [ ] `npm run build` zero errors
- [ ] `npm run lint` clean
- [ ] `tsc --noEmit` zero errors
