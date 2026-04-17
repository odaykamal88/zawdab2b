# Wave 1 v2 Exec — Full Redesign
Model: sonnet | Skip: CLAUDE.md, AGENTS.md | Read: agents/01-FRONTEND.md

## Context
Complete redesign. Throw out the dark navy terminal look.
Reference site: delve.co — light, white background, pain-first, product mockups as visuals.
Brand: WHITE background, gold #D69828 accent, black #010101 text.
The compliance assessment IS the hero — not a secondary feature.

## Design System (use exactly)
- Background: #ffffff primary, #fafaf8 alternate sections
- Gold: #D69828 — CTAs, borders, accents, logo
- Black: #010101 — all headings and body text
- Gray: #6b7280 — secondary text
- Red alert: #dc2626 — enforcement notices only
- Fonts: Cabinet Grotesk (Fontshare CDN) for headings, Inter (Google) for body, JetBrains Mono for numbers
- Brand pattern: Zawda diamond (rotated squares) as SVG background texture at 5% opacity

## Logo (inline SVG — use exactly)
```svg
<svg width="129" height="84" viewBox="0 0 129 84" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M1.46434 72.4531V71.1333L9.55912 59.0498H1.37635V57.4367H11.7295V58.7565L3.63468 70.84H11.8174V72.4531H1.46434Z..." fill="#D69828"/>
<!-- full SVG from Zawda-logo-2025.svg -->
</svg>
```
Use the full SVG from the brand file. Gold fill #D69828.

## Page Sections (in order)

### 1. Nav — sticky, white, thin gold bottom border
Logo left | Assessment · How it works · Pricing · Track Record center | Book a Call (ghost) + Start Assessment (gold) right

### 2. Hero — two columns
LEFT: Gold label "VARA enforcement is accelerating." + large headline "Find out if your business is VARA-compliant in 2 minutes." + subhead with fine numbers + trust stats inline
RIGHT: Assessment card (interactive, Step 1 visible by default — jurisdiction picker)

### 3. Assessment (embedded in hero, multi-step)
5 steps: Jurisdiction → License Type → Current Status → Entity Type → Result
Result card: Readiness score + timeline + cost estimate + top 3 requirements + email capture CTA
JS logic: client-side, no backend needed for MVP. State object maps selections to results.

### 4. Enforcement ticker
Gold background strip, auto-scrolling enforcement actions left to right, infinite loop

### 5. Pain stats
3 cards: AED 600K / $8.85M / March 2026 — gold left border, white background

### 6. Enforcement social proof
Horizontal scrollable cards styled as document excerpts — cream bg, monospace font, red left border
Real enforcement actions with source attribution

### 7. How it works — 3 steps horizontal
Numbered gold circles, bold titles, 2-sentence descriptions

### 8. Pricing — 3 tiers
Free assessment / $499 Intelligence / $2,499 Advisory (featured gold border)
"One VARA fine = 65 months of Advisory" line below

### 9. Track record — timeline
Founder milestones: Wolf → CBB → THNDR → 3 companies licensed → 21+ BTC buyers

### 10. Footer
Logo + tagline + legal disclaimer + diamond pattern border strip

## Done When
- localhost:3000 renders white/light homepage (NOT dark navy)
- Assessment steps transition correctly (jurisdiction → license type → result)
- Result card shows timeline + cost + complexity for UAE/VARA selection
- Enforcement ticker scrolls automatically
- Mobile at 375px: assessment is full-screen step-by-step
- npm run build passes zero errors

## Boundaries
- Do NOT build a dark mode
- Do NOT use dark navy (#0a0e1a) anywhere
- Do NOT placeholder any text — use real regulatory numbers only
- Assessment result must be computed from the JS logic, not hardcoded
