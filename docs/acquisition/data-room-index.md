# Zawda — Acquisition Data Room (index)

> **CONFIDENTIAL.** Prepared for a prospective acquirer under NDA. Contains material non-public information, including a CBB in-principle confirmation that **may not be publicly disclosed** (see the CBB fact sheet, caveat iii). Keep this repository/branch **off any public or shared remote.**

## Contents
| Doc | What it is |
|---|---|
| [positioning-memo.md](positioning-memo.md) | Strategic thesis — the agent-side enforcement layer that complements Chainalysis's intelligence |
| [cbb-approval-factsheet.md](cbb-approval-factsheet.md) | Accurate representation of the CBB in-principle confirmation + caveats + open items |
| [architecture.md](architecture.md) | System architecture, stack, security posture, known issues |
| [api.md](api.md) | v1 API reference (dataset + recommendation engine as a module) |
| Agent Controls PoC | Code: `src/lib/agent-controls/`; demo: `/agent-controls`; run: `npx tsx scripts/agent-controls-demo.ts` |
| Provenance coverage | `npx tsx scripts/provenance-report.ts` (7/15 jurisdictions source-linked) |

## Corporate & IP
- **Entity:** Zawda W.L.L. (Bahrain, "under formation" as of the CBB letter) — **confirm current incorporation status.**
- **Founder:** Oday Kamal (solo founder).
- **IP ownership — action required:** confirm that all code (including AI-assisted and any contractor work) is assigned to the entity, with signed IP-assignment/contractor agreements. Solo-founder deals get re-priced when IP provenance is unclear.
- **Cap table:** to be provided. The claimed **$450K raise (Wolf Accelerator + Axiom Capital)** must be documented with instruments (SAFE/equity), amounts, and holders.

## Verified & complete (this branch)
- ✅ **Integrity pass** — fabricated enforcement entities/stats removed; vaporware features labelled; false "zero-knowledge" claim corrected; dormant false "CBB Category 3 provisional license" line corrected.
- ✅ **Positioning memo** — grounded in Chainalysis's real 2026 moves; CBB represented exactly per the letter.
- ✅ **Agent-controls PoC** — verified running (1 executed / 4 intercepted / 1 review; audit chain valid) and rendered in-browser.
- ✅ **v1 API** — verified live (jurisdictions 200; assess 503-gated until key set).

## 🚩 Open items / diligence checklist (ranked)
1. **CBB application current standing** — the 6-month Schedule deadline (≈3 Dec 2025) has passed; confirm live / extended / lapsed with the CBB Licensing Directorate. *Highest priority.*
2. **Evidence for biographical claims** — $450K raised; "3 companies licensed"; "21+ institutional buyers / ~100 BTC OTC." Back each with documents or remove from all materials.
3. **IP-assignment confirmations** — signed agreements for all contributors.
4. **Entity/cap-table documents** — incorporation certificate, cap table, financing instruments.
5. **Data accuracy** — reconcile CBB CRA category descriptions in the dataset against the CRA Module; complete source-linking for the 8 unsourced jurisdictions.
6. **Tech hygiene** — clear stale `.next` route-type error; confirm Clerk production configuration (`clerk.zawda.me`).
7. **Certifications** — only claim SOC 2 / data-residency / PDPL/GDPR where actually backed; otherwise omit.

## Commercial (the structural gap)
Pre-revenue. This is an acqui-hire / IP + regulatory-option profile. Strengtheners a founder can add: 2–3 design partners or paid pilots on the compliance product, and a warm path to Chainalysis corporate development. These lift the last stretch that engineering cannot.
