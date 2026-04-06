# CLAUDE.md — B2B Intelligence Site

## What This Is
A B2B marketing and intelligence platform for MENA treasury and digital-asset compliance.
NOT a brokerage. NOT the retail finance dashboard (zawda app). NOT a licensed financial advisor.
Primary audience: CFOs, compliance officers, family office managers, treasury teams, wealth platforms.

## Stack
- Next.js 14+ App Router, TypeScript strict (`"strict": true` in tsconfig), Tailwind CSS
- Upstash Redis for caching (via `@upstash/redis`)
- Resend for email delivery
- Clerk for auth (MVP simplest path)
- Vercel deployment with Cron Jobs for autonomous crawler

## Universal Rules
- No `any` types. No hardcoded strings outside data files. No inline styles.
- No spinners — use skeleton loaders only.
- Dark mode is primary. Light mode is secondary.
- Mobile-first: design at 375px, scale to 1440px.
- ALL regulatory figures must be sourced — never invent a fine amount, license cost, or deadline.
  If you cite AED 600K or $8.85M, you must have a source URL in the component or data file.
- Brand name lives in CSS variable `--brand-name` and env `NEXT_PUBLIC_BRAND_NAME`. Use the
  `<BrandName />` component — never hardcode "Zawda" in JSX.
- i18n-ready from day 1: strings in `messages/` via next-intl, even if only English ships first.
- Commit format: `[team/agent] description` (e.g. `[fe-design] add gold border token`)

## Before You Code
1. Read your team file in `agents/` (e.g. `agents/01-FRONTEND.md`).
2. Check `docs/CURRENT-STATE.md` — know what already exists before creating anything.
3. Check `AGENTS.md` for file ownership — do not touch files owned by another agent.
4. Run `npm run build && npm run lint` before marking any task done.

## Design Tokens (quick reference)
- bg-primary: `#0a0e1a` | surface: `#111827` | surface-2: `#1a2236`
- border: `#1e2d45` | text: `#e8edf5` | muted: `#6b7a99`
- gold: `#D4A853` | red-alert: `#dc2626`
- Fonts: Cabinet Grotesk (display), Satoshi (body), JetBrains Mono (numbers)
- Full token reference: see `docs/reference/style.css` (copied from prototype)

## Verification Checklist
- [ ] `npm run build` zero errors
- [ ] `npm run lint` clean
- [ ] No TypeScript `any` (run `tsc --noEmit`)
- [ ] Responsive: test at 375px and 1440px
- [ ] Regulatory figures have source comments in the file where they appear
