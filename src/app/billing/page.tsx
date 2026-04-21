'use client'

/**
 * /billing
 *
 * Shows the user's current plan, billing period, and lets them manage
 * their subscription via the Chargebee self-serve portal.
 *
 * Free users see an upgrade prompt instead of portal access.
 */

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useSubscription } from '@/hooks/useSubscription'
import { BrandMark } from '@/components/ui/BrandMark'
import { Button } from '@/components/ui/Button'
import type { PlanId } from '@/lib/subscription'

const PLAN_LABELS: Record<PlanId, string> = {
  'watchlist-free': 'Watchlist Free',
  'professional-799': 'Professional (Monthly)',
  'professional-7999': 'Professional (Annual)',
  'enterprise-intelligence-2499': 'Enterprise Intelligence (Monthly)',
  'enterprise-intelligence-24999': 'Enterprise Intelligence (Annual)',
  'navigator-starter-499': 'Navigator Starter',
  'navigator-professional-1299': 'Navigator Professional',
  'navigator-enterprise-2999': 'Navigator Enterprise',
}

const PLAN_PRICES: Record<PlanId, string> = {
  'watchlist-free': 'Free',
  'professional-799': '$799 / month',
  'professional-7999': '$7,999 / year',
  'enterprise-intelligence-2499': '$2,499 / month',
  'enterprise-intelligence-24999': '$24,999 / year',
  'navigator-starter-499': '$499 / month',
  'navigator-professional-1299': '$1,299 / month',
  'navigator-enterprise-2999': '$2,999 / month',
}

function formatDate(iso?: string) {
  if (!iso) return null
  return new Date(iso).toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  })
}

