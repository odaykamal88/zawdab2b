# Zawda — Acquisition Data Room (index)

> **CONFIDENTIAL.** Prepared for a prospective acquirer under NDA. Contains material non-public information — a (withdrawn) CBB in-principle confirmation and cap-table/SAFE terms. Warehouse only in a **private** repository (`odaykamal88/zawdab2b` is private). Raw source documents (the CBB letter, executed SAFEs, UBO/personal files) are **kept out of git** and live in the secure file store — this repo holds summaries and references only.

## Contents
| Doc | What it is |
|---|---|
| [positioning-memo.md](positioning-memo.md) | Strategic thesis — the agent-side enforcement layer that complements Chainalysis's intelligence |
| [cbb-approval-factsheet.md](cbb-approval-factsheet.md) | CBB in-principle confirmation (Category 2 CASP) — **application withdrawn Mar 2026**; represented accurately with caveats |
| [cap-table.md](cap-table.md) | Financing summary — Axiom + Wolf SAFEs (issuer: MENA Lightning Network, Inc., Delaware); entity-structure flag |
| [architecture.md](architecture.md) | System architecture, stack, security posture, known issues |
| [api.md](api.md) | v1 API reference (dataset + recommendation engine as a module) |
| Agent Controls PoC | Code: `src/lib/agent-controls/`; demo: `/agent-controls`; run: `npx tsx scripts/agent-controls-demo.ts` |
| Provenance coverage | `npx tsx scripts/provenance-report.ts` (7/15 jurisdictions source-linked) |

## Corporate & IP
- **Entities:** the SAFEs were issued by **MENA Lightning Network, Inc. (Delaware)**; the withdrawn CBB application was for **Zawda W.L.L. (Bahrain, under formation)**. **Clarify the relationship and which entity holds the IP / is being acquired** — see [cap-table.md](cap-table.md).
- **Founder:** Oday Kamal (solo founder).
- **IP ownership — action required:** confirm that all code (including AI-assisted and any contractor work) is assigned to the entity, with signed IP-assignment/contractor agreements. Solo-founder deals get re-priced when IP provenance is unclear.
- **Cap table:** summarized in [cap-table.md](cap-table.md) — Axiom Venture Fund I LP ($200k, $5M post-money cap) + Wolf ($250k/$750k option). Confirm Wolf's funded amount and produce a fully-diluted, as-converted table.

## Verified & complete (this branch)
- ✅ **Integrity pass** — fabricated enforcement entities/stats removed; vaporware features labelled; false "zero-knowledge" claim corrected; dormant false "CBB Category 3 provisional license" line corrected.
- ✅ **Positioning memo** — grounded in Chainalysis's real 2026 moves; CBB represented exactly per the letter.
- ✅ **Agent-controls PoC** — verified running (1 executed / 4 intercepted / 1 review; audit chain valid) and rendered in-browser.
- ✅ **v1 API** — verified live (jurisdictions 200; assess 503-gated until key set).

## 🚩 Open items / diligence checklist (ranked)
1. **Entity structure** — the SAFEs sit in MENA Lightning Network, Inc. (Delaware) while the CBB application was Zawda W.L.L. (Bahrain). Map the relationship, confirm where the IP lives and what is being acquired. *Highest priority.* (CBB standing is resolved: **application withdrawn Mar 2026** on the pivot off custody.)
2. **Evidence for biographical claims** — the **$450K raise is now evidenced** by the SAFEs (confirm Wolf amount). "3 companies licensed" and "21+ buyers / ~100 BTC OTC" still need documents or removal.
3. **IP-assignment confirmations** — signed agreements for all contributors.
4. **Entity/cap-table documents** — incorporation certificate, cap table, financing instruments.
5. **Data accuracy** — reconcile CBB CRA category descriptions in the dataset against the CRA Module; complete source-linking for the 8 unsourced jurisdictions.
6. **Tech hygiene** — clear stale `.next` route-type error; confirm Clerk production configuration (`clerk.zawda.me`).
7. **Certifications** — only claim SOC 2 / data-residency / PDPL/GDPR where actually backed; otherwise omit.

## Commercial (the structural gap)
Pre-revenue. This is an acqui-hire / IP + regulatory-option profile. Strengtheners a founder can add: 2–3 design partners or paid pilots on the compliance product, and a warm path to Chainalysis corporate development. These lift the last stretch that engineering cannot.
