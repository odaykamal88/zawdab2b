# Zawda — Acquisition Data Room (index)

> **CONFIDENTIAL.** Prepared for a prospective acquirer under NDA. Contains material non-public information — a (withdrawn) CBB in-principle confirmation and cap-table/SAFE terms. Warehouse only in a **private** repository (`odaykamal88/zawdab2b` is private). Raw source documents (the CBB letter, executed SAFEs, UBO/personal files) are **kept out of git** and live in the secure file store — this repo holds summaries and references only.

## Contents
| Doc | What it is |
|---|---|
| [positioning-memo.md](positioning-memo.md) | Strategic thesis — MENA-native agentic compliance; buyer-agnostic (Chainalysis / TRM / Elliptic) |
| [why-acquire.md](why-acquire.md) | Buyer-agnostic one-pager — the MENA gap + buyer fit |
| [competitive-landscape.md](competitive-landscape.md) | The agentic compliance/payments field (mid-2026) and where Zawda sits |
| [cbb-approval-factsheet.md](cbb-approval-factsheet.md) | CBB in-principle confirmation (Category 2 CASP) — **application withdrawn Mar 2026**; represented accurately with caveats |
| [cap-table.md](cap-table.md) | Financing summary — Axiom + Wolf SAFEs (issuer: MENA Lightning Network, Inc., Delaware); entity-structure flag |
| [architecture.md](architecture.md) | System architecture, stack, security posture, known issues |
| [api.md](api.md) | v1 API reference (dataset + recommendation engine as a module) |
| Agent Controls PoCs | Enforcement agent (`/agent-controls`) + compliance-analyst triage agent (`/agent-controls/triage`); run `npx tsx scripts/agent-controls-demo.ts` and `scripts/compliance-workflow-demo.ts` |
| Provenance coverage | `npx tsx scripts/provenance-report.ts` (7/15 jurisdictions source-linked) |
| Regulatory corpus (API) | `/api/v1/corpus` (gated) — provenanced dataset; `npx tsx scripts/corpus-coverage.ts` (11 items, 5 primary-verified, 3 flagged) |

## Corporate & IP
- **Entity (sole):** **MENA Lightning Network, Inc.** — Delaware C-corp (inc. 23 Mar 2023, 10M shares; 2024/2025 Form 1120; software-classified 541512; pre-revenue). **Zawda W.L.L. (Bahrain) was never incorporated** — no Bahrain entity exists. Remaining: IP assignment to the Delaware co — see [cap-table.md](cap-table.md).
- **Founder:** Oday Kamal (solo founder).
- **IP ownership — action required:** confirm that all code (including AI-assisted and any contractor work) is assigned to the entity, with signed IP-assignment/contractor agreements. Solo-founder deals get re-priced when IP provenance is unclear.
- **Cap table:** [cap-table.md](cap-table.md) — Axiom ($200k, $5M cap) + Wolf ($250k, confirmed) = **$450k raised**. Produce a fully-diluted, as-converted table.

## Verified & complete (this branch)
- ✅ **Integrity pass** — fabricated enforcement entities/stats removed; vaporware features labelled; false "zero-knowledge" claim corrected; dormant false "CBB Category 3 provisional license" line corrected.
- ✅ **Positioning** — MENA-first, buyer-agnostic (Chainalysis / TRM / Elliptic); landscape-aware; CBB represented exactly per the letter.
- ✅ **Agent-controls PoC** — verified running (1 executed / 4 intercepted / 1 review; audit chain valid) and rendered in-browser.
- ✅ **v1 API** — verified live (jurisdictions 200; assess 503-gated until key set).
- ✅ **Compliance-analyst agent** — verified running (4 alerts → 1 dismiss / 1 escalate / 2 SAR; FIU-specific drafts; audit chain valid); demo at `/agent-controls/triage`.
- ✅ **Corporate** — Delaware C-corp confirmed (certificate of incorporation); $450k raise reconciled; unverified "3 companies licensed" and "21+ buyers / ~100 BTC" claims removed from code.
- ✅ **Regulatory corpus** — structured, source-provenanced dataset behind a gated API (`/api/v1/corpus`): regulations, enforcement, obligations, effective dates, control mappings, taxonomies. 11 seed items, all with provenance, 3 flagged for verification. Real data only — not AI-generated.

## 🚩 Open items / diligence checklist (ranked)
1. **IP assignment** — confirm all code (incl. contractor / AI-assisted) is assigned to MENA Lightning Network, Inc. *Highest priority.* (No Bahrain entity — Zawda W.L.L. was never incorporated; CBB withdrawn Mar 2026.)
2. **Biographical claims** — $450k raise evidenced ✓; unverified "3 companies licensed" and "21+ buyers / ~100 BTC" **removed** from code ✓. THNDR "early conversations" and the "first institutional-grade advisory in the region" superlative remain — verify or soften.
3. **IP-assignment confirmations** — signed agreements for all contributors.
4. **Entity/cap-table documents** — incorporation certificate, cap table, financing instruments.
5. **Data accuracy** — reconcile CBB CRA category descriptions in the dataset against the CRA Module; complete source-linking for the 8 unsourced jurisdictions.
6. **Tech hygiene** — clear stale `.next` route-type error; confirm Clerk production configuration (`clerk.zawda.me`).
7. **Certifications** — only claim SOC 2 / data-residency / PDPL/GDPR where actually backed; otherwise omit.

## Commercial (the structural gap)
Pre-revenue — the biggest valuation lever. Founder is assembling proof via **design partners / recyclable prior LOIs**. Positioning is now **MENA-first and buyer-agnostic** — the moat is MENA localization + relationships + speed, not the tooling (see [competitive-landscape.md](competitive-landscape.md)).
