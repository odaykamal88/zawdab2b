# Merge Checklist

Use this before merging security and infrastructure PRs.

## Security Configuration

- [ ] `CRON_SECRET` is set in the deployment environment
- [ ] `TELEGRAM_BOT_TOKEN` is set if bot features should be live
- [ ] `TELEGRAM_WEBHOOK_SECRET` is set and matches the Telegram webhook configuration
- [ ] `VAULT_MASTER_KEY` is set and rotated through a managed secret store
- [ ] Clerk and Chargebee webhook secrets are present in production

## Release Safety

- [ ] CI build passes on the PR branch
- [ ] `npm audit` has no high or critical findings
- [ ] The PR description matches the actual shipped behavior
- [ ] Any new routes that protect sensitive operations fail closed when secrets are missing
- [ ] Public-facing claims have been checked against the implemented product state

## Post-Merge

- [ ] Re-register Telegram webhook secret if needed
- [ ] Smoke test `/api/cron/crawl`, `/api/cron/crawl-regulatory`, and `/api/dashboard/seed` with the configured bearer secret
- [ ] Verify vault upload, download, and access controls for a paid account
- [ ] Verify non-admin users cannot access analytics or subscriber exports
- [ ] Confirm the production deployment URL and environment docs stay aligned
