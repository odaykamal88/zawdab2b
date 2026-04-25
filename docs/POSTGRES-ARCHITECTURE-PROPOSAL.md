# Postgres Architecture Proposal

Concrete target-state schema and migration plan for moving Zawda off Redis-backed JSON blobs and onto a durable B2B-friendly data model.

## Recommendation

- Use `Postgres` as the primary system of record.
- Keep `Upstash Redis` only for rate limiting, short-lived cache, and lightweight locks.
- Keep `Vercel Blob` for encrypted file binaries, but move all file metadata and access control into Postgres.
- Keep the app multi-tenant in a single shared database, with `organization_id` as the ownership boundary on all customer-owned rows.
- Do not keep business data keyed by `clerkId` alone. A single user may belong to multiple organizations, while billing and documents belong to the organization.

For this repo, the cleanest first move is:

- `Vercel + Neon Postgres` through Vercel Marketplace
- `Clerk` for auth
- `Upstash Redis` for rate limiting and cache only
- `Vercel Blob` for private encrypted documents

Why this fits this codebase:

- You already use Vercel, Clerk, Blob, and Upstash.
- You do not need to replace auth or storage to fix the data model.
- Neon's branch and restore workflow is useful for safer schema changes, test environments, and rollback drills.

## Current Problems To Fix

Today, important business records are stored as full JSON payloads in Redis:

- `sub:{clerkId}` and `sub:cbcust:{cbCustomerId}` for subscriptions
- `vault:{tenantId}:index` for document metadata
- `dsar:requests` for DSAR requests
- `incidents:list` for incidents
- `audit:log` for audit history
- `reg:updates` for crawler output
- `bot:subscribers` for Telegram subscribers
- `subscribers` for marketing subscribers
- `analytics` for aggregate counters

That creates a few structural issues:

- No transactional integrity across related writes
- Lost-update risk from read-modify-write array patterns
- Weak querying and filtering
- Weak uniqueness guarantees
- No durable idempotency for webhooks
- No real tenant boundary beyond `userId`
- Hard to audit, export, or restore individual records cleanly

## Current Key Mapping

| Current Store | Current Key / Shape | Target Postgres Tables |
|---|---|---|
| Redis | `sub:{clerkId}` | `users`, `organizations`, `organization_members`, `billing_accounts`, `subscriptions` |
| Redis | `sub:cbcust:{cbCustomerId}` | `billing_accounts`, `subscriptions` with unique provider indexes |
| Redis | `vault:{tenantId}:index` | `vault_documents`, `vault_document_versions` |
| Blob | encrypted file object | keep in Blob, reference from `vault_document_versions` |
| Redis | `dsar:requests` | `dsar_requests` |
| Redis | `incidents:list` | `incidents`, `incident_notifications` |
| Redis | `audit:log` | `audit_events` |
| Redis | `reg:updates` | `regulatory_sources`, `regulatory_updates` |
| Redis | `bot:subscribers` | `alert_subscriptions` |
| Redis | `subscribers` | `marketing_subscribers` |
| Redis | `analytics` | replace with product analytics tool or append-only `app_events` plus rollups |

## Target Ownership Model

Use these ownership rules consistently:

- `User` = human identity from Clerk
- `Organization` = paying company / customer account
- `Organization membership` = which users belong to which organization
- `Billing` belongs to the organization
- `Documents` belong to the organization
- `DSAR`, `incident`, and `audit` records should be organization-scoped when applicable
- `Regulatory updates` are global platform data
- `Alert deliveries` are per subscription or per destination, not globally marked as dispatched

This is the most important modeling shift in the whole proposal.

## Recommended Runtime Shape

- App traffic uses a pooled Postgres connection string in `DATABASE_URL`
- Migrations and admin scripts use a direct connection string in `DATABASE_URL_DIRECT`
- Vercel Functions should run in the same region as the database
- Redis remains for:
  - rate limits
  - short cache TTLs
  - webhook dedupe windows if needed
  - cron locks / leader election

## Schema Design

### 1. Identity And Tenancy

#### `users`

Canonical app user mapped from Clerk.

| Column | Type | Notes |
|---|---|---|
| `id` | `uuid primary key` | internal ID |
| `clerk_user_id` | `text not null unique` | external auth ID |
| `primary_email` | `citext` | nullable if unavailable during sync |
| `first_name` | `text` | nullable |
| `last_name` | `text` | nullable |
| `status` | `text not null default 'active'` | `active`, `invited`, `disabled` |
| `created_at` | `timestamptz not null default now()` | |
| `updated_at` | `timestamptz not null default now()` | |

