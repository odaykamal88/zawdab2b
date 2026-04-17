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

Used by: `src/app/api/bot/telegram/route.ts` and `src/app/api/cron/crawl/route.ts`. If unset, bot features are disabled but the rest of the app works normally.

---

## Cron Security (optional)

| Variable | Description |
|---|---|
| `CRON_SECRET` | Shared secret for protecting cron endpoints. If set, requests must include `Authorization: Bearer <secret>` |

Used by: `/api/cron/crawl` and `/api/dashboard/seed`.

---

## Public Site URL

| Variable | Description |
|---|---|
| `NEXT_PUBLIC_SITE_URL` | Canonical site URL (e.g. `https://zawda.com`) |

Used by: JSON-LD structured data in `src/app/layout.tsx`.

---

## Generation Commands

```bash
# Vault master key
openssl rand -hex 32

# Cron secret
openssl rand -hex 24
```
