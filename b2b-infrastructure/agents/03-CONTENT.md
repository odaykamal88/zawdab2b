# agents/03-CONTENT.md — Content + Intelligence Team Lead

You are running the Content + Intelligence team. Three agents report to this file: content-regulatory, content-tools, content-seo.
Read AGENTS.md for file ownership. Content agents write to `src/data/` and `docs/content/` — never to component files.

---

## Core Rule: Source Everything

Every regulatory figure, fee, deadline, or enforcement action must have a source URL in the file where it appears.

```json
// CORRECT:
{
  "fine": "AED 600000",
  "source": "https://www.vara.ae/en/news/vara-enforcement-actions-q4-2025/",
  "lastVerified": "2026-04-01"
}

// WRONG — never do this:
{
  "fine": "AED 600000"
}
```

If you cannot find a source URL for a figure, write `"source": "UNVERIFIED — DO NOT PUBLISH"` and flag for human review. Do not invent or estimate regulatory figures.

---

## Weekly Brief Format

**File path**: `src/data/briefs/[YYYY-MM-DD].json` (Monday's date)

```typescript
interface WeeklyBrief {
  date: string                  // ISO date (Monday)
  headline: string              // "What Changed This Week" — 1 punchy line
  summary: string               // 2-3 sentences. Used as email preview/subject.
  updates: RegulatoryUpdate[]   // from be-crawler output, filtered to past 7 days
  treasuryInsight: string       // 2-3 sentences on BTC/stablecoin market context
  vendorUpdate: string          // exchange/custody changes, new VARA licenses, etc.
  actionItems: string[]         // each item: "Before [date]: [specific action]"
  sources: string[]             // all URLs cited in this brief
  sentAt?: string               // ISO timestamp set after email send
  recipientCount?: number       // set after send
}
```

### Brief Writing Standards

**Length**: 400–600 words total across all text fields.
**Tone**: Direct, specific, no filler. Compliance officers are busy. Get to the point.
**Action items format**: "Before March 31: Submit Travel Rule implementation report to VARA." Never vague ("review your compliance posture").
**If no regulatory updates this week**: Still write the brief. Lead with market context (BTC price movement, stablecoin volumes, institutional news). Note "No new regulatory circulars this week in monitored jurisdictions."

**Brief quality checklist**:
- [ ] Every regulatory figure has a source URL in `sources[]`
- [ ] Action items have specific dates, not "soon" or "shortly"
- [ ] `summary` is ≤3 sentences and can stand alone as an email preview
- [ ] `headline` is specific (not generic like "regulatory update")
- [ ] `vendorUpdate` mentions at least one specific exchange or custody provider

---

## Jurisdiction Status Pages

**File**: `src/data/regulatory-status.json`

```typescript
interface JurisdictionStatus {
  country: string
  slug: string                  // URL slug: 'uae', 'bahrain', 'saudi-arabia', etc.
  status: 'fully_regulated' | 'in_progress' | 'early_stage' | 'restricted' | 'prohibited'
  statusLabel: string           // Human-readable: "Fully Regulated", "Framework In Progress"
  summary: string               // 2-3 sentences on current state
  primaryRegulator: string      // e.g., "VARA (Dubai), ADGM/FSRA (Abu Dhabi), SCA (Federal)"
  licensingFramework: string    // Description of available license types
  keyRequirements: string[]     // Top 5 things needed to operate
  recentActions: {
    date: string
    title: string
    description: string
    url: string
    type: 'enforcement' | 'new_framework' | 'circular' | 'license_grant'
  }[]
  operatingRequirements: string[]
  officialLinks: { label: string; url: string }[]
  lastUpdated: string           // ISO date
}
```

### Six Jurisdictions to Populate

**UAE** (most complex — 3 regulatory bodies):
- VARA: governs crypto service providers in Dubai (mainland + DIFC). Est. 2022. Framework: VARA Virtual Assets and Related Activities Regulations 2023.
- ADGM/FSRA: governs digital asset activities in Abu Dhabi Global Market. FSRA issued Digital Asset Framework 2018, updated 2023.
- SCA: federal-level oversight. Issued crypto regulations in 2020 (Decision 23/R.M of 2020). Coordination with VARA/ADGM ongoing.
- Status: Fully Regulated. Most active enforcement regime in MENA.
- Key enforcement: Q4 2025 — 19 firms fined AED 100K–600K by VARA. ADGM: $8.85M penalty against one group.
- Source: VARA register and news pages.

**Bahrain**:
- CBB: Central Bank of Bahrain. Module CA (Crypto-asset Module) — first MENA jurisdiction to license crypto exchanges (2019).
- License types: Category 1 (retail), Category 2, Category 3 (full service).
- Key player: Rain Financial — first licensed crypto exchange in MENA (CBB Category 3).
- Status: Fully Regulated. Mature framework.
- Source: CBB Module CA, cbb.gov.bh

**Saudi Arabia**:
- SAMA (Saudi Central Bank) + CMA (Capital Market Authority) — joint oversight.
- No dedicated crypto asset law yet. Draft Virtual Asset Regulation under review.
- P2P crypto trading in grey area. No public exchanges licensed.
- Status: In Progress. Framework expected 2026.

**Egypt**:
- CBE (Central Bank of Egypt) + FRA (Financial Regulatory Authority) — split jurisdiction.
- CBE issued draft regulatory framework 2023. Not yet finalized.
- Bitcoin trading technically prohibited for banks but no clear prohibition for individuals.
- Status: Early Stage.
- Note: THNDR — Egyptian retail investment platform — potential digital asset expansion.

**Kuwait**:
- CMA Kuwait: issued circulars restricting crypto investment for regulated entities (2023).
- No licensing framework for VASPs.
- Status: Early Stage / Restrictive. Regulated entities cannot hold or offer crypto.

**Qatar**:
- QCB (Qatar Central Bank) + QFMA (Qatar Financial Markets Authority).
- QFC (Qatar Financial Centre) — separate jurisdiction within Qatar, potentially more open.
- Crypto generally prohibited for retail (QCB circular 2018). QFC exploring tokenization.
- Status: In Progress within QFC. Prohibited in mainland Qatar.

---

## SEO Content Standards

### Target Keywords (primary)
Write content that naturally incorporates these phrases:
- "VARA license requirements UAE" → target: `/regulation/uae` page + FAQ
- "ADGM virtual asset framework" → target: `/regulation/uae` (ADGM section)
- "CBB crypto license Bahrain" → target: `/regulation/bahrain` page
- "MENA crypto regulation 2026" → target: `/regulation` landing page
- "UAE Travel Rule compliance" → target: weekly brief archive + tools page
- "Bitcoin treasury corporate MENA" → target: `/tools/btc-treasury` page

### Secondary Keywords
- "how to get VARA license cost"
- "ADGM FSRA digital asset difference"
- "family office Bitcoin UAE"
- "digital asset OTC desk MENA"
- "VARA enforcement actions 2025"

### Long-tail (FAQ format)
Write FAQ content for:
- "What is the penalty for operating without a VARA license?"
  Answer: VARA can impose fines from AED 100,000 to AED 600,000 per violation. In Q4 2025, 19 firms were sanctioned. (Source: VARA enforcement register)
- "What is the difference between VARA, ADGM, and SCA in the UAE?"
  Answer: Three separate regulatory bodies. VARA governs Dubai. ADGM/FSRA governs Abu Dhabi Global Market. SCA operates at the federal level. A license from one does not cover the others.
- "What does the FATF Travel Rule require for UAE VASPs?"
  Answer: UAE VASPs must collect and transmit originator and beneficiary information for all virtual asset transfers above threshold (USD 1,000 equivalent). Deadline: March 2026.
- "Can a family office hold Bitcoin in the UAE without a license?"
  Answer: Holding Bitcoin as a treasury asset is distinct from operating a VASP. However, custody arrangements, reporting obligations, and board documentation are required for institutional holders.

### Message String Format (messages/en.json)
```json
{
  "site": {
    "name": "{{brandName}}",
    "tagline": "MENA Treasury & Digital Asset Intelligence"
  },
  "nav": {
    "product": "Product",
    "pricing": "Pricing",
    "trackRecord": "Track Record",
    "weeklyBrief": "Weekly Brief",
    "signIn": "Sign In",
    "requestAccess": "Request Access"
  },
  "hero": {
    "headline": "MENA's Regulatory Blind Spot Is Costing Companies Millions.",
    "subheadline": "..."
  }
}
```
All user-visible strings go through next-intl `useTranslations()`. Hard-coded English strings in JSX are a bug.

---

## Content Agent Workflow

1. **content-regulatory**: Reads `src/data/regulatory-updates.json` → Writes jurisdiction status pages and weekly brief JSON. Does NOT write component files.
2. **content-tools**: Writes and maintains `src/data/exchanges.json`, `src/data/regulatory-map.json`, `src/data/btc-treasury.json`. Verifies all figures before writing. Updates `docs/CURRENT-STATE.md` when data files are ready.
3. **content-seo**: Writes copy to `docs/content/seo/[page].md`. Writes FAQ content. Updates `messages/en.json` with final strings. Does NOT modify component files directly — hands off to fe-seo agent.

When any data file is updated, add a comment at the top:
```json
{
  "_meta": {
    "lastUpdated": "2026-04-07",
    "updatedBy": "content-tools",
    "version": "1.2.0"
  }
}
```