Indexes:

- unique on `clerk_user_id`
- index on `primary_email`

#### `organizations`

The top-level tenant.

| Column | Type | Notes |
|---|---|---|
| `id` | `uuid primary key` | |
| `slug` | `text not null unique` | stable workspace slug |
| `legal_name` | `text not null` | company legal name |
| `display_name` | `text` | optional shorter name |
| `website_url` | `text` | |
| `primary_jurisdiction_code` | `text` | e.g. `VARA`, `ADGM` |
| `status` | `text not null default 'active'` | `active`, `trialing`, `suspended`, `closed` |
| `created_at` | `timestamptz not null default now()` | |
| `updated_at` | `timestamptz not null default now()` | |

Indexes:

- unique on `slug`
- index on `primary_jurisdiction_code`

#### `organization_members`

Join table for users and organizations.

| Column | Type | Notes |
|---|---|---|
| `organization_id` | `uuid not null references organizations(id)` | |
| `user_id` | `uuid not null references users(id)` | |
| `role` | `text not null` | `owner`, `admin`, `member`, `auditor`, `billing` |
| `is_primary_contact` | `boolean not null default false` | |
| `joined_at` | `timestamptz not null default now()` | |
| `created_at` | `timestamptz not null default now()` | |

Keys and indexes:

- primary key on `(organization_id, user_id)`
- index on `(user_id, organization_id)`
- index on `(organization_id, role)`

### 2. Organization Profile And Onboarding

These tables replace local-only onboarding state over time.

#### `organization_profiles`

| Column | Type | Notes |
|---|---|---|
| `organization_id` | `uuid primary key references organizations(id)` | |
| `phone_number` | `text` | |
| `entity_status` | `text` | `not-started`, `in-progress`, `established` |
| `team_size` | `text` | `1-5`, `6-20`, `21-50`, `50+` |
| `licensing_stage` | `text` | |
| `recommended_license` | `text` | |
| `selected_license` | `text` | |
| `recommended_jurisdiction` | `text` | |
| `completed_at` | `timestamptz` | |
| `updated_at` | `timestamptz not null default now()` | |

#### `organization_jurisdictions`

| Column | Type | Notes |
|---|---|---|
| `organization_id` | `uuid not null references organizations(id)` | |
| `jurisdiction_code` | `text not null` | |
| `kind` | `text not null` | `primary`, `additional`, `target` |
| `created_at` | `timestamptz not null default now()` | |

Keys and indexes:

- primary key on `(organization_id, jurisdiction_code, kind)`
- index on `(jurisdiction_code, kind)`

#### `organization_activities`

| Column | Type | Notes |
|---|---|---|
| `organization_id` | `uuid not null references organizations(id)` | |
| `activity_code` | `text not null` | |
| `created_at` | `timestamptz not null default now()` | |

Keys and indexes:

- primary key on `(organization_id, activity_code)`

### 3. Billing

#### `billing_accounts`

One billing identity per organization.

| Column | Type | Notes |
|---|---|---|
| `id` | `uuid primary key` | |
| `organization_id` | `uuid not null unique references organizations(id)` | |
| `provider` | `text not null` | start with `chargebee` |
| `provider_customer_id` | `text not null unique` | Chargebee customer ID |
| `billing_email` | `citext` | |
| `currency_code` | `text` | |
| `status` | `text not null default 'active'` | |
| `created_at` | `timestamptz not null default now()` | |
| `updated_at` | `timestamptz not null default now()` | |

Indexes:

- unique on `organization_id`
- unique on `(provider, provider_customer_id)`

#### `subscriptions`

Actual subscription state.

| Column | Type | Notes |
|---|---|---|
| `id` | `uuid primary key` | |
| `organization_id` | `uuid not null references organizations(id)` | |
| `billing_account_id` | `uuid not null references billing_accounts(id)` | |
| `provider` | `text not null` | |
| `provider_subscription_id` | `text unique` | |
| `plan_id` | `text not null` | matches Chargebee item price / internal plan |
| `status` | `text not null` | `free`, `trialing`, `active`, `non_renewing`, `paused`, `cancelled` |
| `current_period_start` | `timestamptz` | |
| `current_period_end` | `timestamptz` | |
| `trial_end` | `timestamptz` | |
| `cancel_at` | `timestamptz` | |
| `provider_updated_at` | `timestamptz` | source-of-truth timestamp from provider |
| `updated_at` | `timestamptz not null default now()` | |

