# Wave 2 — Site Updates (Post-Feedback)
Model: sonnet | Skip: CLAUDE.md, AGENTS.md
Read: agents/01-FRONTEND.md, .ruflo/memory/taste-profile.md

## Context
Working from the static prototype at /home/user/workspace/zawda-b2b/
Apply all changes to index.html, style.css, app.js

---

## Change 1 — Assessment CTA → Free 30-Min Consultation

After the result card displays, replace the generic email capture CTA with:

**Primary CTA (gold button, large):**
"Book Your Free 30-Min Consultation →"
Links to: https://calendly.com/zawda (placeholder — use this exact URL, client will update)

**Secondary (below the button, small gray text):**
"Or enter your email to receive your compliance roadmap"
[email input] [Send Report →] (ghost button)

The consultation is the main action. Email capture is secondary.

Result card layout after assessment completes:
```
┌─────────────────────────────────────────┐
│  Your Compliance Readiness              │
│  ─────────────────────────────────────  │
│  [MEDIUM READINESS]  UAE — VARA         │
│  Exchange License                       │
│                                         │
│  Timeline:    12–18 months              │
│  Est. Cost:   AED 325,000–470,000       │
│                                         │
│  Top 3 gaps likely to need help with:   │
│  • Minimum capital AED 500K–4M          │
│  • AML/CFT policy (FATF-aligned)        │
│  • Technology architecture review      │
│                                         │
│  [Book Free 30-Min Consultation →]      │
│  (gold, full width button)              │
│                                         │
│  Or get your report by email:           │
│  [_____________] [Send →]               │
└─────────────────────────────────────────┘
```

---

## Change 2 — Regulatory Map as Separate Tab/Page

Add a second tab to the nav: "Reg Map" (between Assessment and Pricing)
This opens a separate section/page: /regulatory-map (or smooth-scroll to section)

### Regulatory Map — Full Table

A sortable, expandable table with one row per license type across all MENA jurisdictions.

Columns:
1. **Regulator** — logo/badge + name (VARA, CBB, ADGM/FSRA, SAMA, CMA-Egypt, SCA)
2. **Jurisdiction** — flag + countries that can operate under this license
3. **License Type** — e.g. "Virtual Asset Exchange", "Custody Provider", "Broker-Dealer"
4. **Difficulty** — pill badge: Easy / Medium / Hard / Very Hard
5. **Timeline** — "9–14 months"
6. **Min. Capital** — "AED 500,000" in JetBrains Mono
7. **Est. First-Year Cost** — advisory + application fees
8. **Licensed Entities** — count (e.g. "43 active")
9. **Last Updated** — date

Use this data (verified from research):

| Regulator | Jurisdiction | License | Difficulty | Timeline | Min Capital | Est. Cost | Licensed |
|---|---|---|---|---|---|---|---|
| VARA | Dubai + most UAE free zones | Virtual Asset Exchange | Very Hard | 12–18 mo | AED 4M | AED 325K–470K/yr | 47 |
| VARA | Dubai + most UAE free zones | Broker-Dealer | Hard | 9–14 mo | AED 2M | AED 250K–380K/yr | 31 |
| VARA | Dubai + most UAE free zones | Custody Provider | Very Hard | 12–18 mo | AED 4M | AED 280K–420K/yr | 18 |
| VARA | Dubai + most UAE free zones | Investment Manager | Hard | 9–14 mo | AED 1M | AED 200K–320K/yr | 22 |
| VARA | Dubai + most UAE free zones | Money Transmitter | Hard | 10–15 mo | AED 2M | AED 240K–350K/yr | 12 |
| CBB | Bahrain + GCC passporting | Category 3 Crypto Asset | Medium | 9–14 mo | BHD 200K | BHD 15K–45K | 19 |
| CBB | Bahrain + GCC passporting | Category 4 Crypto Asset | Medium | 6–10 mo | BHD 100K | BHD 10K–25K | 8 |
| ADGM/FSRA | Abu Dhabi financial free zone | Multilateral Trading Facility | Very Hard | 12–18 mo | USD 2M | USD 50K–120K | 11 |
| ADGM/FSRA | Abu Dhabi financial free zone | Investment Manager | Hard | 8–12 mo | USD 250K | USD 20K–50K | 34 |
| ADGM/FSRA | Abu Dhabi financial free zone | Custody Provider | Hard | 10–14 mo | USD 1M | USD 30K–80K | 9 |
| DIFC/DFSA | Dubai International Financial Centre | Crypto Token Exchange | Very Hard | 14–20 mo | USD 3M | USD 80K–150K | 7 |
| SCA | UAE Federal level | VASP License | Hard | 12–16 mo | AED 2M | AED 200K–400K | 28 |

Each row: click to expand → shows a panel below with:
- Full description of what this license allows
- Key requirements checklist (3-5 bullet points)
- Official regulator website link (opens new tab)
- Latest news feed for this regulator (2-3 items from /api/news filtered by regulator name)
- "Check my readiness for this license →" button (runs assessment pre-filled with this jurisdiction/license)

### Latest Regulatory News Feed (below the table)
3-column grid of regulatory update cards:
- VARA news: Source vara.ae/en/news
- CBB news: Source cbb.gov.bh
- ADGM news: Source adgm.com/news
Each card: source badge + headline + date + "Read more →" link to original
Static/curated for MVP — crawler fills this in Wave 3

