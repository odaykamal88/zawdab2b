# agents/01-FRONTEND.md — Frontend Team Lead

You are running the Frontend team. Five agents report to this file: fe-design, fe-marketing, fe-tools, fe-dashboard, fe-seo.
Read AGENTS.md for file ownership boundaries before doing anything else.

---

## Wave Order (strict dependency sequence)

**Wave 1a — fe-design (MUST go first)**
No other frontend agent can start until the token system exists.

**Wave 1b — fe-marketing + fe-tools (parallel, after fe-design)**
These are independent of each other. Run in separate sessions.

**Wave 1c — fe-dashboard + fe-seo (after marketing is live)**
fe-dashboard requires be-auth. Coordinate with backend team before starting.

---

## Design System Specification

### Color Tokens (implement as CSS variables in `src/styles/globals.css` AND as Tailwind extensions)

```typescript
// tailwind.config.ts — extend colors
colors: {
  bg: {
    primary:   '#0a0e1a',
    surface:   '#111827',
    surface2:  '#1a2236',
  },
  border: {
    DEFAULT:   '#1e2d45',
    accent:    '#D4A853',
    alert:     '#dc2626',
  },
  text: {
    DEFAULT:   '#e8edf5',
    muted:     '#6b7a99',
    faint:     '#3d4b66',
  },
  gold:   '#D4A853',
  alert:  '#dc2626',
}
```

### Light Theme Overrides (data-theme="light")
```
bg-primary: #f4f5f7 | surface: #ffffff | surface-2: #f0f1f5
border: #d4d8e1 | text: #0f1729 | muted: #5c6578
gold (light): #b8892e | alert: #b91c1c
```

### Typography
- **Display/headings**: Cabinet Grotesk, weights 400/500/700/800. Load from Fontshare CDN:
  `https://api.fontshare.com/v2/css?f[]=cabinet-grotesk@400,500,700,800&display=swap`
- **Body**: Satoshi, weights 300/400/500/700. Load from Fontshare CDN:
  `https://api.fontshare.com/v2/css?f[]=satoshi@300,400,500,700&display=swap`
- **Numbers/mono**: JetBrains Mono from Google Fonts. Apply to all financial figures, percentages, dates when they appear in data tables or stat cards.

### Type Scale (clamp-based, copy from prototype `style.css`)
```css
--text-xs:   clamp(0.75rem,  0.7rem  + 0.25vw, 0.875rem);
--text-sm:   clamp(0.875rem, 0.8rem  + 0.35vw, 1rem);
--text-base: clamp(1rem,     0.95rem + 0.25vw, 1.125rem);
--text-lg:   clamp(1.125rem, 1rem    + 0.75vw, 1.5rem);
--text-xl:   clamp(1.5rem,   1.2rem  + 1.25vw, 2.25rem);
--text-2xl:  clamp(2rem,     1.2rem  + 2.5vw,  3.5rem);
--text-3xl:  clamp(2.5rem,   1rem    + 4vw,    5rem);
```

### Brand Name Pattern
```typescript
// src/lib/brand.ts
export const BRAND_NAME = process.env.NEXT_PUBLIC_BRAND_NAME ?? 'Zawda'

// src/components/ui/BrandName.tsx — server component
import { BRAND_NAME } from '@/lib/brand'
export function BrandName({ className }: { className?: string }) {
  return <span className={className}>{BRAND_NAME}</span>
}
```
Use `<BrandName />` everywhere. Never write the literal string "Zawda" in JSX.

### CSS Variable for CSS contexts
```css
:root { --brand-name: "Zawda"; }
/* In plain CSS: content: var(--brand-name); */
```

---

## Component Patterns

### Card Pattern
```tsx
// Featured content (e.g., Advisory pricing card):
<div className="bg-bg-surface border border-gold rounded-lg p-8 shadow-[0_0_40px_rgba(212,168,83,0.08)]">

// Regulatory alert content:
<div className="bg-bg-surface border border-l-4 border-border border-l-alert rounded-lg p-6">

// Standard card:
<div className="bg-bg-surface border border-border rounded-lg p-8">
```

### Regulatory Alert Bar
Appears at top of every page, above nav. Red background. Dismissible. Persists in `localStorage`.
```tsx
// src/components/ui/AlertBar.tsx
// - Background: bg-alert text-white
// - Dismissible via X button
// - Saves dismissed state to localStorage key 'alert-dismissed'
// - Text: "VARA fined 19 firms up to AED 600,000 in Q4 2025. ADGM imposed USD 8.85M in penalties. Compliance is not optional."
// - Include link to pain section: href="#pain"
```

### CTA Buttons
```tsx
// Primary (gold pill):
<button className="bg-gold text-bg-primary font-semibold rounded-full px-8 py-3 hover:brightness-110 transition-all">
  Request Access →
</button>

// Ghost:
<button className="border border-border text-text rounded-full px-8 py-3 hover:border-text-muted hover:bg-bg-surface transition-all">
  See Weekly Brief
</button>
```

