# Required Environment Variables

All variables must be set in Vercel project settings (or `.env.local` for local dev).
Never commit `.env*` files.

---

## Upstash Redis

| Variable | Description |
|---|---|
| `UPSTASH_REDIS_REST_URL` | REST URL from Upstash console (e.g. `https://xxx.upstash.io`) |
| `UPSTASH_REDIS_REST_TOKEN` | REST token from Upstash console |

Used by: all data persistence (subscribers, analytics, regulatory updates, vault metadata).

---

## Vercel Blob

| Variable | Description |
|---|---|
| `BLOB_READ_WRITE_TOKEN` | Read-write token from Vercel Blob dashboard |

Used by: encrypted vault file storage (`src/lib/vault-storage.ts`).

---

## Vault Encryption

| Variable | Description |
|---|---|
| `VAULT_MASTER_KEY` | AES-256 master key — minimum 32 characters. Generate with: `openssl rand -hex 32` |

Used by: `src/lib/vault-crypto.ts`. Required — server will throw on startup if missing or too short.

---

## Clerk Authentication

| Variable | Description |
|---|---|
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` | Publishable key from Clerk dashboard |
| `CLERK_SECRET_KEY` | Secret key from Clerk dashboard |
| `NEXT_PUBLIC_CLERK_SIGN_IN_URL` | Sign-in page path (e.g. `/login`) |
| `NEXT_PUBLIC_CLERK_SIGN_UP_URL` | Sign-up page path (e.g. `/register`) |
| `NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL` | Redirect after sign-in (e.g. `/dashboard`) |
| `NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL` | Redirect after sign-up (e.g. `/onboarding`) |

Used by: `src/middleware.ts` and all protected routes.

---

## Telegram Bot (optional)

| Variable | Description |
|---|---|
| `TELEGRAM_BOT_TOKEN` | Bot token from @BotFather |
| `TELEGRAM_WEBHOOK_SECRET` | Secret token configured when setting the Telegram webhook. Sent back on each webhook request as `X-Telegram-Bot-Api-Secret-Token`. |

Used by: `src/app/api/bot/telegram/route.ts` and `src/app/api/cron/crawl/route.ts`. If unset, outbound bot messaging is disabled, and the webhook route now rejects requests instead of accepting unsigned updates.

---

## Cron Security (optional)

| Variable | Description |
|---|---|
| `CRON_SECRET` | Shared secret for protecting cron endpoints. Requests must include `Authorization: Bearer <secret>`. Cron routes fail closed if this is missing. |

Used by: `/api/cron/crawl`, `/api/cron/crawl-regulatory`, and `/api/dashboard/seed`.

---

## Public Site URL

| Variable | Description |
|---|---|
| `NEXT_PUBLIC_APP_URL` | Canonical site URL (e.g. `https://zawda.me`) — primary. Also accepted as `NEXT_PUBLIC_SITE_URL` for backward compatibility. |

Used by: JSON-LD structured data in `src/app/layout.tsx`, `robots.ts`, `sitemap.ts`.

---

## Email (Resend)

| Variable | Description |
|---|---|
| `RESEND_API_KEY` | API key from Resend dashboard (resend.com) |
| `RESEND_FROM_EMAIL` | Sender address (e.g. `compliance@zawda.me`) — must be a verified domain in Resend. Also accepted as `FROM_EMAIL` for backward compatibility. |
| `PRIVACY_EMAIL` | Where DSAR confirmation copies and new-request alerts are sent (e.g. `privacy@zawda.me`) |
| `OPS_ALERT_EMAIL` | Where incident breach alerts are sent (e.g. `ops@zawda.me`) |

Used by: `src/lib/dsar.ts` (DSAR confirmation + admin alert) and `src/lib/incident.ts` (breach notification pipeline, SLA §6.5).

---

## Clerk Webhook

| Variable | Description |
|---|---|
| `CLERK_WEBHOOK_SECRET` | Signing secret from Clerk dashboard → Webhooks (format: `whsec_<base64>`) |

Used by: `src/app/api/webhooks/clerk/route.ts` — logs auth events (login, logout, user created/deleted) to the audit log. If unset, the webhook endpoint is disabled in production. Register the endpoint URL in Clerk dashboard as: `https://your-domain.com/api/webhooks/clerk`.

---

## Generation Commands

```bash
# Vault master key
openssl rand -hex 32

# Cron secret
openssl rand -hex 24
```
