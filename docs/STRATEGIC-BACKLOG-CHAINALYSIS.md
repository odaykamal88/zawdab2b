# Strategic Backlog: Chainalysis Acquisition Positioning

## The Thesis
Chainalysis (~$8.6B valuation) dominates blockchain analytics globally but has three gaps in MENA. Zawda fills all three. The acquisition pitch: "We are your MENA operational compliance layer — Arabic-native, regulator-connected, and already integrated with your API."

## The Three Gaps + What Zawda Builds

---

### Gap 1: MENA Regulatory Intelligence Layer
**What Chainalysis does**: On-chain analytics — tells you what happened on a blockchain.
**What they don't do**: Jurisdiction-specific regulatory interpretation. They can't tell a CBB-licensed VASP how to respond to a VARA circular, or explain how Qatar's new framework affects cross-border clients.

**What Zawda builds (current + backlog)**:

| Feature | Status | Priority | Wave |
|---|---|---|---|
| Regulatory crawler — VARA, ADGM, CBB, FSRA, SCA, FATF | ✅ In Wave 2 | CRITICAL | Current |
| Jurisdiction status pages (6 countries) | ✅ In Wave 2 | CRITICAL | Current |
| Regulatory map table (12 license types, sortable) | ✅ In Wave 2b | HIGH | Current |
| Weekly regulatory intelligence brief | ✅ In Wave 2 | HIGH | Current |
| Regulatory diff alerts (real-time, email + dashboard) | ✅ In Wave 2 | HIGH | Current |
| **Machine-readable regulatory database** | 📋 BACKLOG | CRITICAL | Wave 5 |
| — Structured JSON/API for every requirement per jurisdiction | | | |
| — Query: "What does VARA require for custody license?" → structured response | | | |
| — Covers: CBB, VARA, ADGM/FSRA, SAMA, QFC, CMA Kuwait | | | |
| **Regulatory change timeline visualization** | 📋 BACKLOG | MEDIUM | Wave 6 |
| — Interactive timeline showing regulatory evolution per jurisdiction | | | |
| — When each rule was introduced, amended, enforced | | | |
| **Arabic regulatory content** | 📋 BACKLOG | HIGH | Wave 5 |
| — Full Arabic translations of all regulatory intelligence | | | |
| — Arabic SAR templates, Arabic compliance checklists | | | |
| — Chainalysis has zero Arabic product depth — this is a differentiator | | | |

---

### Gap 2: "Last Mile" Compliance Operations
**What Chainalysis does**: Flags suspicious transactions via KYT (Know Your Transaction). Alerts.
**What they don't do**: The operational work after the alert — SAR filing, case management, audit trails, regulatory reporting, responding to regulator queries.

**The MoonPay/Unit21 precedent**: MoonPay partnered with Chainalysis + Unit21 to build a "single, cohesive compliance engine" where Chainalysis KYT data flows into Unit21's case management. This validates the pattern — Chainalysis knows they need operational workflow partners.

**What Zawda builds (current + backlog)**:

| Feature | Status | Priority | Wave |
|---|---|---|---|
| Licensing roadmap checklist (12-step VARA process) | ✅ In Wave 2b | HIGH | Current |
| Document vault (encrypted, Advisory tier) | ✅ Dashboard backlog | HIGH | Wave 4 |
| **SAR filing automation — MENA format** | 📋 BACKLOG | CRITICAL | Wave 6 |
| — Auto-generate SARs in CBB format | | | |
| — Auto-generate SARs in VARA format | | | |
| — Auto-generate SARs in FSRA format | | | |
| — Template library: 10+ report types per jurisdiction | | | |
| — Pre-populated from Chainalysis KYT alert data (API integration) | | | |
| **Case management system** | 📋 BACKLOG | CRITICAL | Wave 7 |
| — Chainalysis KYT alert → auto-create case in Zawda | | | |
| — Case file: alert details, customer info, investigation notes, SAR draft | | | |
| — Status tracking: Open → Investigating → Filed → Resolved | | | |
| — Audit trail: every action timestamped and logged | | | |
| — Regulator query response templates | | | |
| **Regulatory reporting automation** | 📋 BACKLOG | HIGH | Wave 7 |
| — Quarterly compliance reports per jurisdiction | | | |
| — Annual MLRO reports (required by CBB, VARA) | | | |
| — Transaction statistics in regulator-required format | | | |
| **Travel Rule compliance module** | 📋 BACKLOG | HIGH | Wave 8 |
| — IVMS 101 data format support | | | |
| — Integration with Notabene or TRISA for Travel Rule messaging | | | |
| — MENA-specific: March 2026 UAE deadline, CBB requirements | | | |
| — 37% of VASPs have never received a Travel Rule transfer (Notabene 2024) | | | |

---

### Gap 3: MENA-Native Data & Relationships
**What Chainalysis does**: Great MENA research reports. No on-the-ground product.
**What they don't do**: Arabic UI. Jurisdiction-specific tools. Relationships with regulators. Local exchange data.

**What Zawda builds (current + backlog)**:

