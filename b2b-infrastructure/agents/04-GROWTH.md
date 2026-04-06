# agents/04-GROWTH.md — Growth + Revenue Team Lead

You are running the Growth + Revenue team. Three agents report to this file: growth-analytics, growth-conversion, growth-seo.
Read AGENTS.md for file ownership. Growth agents produce specs and implement analytics — they do NOT build core product features.

---

## Conversion Funnel

Three acquisition paths. Every growth decision should serve one of these:

**1. Organic (primary growth engine)**
Organic search → regulatory/tool page → "get the weekly brief" (email capture) → 4-week email sequence → "upgrade to Intelligence" upsell.
Key metric: brief subscribers per week. Target: 100 subscribers within 60 days of launch.

**2. Direct (primary revenue engine)**
LinkedIn outreach by founder → demo request → Advisory call → close.
Key metric: demos scheduled per week. Target: 2–3 demos/week by month 2.
Founder owns this channel. Growth agent's job: build the "Request Access" flow that makes it easy to capture and follow up.

**3. Referral (high-value enterprise)**
Existing clients (3 licensed companies) → warm introduction → Enterprise.
Key metric: 1 Enterprise client by month 6.

---

## Analytics Implementation

### `src/lib/analytics.ts` — Canonical Event Taxonomy

```typescript
type EventName = 
  | 'cta_click'
  | 'pricing_view'
  | 'tool_use'
  | 'brief_signup'
  | 'demo_request'

type EventProperties = {
  cta_click: { section: string; button_label: string; tier?: string }
  pricing_view: { tier_hovered: string }
  tool_use: { tool_name: string; duration_seconds: number }
  brief_signup: { source_section: string }
  demo_request: { tier_interest: string; company_size?: string }
}

export function track<T extends EventName>(
  event: T, 
  properties: EventProperties[T]
): void {
  // Plausible custom event
  if (typeof window !== 'undefined' && (window as any).plausible) {
    (window as any).plausible(event, { props: properties })
  }
  // Clarity event (for session recording context)
  if (typeof window !== 'undefined' && (window as any).clarity) {
    (window as any).clarity('event', event)
  }
}
```

### Where Frontend Agents Must Wire `track()` Calls
- Alert bar dismiss: `track('cta_click', { section: 'alert_bar', button_label: 'view_pain' })`
- Hero "Request Access" click: `track('cta_click', { section: 'hero', button_label: 'request_access', tier: 'unknown' })`
- Hero "See Weekly Brief" click: `track('cta_click', { section: 'hero', button_label: 'see_brief' })`
- Pricing card hover: `track('pricing_view', { tier_hovered: tier.name })`
- Each tool page: `track('tool_use', { tool_name: 'regulatory_map', duration_seconds: elapsed })`
- Brief signup form submit: `track('brief_signup', { source_section: 'weekly_brief_cta' })`
- "Request Access" modal submit: `track('demo_request', { tier_interest: selectedTier })`

### Plausible Setup
Script tag: `<Script defer data-domain="yourdomain.com" src="https://plausible.io/js/script.tagged-events.js" />`
Set up in `src/app/layout.tsx`. Domain configured via env `NEXT_PUBLIC_PLAUSIBLE_DOMAIN`.

### Clarity Setup
Inject Clarity snippet via `src/app/layout.tsx`. Project ID via env `NEXT_PUBLIC_CLARITY_ID`.

---

## Lead Capture System

### "Request Access" Flow (high-intent CTA)

This is the primary B2B conversion action. Every "Request Access" button on the site goes through this flow.

**UX Flow**:
1. User clicks "Request Access" (any section)
2. Modal opens: company name (required), work email (required), role (select: CFO / Compliance Officer / Family Office / Broker / Other), tier interest (select: Intelligence $499 / Advisory $2,499 / Enterprise / Not sure)
3. Submit → POST `/api/leads`
4. Success state: "We'll be in touch within 1 business day. Meanwhile, get the free weekly brief." + brief signup form pre-filled with their email.

**Lead capture route**: `POST /api/leads`
```typescript
// Body:
interface LeadCapture {
  email: string
  company: string
  role: string
  tierInterest: string
  source: string   // which page/section they came from
}

// Actions:
// 1. Validate fields (email format, required fields)
// 2. Append to src/data/leads.csv
// 3. Add to Resend audience with tags: role, tierInterest, source
// 4. Send founder notification email: "New lead: [company] ([role]) interested in [tier]"
// 5. Send lead confirmation: "We'll be in touch within 1 business day."
```

**leads.csv format**: `timestamp,email,company,role,tierInterest,source`

### Weekly Brief Signup Flow (lower-intent, top-of-funnel)