Indexes:

- unique on `(provider, provider_subscription_id)`
- index on `(organization_id, status)`
- index on `(plan_id, status)`

#### `webhook_events`

Durable idempotency and replay protection.

| Column | Type | Notes |
|---|---|---|
| `id` | `uuid primary key` | |
| `provider` | `text not null` | `chargebee`, `clerk` |
| `external_event_id` | `text not null` | provider delivery ID or event ID |
| `event_type` | `text not null` | |
| `status` | `text not null default 'received'` | `received`, `processed`, `ignored`, `failed` |
| `received_at` | `timestamptz not null default now()` | |
| `processed_at` | `timestamptz` | |
| `organization_id` | `uuid` | nullable until resolved |
| `payload` | `jsonb not null` | original webhook body |
| `error_text` | `text` | nullable |

Indexes:

- unique on `(provider, external_event_id)`
- index on `(provider, status, received_at desc)`
- index on `(organization_id, received_at desc)`

### 4. Vault And Documents

Keep file bytes in Blob. Move all metadata, permissions, and versions into Postgres.

#### `vault_documents`

Logical document record.

| Column | Type | Notes |
|---|---|---|
| `id` | `uuid primary key` | |
| `organization_id` | `uuid not null references organizations(id)` | tenant boundary |
| `external_doc_id` | `text` | optional stable ID from UI |
| `category` | `text` | e.g. `entity-setup`, `policy`, `licensing` |
| `title` | `text not null` | human label |
| `status` | `text not null default 'uploaded'` | `missing`, `draft`, `uploaded`, `approved`, `rejected` |
| `latest_version_id` | `uuid` | set after version insert |
| `created_by_user_id` | `uuid references users(id)` | |
| `approved_by_user_id` | `uuid references users(id)` | nullable |
| `created_at` | `timestamptz not null default now()` | |
| `updated_at` | `timestamptz not null default now()` | |
| `deleted_at` | `timestamptz` | soft delete |

Indexes:

- unique on `(organization_id, external_doc_id)` where `external_doc_id is not null`
- index on `(organization_id, status, updated_at desc)`
- index on `(organization_id, category, updated_at desc)`

#### `vault_document_versions`

Immutable file versions.

| Column | Type | Notes |
|---|---|---|
| `id` | `uuid primary key` | |
| `document_id` | `uuid not null references vault_documents(id)` | |
| `version_no` | `integer not null` | 1, 2, 3... |
| `blob_pathname` | `text not null unique` | store the Blob pathname, not just URL |
| `blob_url` | `text` | optional convenience field |
| `filename` | `text not null` | original name |
| `mime_type` | `text not null` | |
| `size_bytes` | `bigint not null` | |
| `sha256` | `text not null` | |
| `encryption_key_version` | `text` | for future KMS rotation support |
| `uploaded_by_user_id` | `uuid references users(id)` | |
| `created_at` | `timestamptz not null default now()` | |

Indexes:

- unique on `(document_id, version_no)`
- index on `(document_id, created_at desc)`

### 5. DSAR And Incident Operations

#### `dsar_requests`

| Column | Type | Notes |
|---|---|---|
| `id` | `uuid primary key` | |
| `organization_id` | `uuid references organizations(id)` | nullable if platform-level |
| `requester_user_id` | `uuid references users(id)` | nullable |
| `requester_email` | `citext not null` | |
| `subject_user_id` | `uuid references users(id)` | nullable |
| `subject_email` | `citext` | nullable |
| `request_type` | `text not null` | `access`, `rectification`, `erasure`, `restriction`, `objection` |
| `status` | `text not null` | `open`, `in_progress`, `completed`, `rejected` |
| `notes` | `text` | |
| `opened_at` | `timestamptz not null` | |
| `due_at` | `timestamptz not null` | |
| `closed_at` | `timestamptz` | |
| `assigned_to_user_id` | `uuid references users(id)` | nullable |

Indexes:

- index on `(organization_id, status, due_at)`
- index on `(status, due_at)`
- index on `(requester_email)`

#### `incidents`

| Column | Type | Notes |
|---|---|---|
| `id` | `uuid primary key` | |
| `organization_id` | `uuid references organizations(id)` | nullable if platform-wide |
| `severity` | `text not null` | `critical`, `high`, `medium`, `low` |
| `status` | `text not null` | `open`, `investigating`, `notified`, `resolved` |
| `title` | `text not null` | |
| `description` | `text not null` | |
| `affected_user_count` | `integer` | |
| `flagged_by_user_id` | `uuid references users(id)` | nullable |
| `flagged_at` | `timestamptz not null` | |
| `notification_due_at` | `timestamptz not null` | precomputed 72h SLA deadline |
| `notified_at` | `timestamptz` | |
| `resolved_at` | `timestamptz` | |
| `notes` | `text` | |
| `created_at` | `timestamptz not null default now()` | |

