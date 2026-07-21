# Why acquire Zawda — one-pager

> **CONFIDENTIAL — under NDA.** Buyer-agnostic. Every capability is shipped in the repo or labelled roadmap/PoC.

## The thing you can't build quickly
**MENA-native agentic compliance.** In 2026 the generic layers are crowded — agent spend-controls are commoditized (Coinbase, MetaMask, Circle, AWS, Fystack, Locus) and compliance agents belong to the intelligence majors (TRM, Elliptic, Chainalysis). The **one empty quadrant is the Gulf**: FIU-specific reporting (CBB / VARA / ADGM goAML), a structured MENA jurisdiction dataset, Arabic-first depth, and a founder with direct Gulf-regulator experience. Global players are US/EU-centric; MENA incumbents are consultancies, not products.

Demand is **regulator-mandated**: VARA now requires always-on monitoring, automated suspicious-activity detection, auditable case management, and instant UAE-FIU freeze response — "policy documents are not sufficient."

## What's demonstrable today
- **Trusted data** — real OFAC screening, with a live KYT provider (yours) dropping into the same interface.
- **Domain** — FIU-specific SAR drafting + MENA jurisdiction data + a Governor-signed CBB in-principle track record (then a deliberate pivot off custody).
- **Builder** — two working, audited agents: transaction **enforcement** (`/agent-controls`) and a **compliance-analyst** that automates alert triage → SAR draft → audit (`/agent-controls/triage`). Run: `npx tsx scripts/agent-controls-demo.ts`, `scripts/compliance-workflow-demo.ts`.
- **Structured corpus, not summaries** — a source-provenanced regulatory dataset (regulations, rulebooks, enforcement, obligations, effective dates, control mappings, taxonomies) behind a gated API (`/api/v1/corpus`), with verification status per item. Seeded with real, sourced data (`npx tsx scripts/corpus-coverage.ts`); the ingestion pipeline (not AI generation) fills the rest.

This is the **trusted-data × domain × builder** combination Chainalysis's CEO called "near impossible" to hire — localized to a region you don't yet cover.

## Buyer fit
| Buyer | The asset they'd actually be buying |
|---|---|
| **Chainalysis** | Regional market expansion + customer distribution + regulatory workflows that complement their on-chain data |
| **TRM Labs** | Government/regulator relationships + financial-crime intelligence + investigations & **training** — their [CSITech acquisition](https://www.trmlabs.com/resources/blog/trm-labs-acquires-uk-crypto-investigations-training-company-csitech) was for investigative expertise and training, *not* compliance software |
| **Elliptic** | Jurisdictional risk intelligence + sanctions/typology research + integrations around their blockchain analytics |
| **MENA-expanding platforms** | The compliance operating layer VARA now operationally requires |

## The ask
An **acqui-hire / regional-IP + talent** acquisition of the MENA localization layer, the agent tooling, and the founder — time-sensitive, as the moat depreciates while the majors enter the Gulf.

## Honest guardrails
- The enforcement engine is proof-of-capability, not novel defensible IP (the field has caught up).
- KYT integration is roadmap. The CBB relationship is in-principle **and withdrawn** — never an approval/licence.
- Sole entity: **MENA Lightning Network, Inc.** (Delaware); pre-revenue; $450k raised.

*See: [positioning-memo.md](positioning-memo.md), [competitive-landscape.md](competitive-landscape.md), [architecture.md](architecture.md).*
