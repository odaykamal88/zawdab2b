# agents/02-BACKEND-CRAWLER.md — Backend + Crawler Team Lead

You are running the Backend + Crawler team. Five agents report to this file: be-api, be-crawler, be-cache, be-auth, be-email.
Read AGENTS.md for file ownership boundaries. Every API endpoint follows the `{ data, meta }` contract — no exceptions.

---

## The Crawler Architecture

The crawler is the core product value. It must run autonomously, detect regulatory changes, and feed the intelligence pipeline.

### Shared Types (define in `src/types/regulatory.ts`)

```typescript
export type RegulatorySource = 'VARA' | 'ADGM' | 'CBB' | 'FSRA' | 'SCA' | 'FATF'
export type ChangeType = 
  | 'new_circular' 
  | 'license_added' 
  | 'license_revoked' 
  | 'fine_issued' 
  | 'framework_update'
  | 'deadline_approaching'
export type Severity = 'critical' | 'high' | 'medium' | 'low'

export interface RegulatoryUpdate {
  id: string                    // sha256 of (source + url + detectedAt)
  source: RegulatorySource
  jurisdiction: string          // 'UAE' | 'Bahrain' | 'Saudi Arabia' | etc.
  title: string
  summary: string               // 2-3 sentence plain-English summary
  url: string                   // direct link to the source document/page
  detectedAt: string            // ISO 8601
  changeType: ChangeType
  severity: Severity
  affectedEntities?: string[]   // entity names if fine_issued or license_revoked
  actionRequired?: string       // what compliance officers should do
  deadline?: string             // ISO 8601 if there's a hard date
}

export interface ApiResponse<T> {
  data: T
  meta: {
    source: string
    timestamp: string
    crawledAt?: string
    cached: boolean
  }
}
```

---

## Crawler Targets and Methods

### VARA (vara.ae)
```
Licensed entities list:  https://www.vara.ae/en/licensing/register/
News/circulars:          https://www.vara.ae/en/news/
```
**Parse method**: `cheerio` — fetch HTML, parse the entities table. Hash the full table text.
**What to detect**: New rows (license_added), missing rows (license_revoked), news items (new_circular).
**Known structure**: Licensed register is an HTML table. News page is a list of articles with dates.

### ADGM (adgm.com)
```
Press releases:          https://www.adgm.com/media/news
Regulations:             https://www.adgm.com/regulations
FSRA virtual assets:     https://www.adgm.com/fsra/regulatory-framework/virtual-assets
```
**Parse method**: `cheerio` — extract article headlines + dates from press releases. Filter for keywords: "virtual asset", "crypto", "digital asset", "enforcement", "fine".
**What to detect**: New press releases mentioning digital assets.

### CBB (cbb.gov.bh)
```
Regulations:             https://www.cbb.gov.bh/regulations/
Licensing register:      https://www.cbb.gov.bh/financial-institutions/
```
**Parse method**: `cheerio` — parse regulation documents list. Check for new CBB modules related to crypto/virtual assets. CBB Module CA (Crypto-asset module) is the primary target.
**What to detect**: New modules, amendments, new licensed entities.

### FSRA (within ADGM)
```
Virtual asset guidance:  https://www.adgm.com/fsra/regulatory-framework/virtual-assets
Rulebook:                https://rulebook.adgm.com/en/virtual-assets
```
**Parse method**: Fetch the FSRA virtual assets page. Hash all text content.
**What to detect**: Page content changes indicating updated guidance or new frameworks.

### SCA (sca.gov.ae) — Abu Dhabi federal level
```
Regulations:             https://www.sca.gov.ae/en/legislation/regulations.aspx
News:                    https://www.sca.gov.ae/en/media/news.aspx
```
**Parse method**: `cheerio` — parse regulation listing. Filter for digital asset-related titles.
**What to detect**: New regulations or circulars mentioning crypto/virtual assets/tokenization.

### FATF (fatf-gafi.org)
```
MENA region:             https://www.fatf-gafi.org/en/regions/menafatf.html
Travel Rule:             https://www.fatf-gafi.org/en/topics/virtual-assets.html
```
**Parse method**: Fetch the virtual assets topic page. Check for new guidance papers.
**What to detect**: New Travel Rule updates, mutual evaluation reports for MENA countries.

---

## Crawler Implementation

### Cron Route: `src/app/api/cron/crawl-regulatory/route.ts`

```typescript
import { NextResponse } from 'next/server'
import { crawlAllSources } from '@/lib/crawlers'
import { cache } from '@/lib/cache'

export const maxDuration = 300 // 5 min timeout on Vercel

export async function GET(request: Request) {
  // Verify Vercel cron secret header in production
  const authHeader = request.headers.get('authorization')
  if (process.env.CRON_SECRET && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  
  const results = await crawlAllSources()
  return NextResponse.json({ 
    crawledAt: new Date().toISOString(),
    newUpdates: results.newUpdates.length,
    errors: results.errors
  })
}
```

### vercel.json
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

### Change Detection Pattern

```typescript
// src/lib/crawlers/utils.ts
import { createHash } from 'crypto'
import { cache } from '@/lib/cache'

export async function hasContentChanged(
  source: string, 
  content: string
): Promise<{ changed: boolean; hash: string }> {
  const hash = createHash('sha256').update(content).digest('hex')
  const cacheKey = `crawler:hash:${source}`
  const storedHash = await cache.get<string>(cacheKey)
  
  if (storedHash === hash) return { changed: false, hash }
  
  await cache.set(cacheKey, hash, 60 * 60 * 24 * 7) // 7-day TTL on hashes
  return { changed: true, hash }
}
```

