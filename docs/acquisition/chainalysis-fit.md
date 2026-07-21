# Why Zawda fits Chainalysis — one-pager

> **CONFIDENTIAL — under NDA.** Built to be handed to Chainalysis corporate development. Every capability below is either shipped in this repo or clearly labelled as a roadmap/PoC item.

## What Chainalysis said it wants
At **Links 2026**, CEO Jonathan Levin launched **Chainalysis AI Agents** and closed with: *"Build agents. Automate workflows… The platform is open, and the invitation to build is here."* He also framed the hard part as **talent at the intersection of trusted data, domain expertise, and builders** — calling that combination *"near impossible"* to find.

That intersection is precisely what Zawda is.

## The intersection — already built

| Levin's axis | Zawda |
|---|---|
| **Trusted data** | Screening built on a **real OFAC SDN** block-list, behind a pluggable interface where **Chainalysis KYT drops in unchanged** as the risk provider. |
| **Domain expertise** | A structured **MENA regulatory dataset** (VARA, ADGM, CBB, CMA, QFC…), **FIU-specific** SAR/STR drafting (CBB goAML, VARA, ADGM), and a founder who took a **Governor-signed CBB in-principle confirmation** and authored a CRA-module custody/key-control framework. |
| **Builders** | **Two working agents shipped and runnable**, each with a tamper-evident hash-chained audit trail. |

## The two agents (demonstrable today)
1. **Transaction-enforcement agent** — `/agent-controls`. Authorizes or **intercepts an autonomous agent's transaction before it signs**, using sanctions + KYT + programmatic policy (limits, jurisdiction). This is the **agent-side enforcement layer Chainalysis does not own** — it complements their detection/intelligence.
2. **Compliance-analyst agent** — `/agent-controls/triage`. **Automates the analyst alert queue**: enrich → assess → draft an FIU-specific SAR/escalation → record. This is exactly the *"automate workflows"* invitation, in the MENA regulatory context.

Run them: `npx tsx scripts/agent-controls-demo.ts` and `npx tsx scripts/compliance-workflow-demo.ts`.

## How this maps to their roadmap
- Chainalysis agents automate **investigation / triage / reporting**. Zawda's analyst agent does the same shape of work, adds **MENA/FIU domain depth**, and plugs their KYT in as the trusted-data input.
- Chainalysis is deep in **agentic payments** (x402) but owns **detection**, not **pre-trade enforcement**. Zawda's enforcement agent is the missing control point.
- Chainalysis is **custody-averse**; Zawda took a custody-inclusive CBB path to a Governor-signed in-principle confirmation and then **deliberately withdrew it (Mar 2026) on pivoting off custody** — proving regulatory capability while landing on the non-custody side.

## The ask
An acqui-hire / IP acquisition of the enforcement + workflow layer and the MENA regulatory dataset, plus the founder — the trusted-data × domain × builder combination Levin said is near-impossible to find, already demonstrable.

*See also: [positioning-memo.md](positioning-memo.md), [architecture.md](architecture.md), [api.md](api.md).*
