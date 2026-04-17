# Wave 2b — Real Quotes + Auth/Onboarding Pages
Model: sonnet | Skip: CLAUDE.md, AGENTS.md
Working files: /home/user/workspace/zawda-b2b/

---

## Part 1 — Real Quotes Section

### Placement
Insert BELOW the assessment result card section, ABOVE the pain stats (AED 600K cards).
Section headline: "Straight from the people who built it — and the regulators enforcing it."
Section subhead: "Not marketing copy. Real statements, real sources."

### The 4 Best Quotes to Use (select these 4 from the 8 available):

**Quote A — VARA CEO Henson Orser** (regulatory philosophy — sets the tone)
> "One of VARA's founding principles is creating an equal opportunity regime for responsible VASPs... VARA aims to strike a balance between value creation, risk mitigation and enhanced investment opportunities with consumer protection at its core."

Person: Henson Orser, CEO — VARA
Date: 1 May 2023
Source URL: https://www.vara.ae/en/news/bitoasis-becomes-the-first-broker-dealer-to-secure-mvp-operational-licence-from-dubais-virtual-asset-regulatory-authority/

**Quote B — Dubai Ruler Sheikh Mohammed** (the vision — highest authority)
> "The future belongs to whoever designs it. Today, through the virtual assets law, we seek to participate in the design of this new and rapidly growing global sector. Our step is a leap towards the future aimed at developing this sector and protecting all investors in it."

Person: Sheikh Mohammed bin Rashid Al Maktoum, Ruler of Dubai
Date: 9 March 2022
Source URL: https://blockworks.co/news/dubai-is-the-latest-government-to-roll-out-crypto-law-set-up-regulator

**Quote C — Rain CEO Joseph Dallago** (operator perspective — being regulated unlocks business)
> "We're the first regulated cryptocurrency exchange in the Gulf and the greater Middle East. We really value regulation and its strong banking ties."

Person: Joseph Dallago, CEO & Co-Founder — Rain Financial
Date: March 2022
Source URL: https://500.co/content/bahraini-crypto-exchange-rain-wants-to-become-a-global-player

**Quote D — Rain Financial (corporate statement)** (concrete benefit of licensing)
> "By becoming a licensed exchange, we are able to form more lasting relationships with our banking partners and payment processors. This has led to more stable banking relationships, better pricing, lower fees, and more reliable deposit and withdrawal processes for our customers."

Source: Rain Financial official blog (via Bitcoin Magazine)
Date: August 2019
Source URL: https://bitcoinmagazine.com/business/cryptocurrency-exchange-rain-granted-license-bahrains-central-bank