| Feature | Status | Priority | Wave |
|---|---|---|---|
| Compliance assessment tool (5-step, jurisdiction-aware) | ✅ In Wave 1 | HIGH | Current |
| Exchange True Cost table (8 MENA exchanges, verified fees) | ✅ In Wave 2 | HIGH | Current |
| Founder track record (CBB provisional license, 3 companies licensed) | ✅ In Wave 1 | HIGH | Current |
| **Arabic-first compliance dashboard** | 📋 BACKLOG | CRITICAL | Wave 6 |
| — Full Arabic RTL interface for the dashboard | | | |
| — Arabic regulatory alerts | | | |
| — Arabic SAR templates | | | |
| — Arabic onboarding flow | | | |
| **MENA exchange risk scoring** | 📋 BACKLOG | HIGH | Wave 7 |
| — Not just fees — counterparty risk, volume reliability, uptime SLA | | | |
| — Bank relationship stability per exchange | | | |
| — Jurisdiction-specific recommendations: "If you're CBB-licensed, use X for custody" | | | |
| **Chainalysis API integration** | 📋 BACKLOG | CRITICAL | Wave 5 |
| — Zawda accepts Chainalysis KYT alerts as input | | | |
| — Users connect their Chainalysis account → alerts flow into Zawda case mgmt | | | |
| — This is THE acquisition trigger: Zawda becomes Chainalysis's MENA workflow layer | | | |
| — Precedent: Corsa Finance did exactly this (announced Dec 2025) | | | |
| **MENA VASP directory** | 📋 BACKLOG | MEDIUM | Wave 6 |
| — Every licensed VASP in MENA with: license type, regulator, date, status | | | |
| — Publicly searchable: "Is [company] licensed in [jurisdiction]?" | | | |
| — Updated by crawler automatically | | | |

---

## The Integration Architecture (How Zawda Plugs Into Chainalysis)

```
                    ┌─────────────────┐
                    │  Chainalysis    │
                    │  KYT Alerts     │
                    └────────┬────────┘
                             │ API (webhook or poll)
                    ┌────────▼────────┐
                    │  Zawda B2B      │
                    │  Intake Layer   │
                    └────────┬────────┘
                             │
              ┌──────────────┼──────────────┐
              ▼              ▼              ▼
    ┌─────────────┐ ┌─────────────┐ ┌─────────────┐
    │ Case Mgmt   │ │ SAR Auto-   │ │ Regulatory  │
    │ Workflow     │ │ Filing      │ │ Intelligence│
    │ (MENA-spec) │ │ (CBB/VARA/  │ │ (Crawler +  │
    │             │ │  FSRA fmt)  │ │  Briefs)    │
    └──────┬──────┘ └──────┬──────┘ └──────┬──────┘
           │               │               │
    ┌──────▼──────┐ ┌──────▼──────┐ ┌──────▼──────┐
    │ Audit Trail │ │ Reg Reports │ │ Dashboard   │
    │ (Timestamped│ │ (Quarterly/ │ │ (AR/EN)     │
    │  immutable) │ │  Annual)    │ │             │
    └─────────────┘ └─────────────┘ └─────────────┘
```

## Acquisition Readiness Checklist

What Chainalysis would need to see before writing a check:

| Signal | Status | Target |
|---|---|---|
| 5-10 Gulf VASPs using the platform | ❌ Not started | Month 6 |
| Chainalysis API integrated (alerts → case mgmt) | ❌ Backlog | Month 4 |
| Arabic + English full product | ❌ Partial (English only) | Month 5 |
| SAR auto-filing for CBB + VARA | ❌ Backlog | Month 6 |
| Revenue from Advisory tier ($2,499/mo × 5 clients) | ❌ Not started | Month 3 |
| Regulatory crawler with 6-month history of accurate diffs | ✅ Building now | Month 2 |
| At least 1 regulator relationship (CBB, VARA) | ✅ CBB provisional license history | Existing |
| Founder credibility (licenses, BTC acquisition track record) | ✅ On the site | Existing |

## What to Build in What Order (Backlog Prioritized)

### Wave 5 (Month 2-3): Machine-Readable Reg DB + Chainalysis API Integration
The two features that make the acquisition narrative concrete:
1. Structured regulatory database that a machine (including Chainalysis) can query
2. Accept Chainalysis KYT alerts via API → display in Zawda dashboard

### Wave 6 (Month 3-4): SAR Auto-Filing + Arabic Dashboard
The features that prove operational value:
1. SAR templates for CBB and VARA (auto-populated from case data)
2. Full Arabic RTL dashboard and content
3. MENA VASP directory (populated by crawler)

### Wave 7 (Month 4-5): Case Management + Regulatory Reporting
The features that make it a platform, not just a tool:
1. Full case management workflow (alert → investigate → file → resolve)
2. Quarterly and annual regulatory reports in required formats
3. Exchange risk scoring

### Wave 8 (Month 5-6): Travel Rule + Scale
1. IVMS 101 Travel Rule messaging integration
2. Scale to 5-10 paying VASPs
3. Start Chainalysis partnership conversation

---

## Key Competitive Intelligence

### Who else is in this space?
- **Corsa Finance** — "Agentic Compliance OS", announced Chainalysis KYT integration Dec 2025. They're doing the same play but for Western markets. Zawda's angle: MENA-native, Arabic, regulator relationships.
- **Unit21** — Case management platform, already partnered with Chainalysis for MoonPay. They're the template for what operational compliance looks like, but they're not MENA-focused.
- **DX Compliance** — AML compliance firm with UAE presence and transaction monitoring product. Competitor in advisory, not in the intelligence/automation play.
- **Notabene** — Travel Rule compliance. They'd be a partner (IVMS 101 integration), not a competitor.

### What makes Zawda's angle defensible?
1. **Arabic-native** — no one else has this
2. **Regulator relationships from operating history** — CBB provisional license, Wolf Accelerator
3. **MENA-specific SAR formats** — these are jurisdiction-specific and hard to build without local knowledge
4. **Timing** — regulatory frameworks are being written right now. The window to codify them into a product is 12-18 months before they stabilize and Chainalysis could build internally.

## The One-Liner for Chainalysis

"Zawda is the MENA operational compliance layer for Chainalysis customers — Arabic-native regulatory intelligence, automated SAR filing in CBB/VARA/FSRA format, and case management that turns your KYT alerts into resolved compliance cases. We're already integrated with your API and serving 10 Gulf VASPs."

That's the sentence you want to be able to say in Month 6.