Indexes:

- index on `(organization_id, status, flagged_at desc)`
- index on `(status, severity, flagged_at desc)`

#### `incident_notifications`

Each outbound notification gets its own row.

| Column | Type | Notes |
|---|---|---|
| `id` | `uuid primary key` | |
| `incident_id` | `uuid not null references incidents(id)` | |
| `recipient_email` | `citext not null` | |
| `channel` | `text not null` | `email` initially |
| `delivery_status` | `text not null` | `queued`, `sent`, `failed` |
| `provider_message_id` | `text` | |
| `sent_at` | `timestamptz` | |
| `error_text` | `text` | |
| `created_at` | `timestamptz not null default now()` | |

Indexes:

- unique on `(incident_id, recipient_email, channel)`
- index on `(delivery_status, created_at desc)`

### 6. Regulatory Intelligence And Alerting

#### `regulatory_sources`

| Column | Type | Notes |
|---|---|---|
| `id` | `text primary key` | source slug such as `vara` |
| `name` | `text not null` | |
| `jurisdiction_code` | `text not null` | |
| `feed_url` | `text` | |
| `active` | `boolean not null default true` | |
| `last_crawled_at` | `timestamptz` | |
| `created_at` | `timestamptz not null default now()` | |

#### `regulatory_updates`

Global platform data, not tenant-owned.

| Column | Type | Notes |
|---|---|---|
| `id` | `uuid primary key` | |
| `source_id` | `text not null references regulatory_sources(id)` | |
| `jurisdiction_code` | `text not null` | |
| `regulator` | `text not null` | |
| `update_type` | `text not null` | `regulation`, `deadline`, `guidance`, `consultation` |
| `severity` | `text not null` | |
| `title` | `text not null` | |
| `summary` | `text not null` | |
| `canonical_url` | `text not null` | |
| `source_published_at` | `timestamptz not null` | |
| `effective_at` | `timestamptz` | |
| `deadline_at` | `timestamptz` | |
| `content_hash` | `text not null` | dedupe key |
| `metadata` | `jsonb not null default '{}'::jsonb` | crawler-specific extras |
| `created_at` | `timestamptz not null default now()` | |

Indexes:

- unique on `(source_id, content_hash)`
- index on `(jurisdiction_code, source_published_at desc)`
- index on `(severity, source_published_at desc)`

#### `alert_subscriptions`

Replaces Redis bot subscriber arrays and supports future email alerts too.

| Column | Type | Notes |
|---|---|---|
| `id` | `uuid primary key` | |
| `organization_id` | `uuid references organizations(id)` | nullable for individual marketing-style alerts |
| `user_id` | `uuid references users(id)` | nullable |
| `channel` | `text not null` | `telegram`, `email` |
| `destination` | `text not null` | chat ID or email |
| `active` | `boolean not null default true` | |
| `preferences` | `jsonb not null default '{}'::jsonb` | jurisdictions, severity limits, weekly caps |
| `last_sent_at` | `timestamptz` | |
| `created_at` | `timestamptz not null default now()` | |

Indexes:

- unique on `(channel, destination)`
- index on `(organization_id, active)`

#### `alert_deliveries`

Per-update delivery tracking. This replaces the current single global `dispatched` flag.

| Column | Type | Notes |
|---|---|---|
| `id` | `uuid primary key` | |
| `regulatory_update_id` | `uuid not null references regulatory_updates(id)` | |
| `subscription_id` | `uuid not null references alert_subscriptions(id)` | |
| `channel` | `text not null` | |
| `status` | `text not null` | `queued`, `sent`, `failed`, `skipped` |
| `attempted_at` | `timestamptz not null default now()` | |
| `delivered_at` | `timestamptz` | |
| `provider_message_id` | `text` | |
| `error_text` | `text` | |

Indexes:

- unique on `(regulatory_update_id, subscription_id, channel)`
- index on `(status, attempted_at desc)`

### 7. Marketing And Analytics

#### `marketing_subscribers`

Keep marketing email subscriptions separate from product data.