### Error Handling
- HTTP 403 or 429 → log and skip that source; DO NOT retry in the same run
- Timeout after 30s per source (use `AbortController`)
- Log all errors to `src/data/crawler-errors.json` with timestamp and source
- Never let a single source failure crash the entire crawl run

### Writing Updates
```typescript
// Pattern for writing to regulatory-updates.json
import { readFileSync, writeFileSync } from 'fs'
import { join } from 'path'

const DATA_PATH = join(process.cwd(), 'src/data/regulatory-updates.json')

export function appendUpdates(newUpdates: RegulatoryUpdate[]): void {
  const existing: RegulatoryUpdate[] = JSON.parse(readFileSync(DATA_PATH, 'utf-8'))
  const existingIds = new Set(existing.map(u => u.id))
  const toAdd = newUpdates.filter(u => !existingIds.has(u.id))
  writeFileSync(DATA_PATH, JSON.stringify([...toAdd, ...existing], null, 2))
}
```

---

## Exchange Fee Data

**File**: `src/data/exchanges.json`

All figures must have a `sourceUrl` and `lastVerified` date. Do NOT publish figures without a source.

```typescript
interface Exchange {
  id: string
  name: string
  jurisdiction: string
  varaLicensed: boolean
  cbbLicensed: boolean
  tradingFeePercent: number       // maker/taker average
  spreadPercent: number           // estimated typical spread
  cardDepositFeePercent: number
  btcWithdrawalFeeUSD: number
  allInCostPercent: number        // = tradingFee + spread + effective deposit cost
  sourceUrl: string
  lastVerified: string            // ISO date
  notes: string
}
```

**Known verified data** (use as starting point — verify and update):
- **Rain**: trading fee ~0%, spread ~1.5-2%, card deposit 2.1%, BTC withdrawal ~$35-40. All-in: ~2.5-3.5% depending on payment method.
  Source: Rain fee schedule (https://rain.com/fees) — verify current figures before publishing.
- **BitOasis**: trading fee 0% (Lite) with ~0.8-1% spread, card deposit 3.5%, BTC withdrawal ~$42. All-in card: ~7.1%.
  Source: BitOasis fee page — verify.
- **OKX UAE**: maker 0.08%, taker 0.1%, spread ~0.1%, card deposit 1.8%. All-in: ~2.1%. Cheapest option.
  Source: OKX fee schedule — verify.
- **Binance UAE**: maker 0.1%, taker 0.1%, spread ~0.1%, card deposit 4.5%. All-in: ~6.6%.
  Source: Binance fee page — verify.
- **CoinMENA**: VARA licensed. Spread-based model. Verify current figures.
- **Bybit Dubai**: VARA licensed (VASP). Verify current fee structure.

**Rule**: Set `varaLicensed: true` only if the entity appears on vara.ae/en/licensing/register.

---

## BTC Treasury Tracker Data

**File**: `src/data/btc-treasury.json`

```typescript
interface BTCTreasury {
  company: string
  country: string
  btcHeld: number               // number of BTC
  approximateUSDValue?: number  // at time of disclosure
  disclosureDate: string        // ISO date
  disclosureType: 'company_filing' | 'press_release' | 'bloomberg_report' | 'regulatory_filing'
  disclosure: string            // URL or description of primary source
  notes?: string
}
```

**Known MENA entries** (verify before publishing):
- Phoenix Group Holdings (UAE) — publicly traded on ADX, BTC on balance sheet. Check latest filing.
- Samara Asset Group (Bahrain operations) — verify current holdings.
- Any MENA-headquartered company that has publicly announced BTC treasury allocation.

**Rules**:
- Only include confirmed public disclosures — no rumors, no unverified reports.
- Update `approximateUSDValue` based on BTC price at disclosure date, not current price.
- Tag entries from current week to enable "new this week" flag in the tracker UI.

---

## API Response Contract

Every `src/app/api/` route handler must return this shape:

```typescript
// Correct:
return NextResponse.json({
  data: exchangeList,
  meta: {
    source: 'src/data/exchanges.json',
    timestamp: new Date().toISOString(),
    crawledAt: lastCrawlTimestamp,
    cached: wasCacheHit
  }
})

// Incorrect (missing meta):
return NextResponse.json(exchangeList)
```

Cache all responses at the route handler level using `cache.getOrFetch()`.

---

## Email Architecture (be-email)

### Resend Setup
```typescript
// src/lib/email/index.ts
import { Resend } from 'resend'
export const resend = new Resend(process.env.RESEND_API_KEY)
```

### Subscriber Route: `POST /api/subscribe`
```typescript
// Body: { email: string, company?: string, role?: string }
// Actions:
//   1. Add to Resend audience (weekly-brief list)
//   2. Append to src/data/leads.csv
//   3. Send welcome email via Resend
// Response: { success: true } or { error: string }
```

### Brief Send Route: `POST /api/brief/send`
```typescript
// Protected: requires CRON_SECRET header
// Body: { briefDate: string } — e.g. "2026-04-07"
// Actions:
//   1. Read src/data/briefs/[briefDate].json
//   2. Render brief email template
//   3. Send to all Resend 'intelligence' audience contacts
//   4. Log send timestamp to brief file
```

### Welcome Email Template (plain text fallback required)
Subject: `Welcome to the MENA Digital Asset Brief`
Body: Brief intro + link to latest brief + "What to expect every Monday" + unsubscribe link.

### Weekly Brief Email Template
Subject: `[BrandName] Brief — [Date]: [brief.headline]`
Body: brief.summary → brief.updates (formatted) → brief.actionItems → brief.sources → unsubscribe.
Max width: 600px. Dark background version and light version (respect email client dark mode).