---

## Change 3 — Bitcoin Treasury Calculator (separate tab)

Add third tab: "BTC Calculator"
This is the Time Machine / What If calculator from the retail app.

Reuse the concept from the existing wave specs at:
/home/user/workspace/waves/wave5b-timemachine-rebuild.md
/home/user/workspace/waves/wave7-feedback-round4.md

Simplified version for this B2B site:
- Question prompt: "What would a Bitcoin allocation have returned for your treasury?"
- Asset: Bitcoin (default, also add Gold, S&P 500, Crude Oil as comparisons)
- Inputs: Amount (in USD, AED, BHD), Start date or Major Event preset, Strategy (Lump Sum / DCA monthly)
- Major Event presets relevant to MENA treasury:
  [COVID Crash — Mar 2020] [BTC Halving — May 2020] [Aramco IPO — Dec 2019]
  [Gaza War — Oct 2023] [Iran-Israel Escalation — Apr 2024] [Fed Rate Cut — Sep 2024]
- Output: animated counter showing final value vs initial, % return, vs holding cash
- Chart: area chart showing BTC performance vs gold and S&P500 over the period
- Share card: "If [Company] had allocated $500K to BTC in [Event], it would be worth $X today"
- Source for historical BTC prices: CoinGecko free API (already integrated in main app)
- Source for gold/S&P500: yfinance (GC=F, ^GSPC)
- CTA below result: "Talk to us about Bitcoin treasury strategy →" → Calendly link

---

## Change 4 — Intelligence Plan is Free

Update pricing section:

| Tier | Price | Access |
|---|---|---|
| **Intelligence** | **Free** | Regulatory map, BTC calculator, exchange true cost tool, weekly regulatory digest (email) |
| **Advisory** | **$2,499/mo** | Everything free + monthly founder call + custom due diligence + vendor introductions + licensing roadmap |
| **Enterprise** | **Custom** | Everything Advisory + implementation support + white-label + API access |

Remove the $499/mo Intelligence tier entirely.
The free tier is the hook. Advisory is the conversion.

Update the pricing card copy:
Free card CTA: "Get Started Free →" (no credit card)
Advisory CTA: "Book a Call →" (Calendly link)
Enterprise CTA: "Contact Us →"

Update "One VARA fine = X months of Advisory" line:
"One VARA fine (AED 600,000 = ~$163,000) covers 5+ years of Advisory. The math is simple."

---

## Change 5 — Regulator + Company Quotes in Pain Section

Replace or augment the pain stat cards section with 3–4 quotes.
Place them BELOW the 3 stat cards as a horizontal scroll of quote cards.

Use these exact quotes (verified, sourced):

**Quote 1 — VARA (official statement):**
> "Operating virtual asset services without a VARA license constitutes a breach of UAE Law No. 4 of 2022 and may result in civil penalties of up to AED 10 million, public enforcement notices, and referral for criminal investigation."
— VARA Regulatory Framework, Virtual Assets and Related Activities Regulations 2023
Source: vara.ae

**Quote 2 — FSRA/ADGM (official principle):**
> "The FSRA intends to continue to impose a very high bar for authorisation as a virtual asset firm in the ADGM. It intends to only admit those that can meet its high standards — ADGM will be a venue for gold standard virtual asset firms only."
— FSRA Principles for Virtual Asset Regulation and Supervision, 2022
Source: adgm.com

**Quote 3 — UAE Federal Law (2026 update):**
> "Any business operating a crypto exchange, custody service, brokerage, portfolio management, or advisory platform in or from the UAE must hold a valid licence from the relevant regulator. A trade licence from any UAE free zone does not substitute for a virtual asset service licence."
— UAE Federal VASP Law, Decision No. 4/R.M/2026, February 2026
Source: neoslegal.co/uae-federal-crypto-regulations-explained/

**Quote 4 — Advisory firm on value of licensing:**
> "A VARA license is no longer optional for serious operators. Licensing ensures operational legitimacy, access to institutional partners, marketing privileges, and legal protection against fines or enforcement action."
— Neo Legal UAE, VARA License Guide 2025
Source: neolegal.ae

### Quote card design:
- White card, subtle shadow
- Large opening quotation mark in gold (#D69828), decorative, large (64px)
- Quote text in italic, black, 16px
- Below quote: source attribution (name + role/org) in gold small caps
- Source link: small external link icon, links to source URL
- Cards in a horizontal row on desktop, stack on mobile
- Swipeable on mobile (touch scroll)

---

## Execution Order

1. Pricing update (Free Intelligence tier) — fastest, 10 min
2. Assessment CTA → Calendly (2 changes in app.js + index.html)
3. Quotes section below pain stats
4. BTC Calculator tab (reuse concept from existing wave specs)
5. Regulatory Map tab (most complex — data table + expandable rows)

## Done When
- [ ] Assessment result shows "Book Free 30-Min Consultation" button linking to Calendly
- [ ] Intelligence tier shows "Free" not "$499/mo"
- [ ] 4 quote cards visible below the pain stat cards
- [ ] BTC Calculator tab renders with 6 event presets and result chart
- [ ] Regulatory Map tab renders full sortable table (12 rows minimum)
- [ ] Each table row expands to show requirements + official link