export default function BillingPage() {
  const router = useRouter()
  const { subscription, loading } = useSubscription()
  const [portalLoading, setPortalLoading] = useState(false)
  const [portalError, setPortalError] = useState('')

  async function openPortal() {
    setPortalLoading(true)
    setPortalError('')
    try {
      const res = await fetch('/api/billing/portal-session', { method: 'POST' })
      const data = await res.json() as { url?: string; redirect?: string; error?: string }
      if (data.url) {
        window.location.href = data.url
      } else if (data.redirect) {
        router.push(data.redirect)
      } else {
        setPortalError(data.error ?? 'Could not open billing portal.')
        setPortalLoading(false)
      }
    } catch {
      setPortalError('Could not connect. Please try again.')
      setPortalLoading(false)
    }
  }

  const isFree = !subscription || subscription.plan === 'watchlist-free'
  const isActive = subscription?.status === 'active' || subscription?.status === 'trialing' || subscription?.status === 'non_renewing'
  const isCancelled = subscription?.status === 'cancelled'
  const isTrialing = subscription?.status === 'trialing'

  return (
    <div className="min-h-screen bg-bg-surface px-4 py-12">
      <div className="max-w-2xl mx-auto space-y-6">

        {/* Header */}
        <div className="flex items-center gap-3 mb-8">
          <a href="/dashboard" className="text-text-faint hover:text-text transition-colors text-[length:var(--text-sm)]">
            &larr; Dashboard
          </a>
        </div>

        <div>
          <h1 className="font-display font-bold text-text text-[length:var(--text-xl)]">Billing</h1>
          <p className="text-text-muted text-[length:var(--text-sm)] mt-1">
            Manage your subscription, invoices, and payment method.
          </p>
        </div>

        {/* Loading */}
        {loading && (
          <div className="bg-bg-primary border border-border rounded-2xl p-8 text-center">
            <div className="w-6 h-6 border-2 border-border border-t-gold rounded-full animate-spin mx-auto mb-3" />
            <p className="text-text-muted text-[length:var(--text-sm)]">Loading subscription…</p>
          </div>
        )}

        {/* Free plan — upgrade prompt */}
        {!loading && isFree && (
          <div className="bg-gradient-to-br from-gold/5 via-bg-primary to-gold/5 border border-gold/20 rounded-2xl p-8">
            <div className="flex justify-center mb-5">
              <BrandMark size={36} className="text-gold" />
            </div>
            <h2 className="font-display font-bold text-text text-[length:var(--text-lg)] text-center mb-2">
              You&apos;re on the Free plan
            </h2>
            <p className="text-text-muted text-[length:var(--text-sm)] text-center mb-8 max-w-md mx-auto leading-relaxed">
              Upgrade to Professional to unlock the full compliance dashboard,
              real-time alerts, risk screening, travel rule tools, and board reporting.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button variant="primary" onClick={() => router.push('/checkout?plan=professional-799')}>
                Upgrade to Professional — $799/mo
              </Button>
              <Button variant="ghost" onClick={() => router.push('/#pricing')}>
                View all plans
              </Button>
            </div>
          </div>
        )}

        {/* Active subscription */}
        {!loading && !isFree && subscription && (
          <>
            {/* Plan card */}
            <div className="bg-bg-primary border border-border rounded-2xl p-6 space-y-5">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="font-mono text-text-faint text-[length:var(--text-xs)] uppercase tracking-widest mb-1">Current Plan</p>
                  <p className="font-display font-bold text-text text-[length:var(--text-lg)]">
                    {PLAN_LABELS[subscription.plan] ?? subscription.plan}
                  </p>
                  <p className="text-text-muted text-[length:var(--text-sm)] mt-0.5">
                    {PLAN_PRICES[subscription.plan] ?? ''}
                  </p>
                </div>
                <span className={`shrink-0 mt-1 px-3 py-1 rounded-full text-[length:var(--text-xs)] font-medium border ${
                  isCancelled ? 'bg-red-50 text-red-600 border-red-100' :
                  isTrialing ? 'bg-blue-50 text-blue-600 border-blue-100' :
                  'bg-gold/10 text-gold border-gold/20'
                }`}>
                  {isCancelled ? 'Cancelled' : isTrialing ? 'Trial' : 'Active'}
                </span>
              </div>

              <div className="border-t border-border pt-5 grid sm:grid-cols-2 gap-4">
                {isTrialing && subscription.trialEnd && (
                  <div>
                    <p className="text-text-faint text-[length:var(--text-xs)] uppercase font-mono mb-1">Trial Ends</p>
                    <p className="text-text text-[length:var(--text-sm)] font-medium">{formatDate(subscription.trialEnd)}</p>
                  </div>
                )}
                {!isTrialing && subscription.currentPeriodEnd && (
                  <div>
                    <p className="text-text-faint text-[length:var(--text-xs)] uppercase font-mono mb-1">
                      {isCancelled ? 'Access Until' : 'Next Billing Date'}
                    </p>
                    <p className="text-text text-[length:var(--text-sm)] font-medium">{formatDate(subscription.currentPeriodEnd)}</p>
                  </div>
                )}
                {subscription.chargebeeCustomerId && (
                  <div>
                    <p className="text-text-faint text-[length:var(--text-xs)] uppercase font-mono mb-1">Customer ID</p>
                    <p className="text-text-faint text-[length:var(--text-xs)] font-mono">{subscription.chargebeeCustomerId}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Warnings */}
            {isCancelled && (
              <div className="bg-red-50 border border-red-100 rounded-2xl p-5">
                <p className="font-medium text-red-700 text-[length:var(--text-sm)] mb-1">Subscription cancelled</p>
                <p className="text-red-600 text-[length:var(--text-xs)] leading-relaxed">
                  Your access continues until{' '}
                  {formatDate(subscription.currentPeriodEnd) ?? 'the end of your billing period'}.
                  Reactivate below to restore full access.
                </p>
              </div>
            )}

            {subscription.status === 'non_renewing' && (
              <div className="bg-orange-50 border border-orange-100 rounded-2xl p-5">
                <p className="font-medium text-orange-700 text-[length:var(--text-sm)] mb-1">Subscription set to cancel</p>
                <p className="text-orange-600 text-[length:var(--text-xs)] leading-relaxed">
                  Your plan will not renew after{' '}
                  {formatDate(subscription.currentPeriodEnd) ?? 'the current period'}.
                  Open the billing portal to reactivate.
                </p>
              </div>
            )}

            {/* Portal error */}
            {portalError && (
              <div className="bg-red-50 border border-red-100 rounded-xl p-4">
                <p className="text-red-600 text-[length:var(--text-sm)]">{portalError}</p>
              </div>
            )}

            {/* Actions */}
            <div className="flex flex-col sm:flex-row gap-3">
              <Button
                variant="primary"
                onClick={openPortal}
                disabled={portalLoading}
              >
                {portalLoading ? 'Opening portal…' : 'Manage billing & invoices'}
              </Button>
              {isActive && !isCancelled && (
                <Button variant="ghost" onClick={() => router.push('/checkout?plan=professional-799')}>
                  Change plan
                </Button>
              )}
              {isCancelled && (
                <Button variant="ghost" onClick={() => router.push('/checkout?plan=professional-799')}>
                  Reactivate subscription
                </Button>
              )}
            </div>

            <p className="text-text-faint text-[length:var(--text-xs)] leading-relaxed">
              The billing portal is powered by Chargebee. You can update your payment method,
              download invoices, and manage your subscription there.
              Questions? Email{' '}
              <a href="mailto:support@zawda.me" className="text-gold hover:underline">
                support@zawda.me
              </a>
              .
            </p>
          </>
        )}
      </div>
    </div>
  )
}
