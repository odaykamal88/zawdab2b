# Security Remediation Backlog

Focused backlog derived from the April 2026 repo review.

## P0

- [x] Restrict subscriber list access to superadmin-only routes.
- [x] Restrict analytics subscriber data to superadmin-only access.
- [x] Stop trusting client-supplied vault plan headers.
- [x] Enforce vault uploads from server-side subscription entitlements only.
- [ ] Upgrade `next` from `16.2.2` to `16.2.4+` to clear `GHSA-q4gf-8mx6-v5v3`.
- [ ] Remove or qualify unsupported public claims around Chainalysis, SAR filing, E2E encryption, MFA enforcement, pentests, and backup guarantees.
- [ ] Add automated regression coverage for authz around `/api/subscribe`, `/api/analytics`, and `/api/vault`.

## P1

- [x] Store new vault blobs with private access instead of public access.
- [x] Require a Telegram webhook secret and reject unsigned webhook requests.
- [x] Make cron endpoints fail closed when `CRON_SECRET` is missing.
- [ ] Move audit logging to durable, failure-visible storage with retention/export guarantees.
- [ ] Patch dashboard clients that still assume demo or static data instead of crawler-backed data.
- [ ] Fix the remaining lint failures and make lint pass in CI.
- [ ] Add CI workflows for lint, build, dependency audit, and focused route tests.

## P2

- [ ] Move onboarding state, recommendation logic, and jurisdiction intelligence off the client and onto authenticated server APIs.
- [ ] Add a public trust surface: `/trust`, `/about`, `/track-record`, `/privacy`, and source-backed stats inventory.
- [ ] Reconcile subscription products, pricing copy, and actual feature gates so paid claims match shipped behavior.
- [ ] Add evidence-backed operational controls for backups, incident response, and access review before marketing them publicly.