| Column | Type | Notes |
|---|---|---|
| `id` | `uuid primary key` | |
| `email` | `citext not null unique` | |
| `source` | `text not null` | `weekly-brief` etc |
| `subscribed_at` | `timestamptz not null` | |
| `unsubscribed_at` | `timestamptz` | nullable |
| `created_at` | `timestamptz not null default now()` | |

Indexes:

- unique on `email`
- index on `(source, subscribed_at desc)`

#### `app_events` (optional)

Only create this if you need product analytics under your own control.

| Column | Type | Notes |
|---|---|---|
| `id` | `uuid primary key` | |
| `organization_id` | `uuid references organizations(id)` | nullable |
| `user_id` | `uuid references users(id)` | nullable |
| `event_name` | `text not null` | |
| `properties` | `jsonb not null default '{}'::jsonb` | |
| `occurred_at` | `timestamptz not null default now()` | |

Indexes:

- index on `(event_name, occurred_at desc)`
- index on `(organization_id, occurred_at desc)`

If anonymous marketing analytics are the main goal, use Vercel Analytics or PostHog instead of storing page-view counters in Postgres.

### 8. Audit

#### `audit_events`

Use an append-only table.

| Column | Type | Notes |
|---|---|---|
| `id` | `bigint generated always as identity primary key` | better for append-heavy writes |
| `organization_id` | `uuid references organizations(id)` | nullable |
| `actor_user_id` | `uuid references users(id)` | nullable |
| `actor_type` | `text not null` | `user`, `system`, `webhook`, `cron` |
| `event_type` | `text not null` | e.g. `vault.upload` |
| `resource_type` | `text not null` | |
| `resource_id` | `text not null` | |
| `status` | `text not null` | `success`, `failure`, `error` |
| `ip` | `inet` | nullable |
| `user_agent` | `text` | nullable |
| `details` | `jsonb not null default '{}'::jsonb` | |
| `created_at` | `timestamptz not null default now()` | |

Indexes:

- index on `(organization_id, created_at desc)`
- index on `(event_type, created_at desc)`
- index on `(resource_type, resource_id, created_at desc)`

Start with a single table. If volume becomes large, move to monthly partitioning later.

## Integrity Rules

These rules matter as much as the tables:

- Every customer-owned table carries `organization_id`
- Every webhook write first inserts into `webhook_events`
- Every provider event uses a unique idempotency key
- Every state-changing write for billing, DSAR, incidents, and vault metadata runs inside a transaction
- File versions are immutable
- Soft-delete documents instead of hard-deleting metadata
- Use unique constraints instead of in-memory dedupe where possible

## Indexing Strategy

Keep indexes aligned with the actual product queries:

- Dashboard lists: `(organization_id, updated_at desc)` or `(organization_id, status, updated_at desc)`
- SLA queues: `(status, due_at)` for DSAR and incidents
- Billing lookups: unique provider IDs and `(organization_id, status)`
- Alerting: `(jurisdiction_code, source_published_at desc)` and unique delivery keys
- Audit drill-down: `(organization_id, created_at desc)` and `(resource_type, resource_id, created_at desc)`

Do not over-index on day one. Add indexes only for real query paths.

## Security And Access Model

Short term:

- Keep database access server-side only through route handlers and service modules
- Enforce membership and org resolution in application code
- Never trust client-supplied `tenantId`, `orgId`, or plan claims

Medium term:

- Add database-level tenant guardrails through session context and row filters if you want stronger defense in depth
- If you later expose database APIs directly, enable Row Level Security on every exposed table

## Suggested Code Layout

When you implement this, keep the DB surface explicit:

- `src/db/client.ts`
- `src/db/migrations/*`
- `src/db/schema/*`
- `src/db/queries/*`
- `src/services/billing/*`
- `src/services/vault/*`
- `src/services/incidents/*`
- `src/services/dsar/*`

Route handlers should call service functions, not embed business SQL directly.

## Phased Migration Plan

### Phase 0: Foundation

Goal: add Postgres without changing user behavior.

- Provision Postgres through Vercel Marketplace
- Add `DATABASE_URL` and `DATABASE_URL_DIRECT`
- Put the database in the same region as Vercel Functions
- Add migration tooling
- Create base tables:
  - `users`
  - `organizations`
  - `organization_members`
  - `billing_accounts`
  - `subscriptions`
  - `webhook_events`
  - `marketing_subscribers`
  - `regulatory_sources`
  - `regulatory_updates`
  - `alert_subscriptions`
  - `alert_deliveries`

Exit criteria:

- migrations run cleanly in dev and preview
- app can connect to Postgres without cutting over reads

