'use client'

/**
 * SubscriptionBadge — displays the user's current plan as a compact pill.
 *
 * Used in the Sidebar footer. Fetches subscription via useSubscription().
 */

import { useSubscription } from '@/hooks/useSubscription'
import type { PlanId, SubscriptionStatus } from '@/lib/subscription'

const PLAN_LABELS: Record<PlanId, string> = {
  'watchlist-free': 'Free',
  'professional-799': 'Professional',
  'professional-7999': 'Professional',
  'enterprise-intelligence-2499': 'Enterprise',
  'enterprise-intelligence-24999': 'Enterprise',
  'navigator-starter-499': 'Navigator Starter',
  'navigator-professional-1299': 'Navigator Pro',
  'navigator-enterprise-2999': 'Navigator Enterprise',
}

const STATUS_STYLES: Record<SubscriptionStatus, string> = {
  free: 'bg-bg-surface text-text-faint border-border',
  active: 'bg-gold/10 text-gold border-gold/20',
  trialing: 'bg-blue-50 text-blue-600 border-blue-100',
  non_renewing: 'bg-orange-50 text-orange-600 border-orange-100',
  paused: 'bg-bg-surface text-text-muted border-border',
  cancelled: 'bg-red-50 text-red-500 border-red-100',
}

export function SubscriptionBadge() {
  const { subscription, loading } = useSubscription()

  if (loading) {
    return (
      <div className="h-5 w-20 rounded-full bg-border animate-pulse" />
    )
  }

  if (!subscription) return null

  const label = PLAN_LABELS[subscription.plan] ?? subscription.plan
  const style = STATUS_STYLES[subscription.status] ?? STATUS_STYLES.free
  const isTrialing = subscription.status === 'trialing'

  return (
    <div className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full border text-[length:var(--text-xs)] font-medium ${style}`}>
      {isTrialing && (
        <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse shrink-0" />
      )}
      {label}
      {isTrialing && ' · Trial'}
    </div>
  )
}
