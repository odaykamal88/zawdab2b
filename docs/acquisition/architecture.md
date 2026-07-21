# Zawda — System Architecture (data-room reference)

> Confidential. Drawn from the codebase as of this branch. Intended for an acquirer's technical diligence.

## Stack
- **Framework:** Next.js 16 (App Router, React Server Components), React 19, TypeScript (strict).
- **Styling:** Tailwind CSS v4.
- **Auth:** Clerk (`@clerk/nextjs`).
- **State/limits:** Upstash Redis (rate limiting + KV) via `@upstash/ratelimit`.
- **Document storage:** Vercel Blob (`@vercel/blob`), encrypted at rest (see Vault).
- **Billing:** Chargebee (`chargebee`).
- **Email:** Resend. **Bot:** Telegram.
- **Hosting:** Vercel (cron via `vercel.json`; security headers on `/api/*`).

## Domains / modules
1. **Marketing + assessment funnel** — landing page and an interactive compliance assessment that produces a jurisdiction recommendation (lead capture).
2. **Regulatory intelligence (core data asset)** — `lib/jurisdiction-intelligence.ts` (jurisdiction profiles, licences, scoring, `findBestJurisdiction`), `lib/licensing-data.ts` (per-jurisdiction licensing steps/risks), `lib/regulatory-sources.ts` (official regulator source registry), `lib/top-risks.ts`. A daily crawler (`app/api/cron/crawl`) ingests regulator updates; a Telegram bot distributes the brief.
3. **Licensing dashboard** — calendar, alerts, document checklist/vault, risk advisory, enforcement tracker, audit-prep (gated by subscription/role).
4. **Document vault** — `lib/vault-crypto.ts` (AES-256-GCM, scrypt-derived key from `VAULT_MASTER_KEY`) + `lib/vault-storage.ts` (Vercel Blob). Managed-key model — **not** zero-knowledge.
5. **Compliance/ops** — DSAR pipeline (`lib/dsar.ts`), incident notifications (`lib/incident.ts`), tamper-aware audit log (`lib/audit-log.ts`), SLA/ToS pages.
6. **Payments** — Chargebee checkout, billing portal, subscription state (`lib/chargebee.ts`, `lib/subscription.ts`), webhooks (`app/api/webhooks/chargebee`, `.../clerk`).
7. **Agent Controls (new IP — Sprint 3)** — `lib/agent-controls/`: a policy-enforcement engine that authorizes or intercepts a proposed agent transaction *before signing*. Pluggable intelligence (real OFAC SDN sanctions provider + interface for a KYT provider), five programmatic policies (sanctions, risk, per-tx limit, daily limit, jurisdiction allowlist), and a hash-chained tamper-evident audit log. Demo at `/agent-controls`; runnable via `npx tsx scripts/agent-controls-demo.ts`.
8. **v1 API (Sprint 2)** — see [api.md](api.md). `GET /api/v1/jurisdictions[/id]` (public, provenance-enriched), `POST /api/v1/assess` (API-key-gated recommendation engine).

## Security posture
- Proprietary regulatory logic runs **server-side only**; clients receive results, never the scoring weights or decision trees (Defense Principle 1).
- Rate limiting on API routes (Upstash sliding window). Security headers (`X-Content-Type-Options`, `X-Frame-Options`) on `/api/*`.
- Vault documents encrypted at rest (AES-256-GCM) and in transit (TLS). Audit logging on sensitive operations.
- Superadmin role-gating on admin routes.

## Known issues (disclosed for diligence)
- **Stale generated types:** `.next/**/validator.ts` references a non-existent `api/cron/crawl-regulatory` route → 2 `tsc` errors from generated artifacts (not source). Clear `.next` / rename to resolve.
- **Clerk JS load:** the app loads Clerk from `clerk.zawda.me`; confirm this is correctly configured in production (it fails to load in the sandboxed preview environment).
- **Data accuracy follow-up:** reconcile the CBB crypto-asset **category descriptions** in `jurisdiction-intelligence.ts` / `licensing-data.ts` against the CBB CRA Module (they are internally inconsistent and should be sourced).