### Phase 1: Low-Risk Dual Write

Goal: migrate the least risky datasets first.

- Dual-write new newsletter subscribers to `marketing_subscribers`
- Dual-write new crawler updates to `regulatory_updates`
- Dual-write bot subscribers to `alert_subscriptions`
- Begin writing all Clerk and Chargebee deliveries into `webhook_events`

Exit criteria:

- new rows appear in both Redis and Postgres
- replaying the same webhook does not create duplicate rows

### Phase 2: Tenant Model And Billing

Goal: replace `clerkId`-only ownership with organization ownership.

- Create one initial organization per current customer
- Make the current Clerk user the `owner`
- Backfill subscriptions:
  - current Redis subscription record
  - Chargebee customer ID
  - Chargebee subscription ID
- Update service code to resolve:
  - current user
  - current organization
  - organization membership

Exit criteria:

- billing and feature gates resolve by organization, not user-only keys

### Phase 3: Vault Metadata Cutover

Goal: keep Blob storage, but move metadata and access control to Postgres.

- Backfill each Redis vault index into:
  - `vault_documents`
  - `vault_document_versions`
- Keep the existing Blob objects where they are
- Store `blob_pathname` for each version
- Change upload, list, download, and delete flows to use organization membership

Exit criteria:

- vault routes read from Postgres only
- existing documents remain downloadable

### Phase 4: Compliance Operations

Goal: move DSAR, incidents, and audit data to durable relational storage.

- Backfill `dsar:requests` into `dsar_requests`
- Backfill `incidents:list` into `incidents`
- Start writing incident email sends into `incident_notifications`
- Replace Redis audit list with append-only `audit_events`

Exit criteria:

- admin screens read from Postgres
- SLA filtering and exports work from relational queries

### Phase 5: Final Read Cutover

Goal: remove Redis from system-of-record duties.

- Switch reads fully to Postgres for:
  - subscriptions
  - documents metadata
  - DSAR
  - incidents
  - subscriber lists
  - regulatory updates
  - alert subscriptions and deliveries
- Keep Redis for:
  - rate limits
  - cache
  - short locks

Exit criteria:

- no route depends on Redis for durable business state
- old Redis keys can be retired after a bake period

## Data Migration Notes

- Do not try to migrate the Redis `analytics` object into the core transactional schema unless you truly need it.
- For the first pass, create one organization per existing user account. You can merge or restructure later if two users should belong to the same company.
- For vault rows, preserve:
  - original `sha256`
  - original `blobPathname`
  - original upload timestamp
- For webhook migration, favor idempotent backfills over exact replay semantics.

## What I Would Implement First

If we want the highest payoff with the least disruption, implement in this order:

1. `webhook_events`
2. `organizations`, `organization_members`, `billing_accounts`, `subscriptions`
3. `marketing_subscribers`
4. `regulatory_updates`, `alert_subscriptions`, `alert_deliveries`
5. `vault_documents`, `vault_document_versions`
6. `dsar_requests`, `incidents`, `incident_notifications`
7. `audit_events`

## Provider Notes

### Default Recommendation: Neon

Best fit if you want:

- plain Postgres without replacing Clerk
- good restore and branching workflow
- minimal platform sprawl

### Alternative: Supabase Postgres

Best fit if you want:

- to eventually use database APIs directly
- Row Level Security for direct client access patterns
- a broader all-in-one platform later

For this repo today, Neon is the simpler operational fit because auth and blob storage are already solved elsewhere.

## Open Decisions

Before implementation, we should align on:

- one-org-per-customer only, or support multiple orgs per user on day one
- whether marketing subscribers stay in the product DB or move to a dedicated CRM later
- whether analytics stays custom or moves to Vercel Analytics / PostHog
- whether vault encryption stays env-key based initially or moves to KMS-backed key rotation later

## Sources

- [Vercel Marketplace Storage](https://vercel.com/docs/marketplace-storage)
- [Postgres on Vercel](https://vercel.com/docs/postgres)
- [Connection Pooling with Vercel Functions](https://vercel.com/kb/guide/connection-pooling-with-functions)
- [Configuring Regions for Vercel Functions](https://vercel.com/docs/serverless-functions/regions)
- [Supabase Row Level Security](https://supabase.com/docs/guides/database/postgres/row-level-security)
- [Supabase Securing Your API](https://supabase.com/docs/guides/api/securing-your-api)
- [Neon Restore Branch](https://api-docs.neon.tech/reference/restoreprojectbranch)
