# Zawda — Strategic Positioning Memo

**Audience:** Corporate development at a blockchain-intelligence / crypto-compliance acquirer (Chainalysis, TRM Labs, Elliptic) or a MENA-expanding platform.
**Status:** Draft for internal use. Figures marked `[confirm]` must be validated before external use.

> **Integrity guardrail.** Every claim here is written to survive tier-1 technical and legal diligence. Capabilities not yet built are labelled roadmap/PoC; the CBB relationship is described exactly as its letter reads (in-principle, then withdrawn — never "approved"). Overstating anything ends the process rather than raising the price.

---

## 1. One-line positioning

**Zawda is the MENA regulatory-localization layer for agentic compliance** — FIU-specific reporting (CBB / VARA / ADGM goAML), a structured Gulf jurisdiction dataset, and a founder with direct Gulf-regulator experience — with working agent tooling as proof of build capability.

It is **not** a wallet, **not** a novel enforcement engine, and **not** a custodian. The scarce, defensible thing is the **domain + relationships localized to the Gulf**, not the tooling.

---

## 2. Why this framing (the market moved)

Agentic payments is the defining 2026 race, and the generic layers are already crowded and well-funded:

- **Agent spend-controls / policy enforcement is commoditizing** — shipped by Coinbase Agentic Wallets, MetaMask Agent Wallet (Jun 2026), Circle Agent Stack, AWS Bedrock AgentCore, plus Fystack (policy-before-signing, open-sourced) and Locus (YC).
- **Compliance agents are owned by the incumbents** — TRM Agents (TRM is now a $1B unicorn), Elliptic AI Copilot (Series D, $120M at $670M, May 2026), and Chainalysis blockchain-intelligence agents (Links, summer-2026 rollout).
- **The one empty quadrant is MENA-native agentic compliance.** Everyone above is US/EU-centric; MENA players (Antier, Endida, AML Incubator, ACX, Defy) are consultancies/white-label, not agentic products.

Demand there is regulator-mandated, not speculative: **VARA now operationally requires** always-on transaction monitoring, automated suspicious-activity detection, auditable case management, and instant UAE-FIU freeze response — "policy documents are not sufficient." That is close to a spec for what Zawda built.

---

## 3. What Zawda actually is — honest tiers

### 3a. The moat (headline)
- **MENA localization:** FIU-specific SAR/STR drafting (CBB / VARA / ADGM goAML), a structured jurisdiction dataset (VARA, ADGM, CBB, CMA, QFC…), and Arabic-first depth — the layer no global player has and cannot build quickly to enter the Gulf.
- **Regulator experience & track record:** the founder took a Category 2 CASP application to a **Governor-signed CBB in-principle confirmation** (then deliberately withdrew it — see §5).

### 3b. Proof of build capability (not the differentiator)
- Two working, audited agents: a transaction-**enforcement** agent (`/agent-controls`) and a **compliance-analyst** agent that automates alert triage → FIU-specific SAR drafting → tamper-evident audit (`/agent-controls/triage`). Runnable: `npx tsx scripts/agent-controls-demo.ts` and `scripts/compliance-workflow-demo.ts`.
- A documented, gated **v1 API** — the recommendation engine plus a **provenanced regulatory corpus** (`/api/v1/corpus`: regulations, enforcement, obligations, effective dates, control mappings, and jurisdiction/licence taxonomies, each with a verification status). Seeded with real sourced data; an ingestion pipeline (not AI generation) fills the rest.
- These demonstrate the "builder" leg of the trusted-data × domain × builder trifecta — they are evidence, not the pitch.

### 3c. Trusted data
- Real OFAC SDN screening today, behind a pluggable interface into which a live KYT provider (Chainalysis / TRM / Elliptic) drops unchanged.

---

## 4. Buyer fit — run a shortlist, don't single-thread

| Buyer | Why the MENA layer matters | The specific asset they'd buy |
|---|---|---|
| **Chainalysis** | MENA-light; publicly invited builders (Levin, Links 2026) | Regional expansion + customer distribution + regulatory workflows complementing their on-chain data |
| **TRM Labs** | $1B unicorn, developer-first, expanding coverage | Government/regulator relationships + investigations & **training** — their CSITech acquisition was for investigative expertise and training, *not* compliance software |
| **Elliptic** | Series D, agentic Copilot, government-facing | Jurisdictional risk intelligence + sanctions/typology research + integrations around their blockchain analytics |
| **MENA-expanding platforms** | Coinbase (Dubai/VARA); regional exchanges under VARA's mandate | The compliance operating layer VARA now operationally requires |

*Distribution (active VASP customers) and regional authority (named experts, original analysis) strengthen every one of these — but they are founder-led, not product; see §8.*

Chainalysis stays primary, but the MENA asset is valuable to all three intelligence majors — that optionality is your leverage.

---

## 5. The CBB relationship (confidential — never "approved")
A Governor-signed CBB **in-principle confirmation** (OG/156/2025, 3 Jun 2025) to proceed with licensing for a **Category 2 CASP**, in the name of *Zawda W.L.L. (under formation)* — **an entity that was never actually incorporated.** The founder **withdrew the application in March 2026** on pivoting off the custody-inclusive model. Value: proof of regulatory-execution capability **and** a deliberate move off custody. It is confidential (share only under NDA), and must never be represented as an approval or licence. See [cbb-approval-factsheet.md](cbb-approval-factsheet.md).

---

## 6. Corporate & deal framing
- **Sole entity:** **MENA Lightning Network, Inc.** — Delaware C-corp (inc. 23 Mar 2023, 10M authorized shares); business-classified as software (IRS code 541512); foreign-owned (Form 5472); pre-revenue (2024 net loss). No Bahrain entity exists. See [cap-table.md](cap-table.md).
- **Financing:** $450k raised — Axiom Venture Fund I LP ($200k, $5M post-money cap) + Wolf/In Wolfs Clothing Investments LLC ($250k).
- **This is an acqui-hire / regional-IP + talent deal**, not a strategic-platform acquisition. Price and narrate it accordingly — the scarce asset is Gulf domain × builder, and it is **time-sensitive** (the moat depreciates as the majors enter the Gulf).

---

## 7. What we are deliberately NOT claiming
- The enforcement engine is **not** novel defensible IP (the field, incl. open-source Fystack, has caught up) — it is proof-of-capability.
- No live KYT integration yet — roadmap, labelled as such.
- The CBB relationship is in-principle **and withdrawn** — never an approval/licence; the Bahrain entity was never formed.
- Pre-revenue — commercial proof is being assembled via design partners / LOIs.

---

## 8. Before outreach — must be true
1. **IP assignment** — confirm all code (incl. contractor / AI-assisted) is assigned to MENA Lightning Network, Inc. *(Only remaining entity item — no Bahrain relationship to resolve.)*
2. **≥1 MENA design partner / LOI** — the single biggest valuation lever for a pre-revenue, commoditized-tech profile.
3. **Buyer shortlist + warm paths** — Chainalysis / TRM / Elliptic, ideally a warm intro to at least one corp-dev team.