### Quote Card Design
- White cards, subtle drop shadow
- Large opening quotation mark: gold (#D69828), 72px, decorative, top-left
- Quote text: black, italic, 17px, line-height 1.7
- Attribution line below: person name in bold black, title + org in gray
- Date in small gray text
- Source link: small external icon + "Source" text in gold, links to URL in new tab
- 4 cards in a 2×2 grid on desktop, single column on mobile
- Each card: equal height, content centered vertically

---

## Part 2 — Pricing Update

Change Intelligence tier from $499/mo to FREE.

Updated pricing cards:
| Tier | Price | Change |
|---|---|---|
| Intelligence | FREE (was $499) | CTA: "Get Started Free →" |
| Advisory | $2,499/mo | CTA: "Book a Call →" (Calendly link) |
| Enterprise | Custom | CTA: "Contact Us →" |

Remove all references to $499 from the page.
Update the ROI line: "One VARA fine (~AED 600,000) covers 5+ years of Advisory subscription."

---

## Part 3 — Remove Free Tools from Nav

Remove from nav: BTC Calculator tab, Reg Map tab (or keep Reg Map but don't build calculator).
Keep nav simple: Assessment · How it works · Pricing · Track Record

The regulatory map table stays (it's useful). The BTC calculator is removed entirely.

---

## Part 4 — Auth Pages (NEW files)

Create 4 new HTML files in /home/user/workspace/zawda-b2b/

### /register.html

Split-screen layout (matches site branding exactly):

LEFT PANEL (40% — dark #010101 background):
- Zawda gold logo at top left
- Diamond pattern texture at 8% opacity in gold
- Large serif-style heading: "Compliance starts with clarity."
- 3 trust signals with gold checkmarks:
  ✓ Free compliance assessment
  ✓ VARA · CBB · ADGM regulatory tracker
  ✓ Used by compliance teams across UAE and Bahrain
- Bottom: "Already have an account? [Sign in →]" in gray, link in gold

RIGHT PANEL (60% — white background):
- Top: "Create your free account" heading (Cabinet Grotesk, 32px, black)
- Subhead: "No credit card required."
- Form fields (stacked, gold focus ring on all inputs):
  - First name + Last name (50/50 row)
  - Work email *
  - Company name *
  - Role (select dropdown): CFO · Compliance Officer · Legal Counsel · Founder/CEO · Fund Manager · Family Office Manager · Other
  - Jurisdiction (checkbox group, 2-column): □ UAE (VARA) □ Bahrain (CBB) □ Abu Dhabi (ADGM) □ Saudi Arabia □ Multiple
  - Password * (show/hide toggle)
  - Confirm password *
- Terms checkbox: "I agree to the [Terms of Service] and [Privacy Policy]"
- CTA: "Create Account →" (gold, full width, 52px height)
- Divider "or continue with"
- LinkedIn button (professional context — more relevant than Google for B2B)
- Google button
- Footer note: "← Back to zawda.me"

### /login.html

Same split-screen. Left panel identical to register.

RIGHT PANEL:
- "Welcome back" heading
- Subhead: "Sign in to your compliance dashboard"
- Email field *
- Password field * + "Forgot password?" link right-aligned (gold)
- "Sign In →" (gold, full width)
- Divider + LinkedIn + Google buttons
- "Don't have an account? [Create one free →]"

### /onboarding.html

3-step flow. Clean centered layout, white background, progress dots at top.

STEP 1 — "Tell us about your situation"
4 large clickable cards in 2×2 grid:
[🏢 We operate without a license] [📋 Licensed elsewhere, expanding to MENA]
[🔄 Renewing or upgrading a license] [🔍 Just researching for now]

STEP 2 — "Which regulators matter most to you?"
Multi-select checkbox cards:
[🇦🇪 UAE — VARA] [🇧🇭 Bahrain — CBB] [🇦🇪 Abu Dhabi — ADGM/FSRA]
[🇸🇦 Saudi Arabia — SAMA] [🌐 Not sure yet]
"Next →" button activates when at least one is selected.

STEP 3 — "What's your timeline?"
4 option cards:
[🔴 Urgent — we're already operating at risk]
[🟠 Within 3 months]
[🟡 3–12 months]
[🟢 Planning ahead — no immediate pressure]

After step 3:
Show loading animation: "Building your compliance roadmap..."
3s delay then redirect to /dashboard.html

### /dashboard.html

Sidebar layout. This is the MVP dashboard shell.

SIDEBAR (240px, #010101 background, white text):
- Zawda logo (gold) at top, 24px padding
- Nav items:
  - 🏠 Dashboard (active = gold left border + gold text)
  - 📋 My Roadmap
  - 📁 Documents (gray, "Soon" badge)
  - 🔔 Regulatory Alerts
  - ⚙️ Settings
- Bottom of sidebar:
  - User avatar (initials circle, gold) + name + "Free Plan" badge
  - "Upgrade to Advisory →" (gold outline button, full sidebar width)

MAIN CONTENT (white, padding 32px):

Top bar:
- "Good morning, [User]" (Cabinet Grotesk, 28px)
- Date (right-aligned, gray)
- "Compliance Score: MEDIUM" badge (amber)

SECTION 1 — "Your Setup"
3 info chips in a row:
[🇦🇪 UAE — VARA] [📋 Virtual Asset Exchange] [⏱ 12–18 month timeline]
Small gray "Edit" link after the row

SECTION 2 — "Your Licensing Roadmap"
Vertical checklist. Heading: "VARA Full Market Product Licence — 12 Steps"

Each row:
[ ] checkbox | Step name (bold) | Brief description (gray) | Time estimate (gold) | Status badge

12 steps for VARA Virtual Asset Exchange:
1. [ ] Business plan preparation | Define activities, revenue model, risk appetite | 2-4 weeks | Not started
2. [ ] UAE legal entity setup | Incorporate in mainland or eligible free zone | 4-8 weeks | Not started
3. [ ] Initial Disclosure Questionnaire (IDQ) | Submit to Dubai Economy & Tourism or Free Zone | 2-4 weeks | Not started
4. [ ] Approval to Incorporate (ATI) from VARA | VARA reviews business model and management | 8-16 weeks | Not started
5. [ ] AML/CFT policy development | Must align with FATF standards and VARA Rulebook | 3-6 weeks | Not started
6. [ ] Technology architecture documentation | Exchange platform, custody systems, security controls | 2-4 weeks | Not started
7. [ ] Appoint Compliance Officer + MLRO | Both must be UAE residents | 4-8 weeks | Not started
8. [ ] Capital adequacy proof | Minimum AED 4M for exchange licence | Ongoing | Not started
9. [ ] Cybersecurity framework + penetration test | Board-level adoption + annual pentest required | 4-8 weeks | Not started
10. [ ] Full VASP licence application | Submit complete application package to VARA | 4-6 weeks | Not started
11. [ ] VARA supervisory review | Meetings, document requests, clarifications | 8-16 weeks | Not started
12. [ ] Operational licence issued ✓ | Licensed to commence VA activities in Dubai | — | Not started

Checkbox state saved to localStorage. Completed steps show strikethrough + green check.
Progress bar at top of section: "0 of 12 complete"

SECTION 3 — "Latest Regulatory Alerts"
3 cards (same style as enforcement ticker items):
- VARA enforcement: 19 firms fined Q4 2025 (red left border)
- Travel Rule deadline: March 2026 (amber left border)
- ADGM Digital Asset Framework update: June 2025 (blue left border)
Each card: dismiss (×) + "Read more →" (gold)

SECTION 4 — "Documents" (locked)
Gray dashed border card:
Lock icon + "Secure Document Vault"
"Upload board resolutions, AML policies, licence applications — encrypted and private."
"Available in Advisory plan"
"Upgrade to Advisory →" (gold button)

SECTION 5 — "Get Help"
2 cards side by side:
Card 1 (gold border): "Book a 30-min consultation" — Calendly link button
Card 2 (gray border): "Email our team" — mailto:hello@zawda.me

---

## Execution Order
1. Update pricing (Free Intelligence, ROI line)
2. Add 4 quote cards between assessment and pain section
3. Remove BTC calculator tab from nav
4. Create register.html
5. Create login.html
6. Create onboarding.html (3-step flow with transitions)
7. Create dashboard.html (sidebar + roadmap)

## Done When
- [ ] Assessment → "Book Free Consultation" → Calendly
- [ ] 4 quote cards visible with source links, between assessment and pain stats
- [ ] Intelligence shows "Free" in pricing
- [ ] register.html loads with split-screen, form validates email/password
- [ ] login.html loads with split-screen
- [ ] onboarding.html: clicking through all 3 steps works, redirects to dashboard
- [ ] dashboard.html: sidebar renders, roadmap shows 12 checkable steps, progress bar updates
- [ ] All auth pages match main site brand (white bg, gold #D69828, Cabinet Grotesk)