**UX Flow**:
1. User enters work email in brief form (any section — hero and dedicated section both have forms)
2. Submit → POST `/api/subscribe`
3. Success: "You're on the list. First brief arrives Monday." (inline confirmation, no page redirect)
4. Server: adds to Resend 'weekly-brief' audience, sends welcome email immediately

---

## Email Sequences (Resend Automations)

### Sequence 1: Brief Welcome (trigger: brief_signup)
- **Immediately**: Welcome email — what to expect, link to latest brief archive, "What's happening in VARA right now" teaser
- **Day 3**: "Here's what most compliance officers miss about VARA's licensing register" (regulatory insight + link to regulatory map tool)

### Sequence 2: Brief → Intelligence Upsell (trigger: 4th brief received, no purchase)
- **Week 4 Monday** (same day as brief send): "You've been reading the brief for a month. Here's what Intelligence subscribers get that you don't." → link to pricing page. Use `track('cta_click', ...)` on the email CTA.

### Sequence 3: Demo No-Show (trigger: demo_scheduled but no Calendly confirmation)
- **Day 1**: "Did we get the time wrong? Here's the link to reschedule."
- **Day 3**: "Quick question — what's blocking your digital asset compliance right now?" (open-ended, reply-based)

### Email Sending Rules
- Max 1 email per day per contact (Resend can enforce this via audience suppressions)
- Unsubscribe link required on every email (Resend handles this)
- From: `team@[domain]` or `[founder name] <[email]>` for direct sequences. Never a no-reply.

---

## Pricing Psychology — Implementation Notes

These principles must be reflected in the fe-marketing implementation:

1. **Lead with pain, not features**: The stat cards (AED 600K, $8.85M, March 2026) appear before the product section. The fines come before the pricing. This order is intentional and must not be changed.

2. **Advisory card is the primary offer**: Gold border, "Most Popular" badge, slight elevation above other cards (use `scale-[1.02]` or a top offset). Advisory is the highest-margin tier. It should visually dominate the pricing section.

3. **The comparison line is mandatory**: "One VARA fine = 10+ years of an Advisory subscription." This must appear directly below the pricing grid. Do not move, soften, or remove it.

4. **Annual pricing reveal**: On the Advisory card, monthly price shown by default. "Save 17%" or annual price appears on hover or via a monthly/annual toggle. Do not hide the annual option — it increases close rate.

5. **Enterprise is an anchor**: The Enterprise card ($50K+/year) makes Advisory look affordable. This is intentional anchoring. Enterprise should always be displayed third, not first.

6. **"Request Access" not "Buy Now"**: B2B sales are consultative. CTAs say "Request Access" and "Schedule a Call" — not "Subscribe Now" or "Buy." The journey ends in a call with the founder, not a self-serve purchase (for Advisory+).

---

## SEO Strategy (growth-seo)

**Output file**: `docs/growth/seo-strategy.md`

### Target Keywords with Intent Mapping

| Keyword | Monthly Volume (est) | Difficulty | Intent | Target Page |
|---|---|---|---|---|
| VARA license requirements UAE | 500–2K | Medium | Commercial | /regulation/uae |
| ADGM virtual asset framework | 200–500 | Medium | Informational | /regulation/uae |
| CBB crypto license Bahrain | 100–500 | Low | Commercial | /regulation/bahrain |
| MENA crypto regulation 2026 | 200–1K | Low | Informational | /regulation |
| UAE Travel Rule compliance | 100–500 | Medium | Commercial | /tools + blog |
| Bitcoin treasury corporate MENA | 100–300 | Low | Informational | /tools/btc-treasury |
| how to get VARA license | 200–500 | Low | Commercial | /regulation/uae FAQ |
| VARA enforcement actions 2025 | 50–200 | Low | Informational | Brief archive |

### Backlink Opportunities
1. **Fintech publications**: Wamda, Magnitt, ArabianBusiness — pitch data-driven pieces on VARA enforcement
2. **Law firm blogs**: Dentons MENA, Clyde & Co, Baker McKenzie — they rank for same terms, potential co-authorship
3. **Accelerator networks**: Wolf Accelerator portfolio pages — easy win (founder is alumni)
4. **LinkedIn articles**: Publish brief excerpts on LinkedIn weekly — generates referral traffic + authority signals

### GSC Setup Checklist
- [ ] Add GSC property for the domain
- [ ] Submit sitemap.xml URL
- [ ] Verify ownership via DNS TXT record or Next.js meta tag
- [ ] Set up weekly rank tracking for primary 8 keywords (manual or SEMrush)
- [ ] Set up GSC Core Web Vitals monitoring alert (email notification on degradation)
