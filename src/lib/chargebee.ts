/**
 * Chargebee client singleton (v3 SDK).
 *
 * v3 uses `new Chargebee(config)` — not the legacy `ChargeBee.configure()` pattern.
 * The instance is initialised once at module load and reused across requests.
 *
 * Required env vars:
 *   CHARGEBEE_SITE              — your Chargebee site name (e.g. "zawda-test")
 *   CHARGEBEE_API_KEY           — full-access API key from Chargebee dashboard
 *   CHARGEBEE_WEBHOOK_USERNAME  — webhook Basic Auth username (set in Chargebee dashboard)
 *   CHARGEBEE_WEBHOOK_PASSWORD  — webhook Basic Auth password (set in Chargebee dashboard)
 */

import Chargebee from 'chargebee'

export const chargebee = new Chargebee({
  site: process.env.CHARGEBEE_SITE!,
  apiKey: process.env.CHARGEBEE_API_KEY!,
})

// ---------------------------------------------------------------------------
// Plan ID registry — must match plan IDs in your Chargebee dashboard exactly.
// ---------------------------------------------------------------------------

export const PLAN_IDS = {
  // Intelligence product line
  watchlistFree: 'watchlist-free',
  professionalMonthly: 'professional-799',
  professionalAnnual: 'professional-7999',
  enterpriseIntelligenceMonthly: 'enterprise-intelligence-2499',
  enterpriseIntelligenceAnnual: 'enterprise-intelligence-24999',
  // Navigator product line
  navigatorStarterMonthly: 'navigator-starter-499',
  navigatorProfessionalMonthly: 'navigator-professional-1299',
  navigatorEnterpriseMonthly: 'navigator-enterprise-2999',
} as const

export type PlanId = (typeof PLAN_IDS)[keyof typeof PLAN_IDS]

// ---------------------------------------------------------------------------
// Webhook verification — HTTP Basic Auth sent by Chargebee on every delivery.
// ---------------------------------------------------------------------------

export function verifyChargebeeWebhook(authorizationHeader: string | null): boolean {
  if (!authorizationHeader?.startsWith('Basic ')) return false

  const expectedUser = process.env.CHARGEBEE_WEBHOOK_USERNAME
  const expectedPass = process.env.CHARGEBEE_WEBHOOK_PASSWORD
  if (!expectedUser || !expectedPass) return false

  try {
    const decoded = Buffer.from(authorizationHeader.slice(6), 'base64').toString('utf-8')
    const colonIdx = decoded.indexOf(':')
    if (colonIdx === -1) return false
    const user = decoded.slice(0, colonIdx)
    const pass = decoded.slice(colonIdx + 1)
    return user === expectedUser && pass === expectedPass
  } catch {
    return false
  }
}
