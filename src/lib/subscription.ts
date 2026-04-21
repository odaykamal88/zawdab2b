/**
 * Subscription state — backed by Upstash Redis.
 *
 * Two key patterns:
 *   sub:{clerkId}            → SubscriptionRecord (primary lookup)
 *   sub:cbcust:{cbCustomerId} → clerkId           (reverse index for webhook lookups)
 *
 * All writes go through setSubscription() to keep both keys in sync.
 */

import { redis } from './redis'
import type { PlanId } from './chargebee'

export type { PlanId }

export type SubscriptionStatus =
  | 'trialing'
  | 'active'
  | 'non_renewing'
  | 'paused'
  | 'cancelled'
  | 'free'

export interface SubscriptionRecord {
  clerkId: string
  plan: PlanId
  status: SubscriptionStatus
  chargebeeCustomerId: string
  chargebeeSubscriptionId?: string
  currentPeriodEnd?: string
  trialEnd?: string
  cancelAt?: string
  updatedAt: string
}

const subKey = (clerkId: string) => `sub:${clerkId}`
const custKey = (cbCustomerId: string) => `sub:cbcust:${cbCustomerId}`

export async function getSubscription(clerkId: string): Promise<SubscriptionRecord | null> {
  return redis.get<SubscriptionRecord>(subKey(clerkId))
}

export async function setSubscription(record: SubscriptionRecord): Promise<void> {
  await redis.set(subKey(record.clerkId), record)
  if (record.chargebeeCustomerId) {
    await redis.set(custKey(record.chargebeeCustomerId), record.clerkId)
  }
}

export async function getClerkIdByChargebeeCustomer(
  cbCustomerId: string,
): Promise<string | null> {
  return redis.get<string>(custKey(cbCustomerId))
}

export async function deleteSubscription(clerkId: string): Promise<void> {
  const record = await getSubscription(clerkId)
  if (record?.chargebeeCustomerId) {
    await redis.del(custKey(record.chargebeeCustomerId))
  }
  await redis.del(subKey(clerkId))
}

// ---------------------------------------------------------------------------
// Feature gating
// ---------------------------------------------------------------------------

export type Feature =
  | 'dashboard'
  | 'licensing_roadmap'
  | 'real_time_alerts'
  | 'risk_screening'
  | 'travel_rule'
  | 'board_reporting'
  | 'api_access'
  | 'multi_entity'
  | 'dedicated_support'
  | 'vault'

const PLAN_FEATURES: Record<PlanId, ReadonlySet<Feature>> = {
  'watchlist-free': new Set([]),
  'professional-799': new Set<Feature>([
    'dashboard',
    'licensing_roadmap',
    'real_time_alerts',
    'risk_screening',
    'travel_rule',
    'board_reporting',
    'vault',
  ]),
  'professional-7999': new Set<Feature>([
    'dashboard',
    'licensing_roadmap',
    'real_time_alerts',
    'risk_screening',
    'travel_rule',
    'board_reporting',
    'vault',
  ]),
  'enterprise-intelligence-2499': new Set<Feature>([
    'dashboard',
    'licensing_roadmap',
    'real_time_alerts',
    'risk_screening',
    'travel_rule',
    'board_reporting',
    'api_access',
    'multi_entity',
    'dedicated_support',
    'vault',
  ]),
  'enterprise-intelligence-24999': new Set<Feature>([
    'dashboard',
    'licensing_roadmap',
    'real_time_alerts',
    'risk_screening',
    'travel_rule',
    'board_reporting',
    'api_access',
    'multi_entity',
    'dedicated_support',
    'vault',
  ]),
  'navigator-starter-499': new Set<Feature>(['dashboard']),
  'navigator-professional-1299': new Set<Feature>([
    'dashboard',
    'licensing_roadmap',
    'real_time_alerts',
  ]),
  'navigator-enterprise-2999': new Set<Feature>([
    'dashboard',
    'licensing_roadmap',
    'real_time_alerts',
    'api_access',
    'multi_entity',
    'dedicated_support',
  ]),
}

export function isFeatureAllowed(
  record: SubscriptionRecord | null,
  feature: Feature,
): boolean {
  if (!record || record.status === 'cancelled') return false
  return PLAN_FEATURES[record.plan]?.has(feature) ?? false
}

export function isSubscriptionActive(record: SubscriptionRecord | null): boolean {
  if (!record) return false
  return record.status === 'active' || record.status === 'trialing' || record.status === 'non_renewing'
}