### Skeleton Loaders
Never use spinners. Use animated skeletons:
```tsx
<div className="animate-pulse bg-bg-surface2 rounded h-4 w-3/4" />
```

---

## Marketing Page — All 10 Sections

Build as a single-page app (`src/app/[locale]/(marketing)/page.tsx`) with smooth-scroll anchors.
All sections must use real copy — no lorem ipsum, no "Coming Soon" placeholders.

### Section 1: Nav
- Logo: SVG zigzag mark (copy from prototype) + `<BrandName />` in Cabinet Grotesk 700
- Links: Product / Pricing / Track Record / Weekly Brief / Sign In
- Actions: Theme toggle + "Request Access" gold pill CTA
- Behavior: Sticky top, backdrop blur, scrolled shadow, mobile hamburger at <768px

### Section 2: Alert Bar
- Red bar above nav (not inside nav)
- Text: exact regulatory fine language (cite Q4 2025 VARA action)
- Dismissible, localStorage-persisted

### Section 3: Hero
- Headline: "MENA's Regulatory Blind Spot Is Costing Companies Millions."
- Sub: 1-sentence value prop for CFOs/compliance officers
- Dual CTAs: "Request Access →" (gold) + "See Weekly Brief" (ghost)
- Trust numbers: 3 companies licensed | 21+ institutional BTC buyers | ~100 BTC acquired
- Right side: MENA network node visualization (UAE/Bahrain active gold, others muted — animate connection lines)
- Background: subtle radial gold gradient top-right

### Section 4: Pain
- Section label: "The Cost of Getting It Wrong" (mono uppercase gold)
- Heading: "The fines are real. The licenses are mandatory. The clock is ticking."
- 3 stat cards (gold left border): AED 600K / $8.85M / March 2026
  Each card: number in JetBrains Mono, description below. Source comment in code.
- Two-column detail: "Who's at risk" + "What regulators are watching"

### Section 5: Product Pillars
- Section label: "What [BrandName] Does"
- Heading: "Intelligence before enforcement. Not after."
- 3 pillar cards: Regulatory Tracker / Treasury Intelligence / Vendor Intelligence
  Each: icon (SVG, gold stroke), title, italic tagline in gold, description
  Hover: gold border, subtle gold glow

### Section 6: Free Tools Preview
- Section label: "Free Tools for the Region"
- Heading: "Before you buy intelligence, use the intelligence."
- 3 mockup cards: Regulatory Map / Exchange True Cost Calculator / BTC Treasury Tracker
  Use static mockup data (not live API) for the preview cards — this is the marketing page, not the actual tool.
- CTA: "Explore free tools →" (ghost button, links to /tools)

### Section 7: Pricing
- Section label: "Pricing"
- Heading: "Priced for the organizations it protects."
- 3-column grid: Intelligence ($499/mo) / Advisory ($2,499/mo, featured gold) / Enterprise (custom)
- Advisory card: gold border, "Most Popular" badge, gold glow
- Annual savings line on Advisory: "$24,999/year — save 17%"
- Feature lists with ✓ in gold
- Below grid: "One VARA fine = 10+ years of an Advisory subscription."

### Section 8: Track Record
- Section label: "Track Record"
- Heading: "Built in the Trenches, Not the Classroom."
- Vertical timeline (gold line, gold markers):
  1. Wolf Accelerator + Axiom Capital — $450K raised
  2. CBB Category 3 provisional license application
  3. THNDR — early conversations
  4. 3 companies licensed through MENA digital asset process
  5. 21+ institutional buyers, ~100 BTC at institutional rates
  6. 15–20% OTC cost reduction vs retail
- Closing note (gold left border): "This is not a compliance firm..."

### Section 9: Weekly Brief CTA
- Gold left border card
- Headline: "The MENA Digital Asset Brief — Every Monday."
- Description: "What changed in VARA, CBB, ADGM, and FSRA last week..."
- Form: work email input + "Subscribe →" button
- POST to `/api/subscribe`
- Social proof line: "Read by compliance officers, CFOs, and family office managers across UAE, Bahrain, Saudi Arabia, and Egypt."

### Section 10: Footer
- Logo + BrandName + disclaimer
- Navigation links
- Social: LinkedIn + X

---

## Performance Targets
- Lighthouse Performance: >90
- FCP: <1.5s
- Use `next/font` for self-hosted font fallbacks (supplement Fontshare)
- Use `next/image` for any bitmap images
- Lazy-load below-fold sections with React Suspense + skeleton

## Accessibility
- All interactive elements have aria-labels
- Keyboard nav works through the full page
- Color contrast ratios: text on surface ≥4.5:1, text on gold ≥4.5:1 (check with `color-contrast` tool)
- Reduced motion: honor `prefers-reduced-motion` (no animations if set)
