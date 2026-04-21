'use client'

/**
 * /checkout?plan=professional-799
 *
 * Thin intermediary page. On mount it calls /api/checkout/create-session,
 * then immediately redirects to the Chargebee hosted checkout URL.
 *
 * If ?cancelled=true is present (user hit "Back" on Chargebee), shows a soft
 * prompt to try again or choose a different plan.
 */

import { useEffect, useState, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { BrandMark } from '@/components/ui/BrandMark'
import { BrandName } from '@/components/ui/BrandName'
import { Button } from '@/components/ui/Button'

function CheckoutInner() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const planId = searchParams.get('plan') ?? 'professional-799'
  const cancelled = searchParams.get('cancelled') === 'true'

  const [error, setError] = useState('')
  const [loading, setLoading] = useState(!cancelled)

  useEffect(() => {
    if (cancelled) return

    let cancelled_ = false

    async function initCheckout() {
      try {
        const res = await fetch('/api/checkout/create-session', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ planId }),
        })

        if (!res.ok) {
          const data = await res.json().catch(() => ({}))
          throw new Error((data as { error?: string }).error ?? 'Could not start checkout')
        }

        const data = await res.json() as { url?: string; redirect?: string }

        if (cancelled_) return

        if (data.redirect) {
          router.replace(data.redirect)
        } else if (data.url) {
          window.location.href = data.url
        } else {
          throw new Error('No checkout URL returned')
        }
      } catch (err: unknown) {
        if (!cancelled_) {
          setError(err instanceof Error ? err.message : 'Checkout failed. Please try again.')
          setLoading(false)
        }
      }
    }

    void initCheckout()
    return () => { cancelled_ = true }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [planId])

  // ── Cancelled state ──────────────────────────────────────────────────────
  if (cancelled) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-bg-primary px-4">
        <div className="max-w-md w-full text-center">
          <div className="mb-6 flex justify-center">
            <BrandMark size={40} className="text-gold" />
          </div>
          <h1 className="font-display font-bold text-text text-[length:var(--text-xl)] mb-3">
            Payment cancelled
          </h1>
          <p className="text-text-muted text-[length:var(--text-sm)] mb-8">
            No worries — your account is safe and nothing was charged.
            You can start again whenever you&apos;re ready.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button
              variant="primary"
              onClick={() => {
                setLoading(true)
                window.location.href = `/checkout?plan=${planId}`
              }}
            >
              Try again
            </Button>
            <Button variant="ghost" onClick={() => router.push('/#pricing')}>
              View plans
            </Button>
          </div>
        </div>
      </div>
    )
  }

  // ── Error state ──────────────────────────────────────────────────────────
  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-bg-primary px-4">
        <div className="max-w-md w-full text-center">
          <div className="mb-6 flex justify-center">
            <BrandMark size={40} className="text-gold" />
          </div>
          <h1 className="font-display font-bold text-text text-[length:var(--text-xl)] mb-3">
            Something went wrong
          </h1>
          <p className="text-text-muted text-[length:var(--text-sm)] mb-2">{error}</p>
          <p className="text-text-faint text-[length:var(--text-xs)] mb-8">
            If this keeps happening, email us at{' '}
            <a href="mailto:support@zawda.me" className="text-gold hover:underline">
              support@zawda.me
            </a>
          </p>
          <Button
            variant="primary"
            onClick={() => {
              setError('')
              setLoading(true)
              window.location.href = `/checkout?plan=${planId}`
            }}
          >
            Try again
          </Button>
        </div>
      </div>
    )
  }

  // ── Loading / redirecting state ───────────────────────────────────────────
  return (
    <div className="min-h-screen flex items-center justify-center bg-bg-primary px-4">
      <div className="max-w-sm w-full text-center">
        <div className="mb-6 flex justify-center">
          <BrandMark size={40} className="text-gold" />
        </div>
        <BrandName className="font-display font-bold text-[length:var(--text-lg)] tracking-[0.08em] text-text uppercase mb-8 block" />

        {/* Spinner */}
        <div className="flex justify-center mb-6" aria-hidden="true">
          <div className="w-8 h-8 border-2 border-border border-t-gold rounded-full animate-spin" />
        </div>

        <p className="text-text-muted text-[length:var(--text-sm)]">
          {loading ? 'Preparing your checkout…' : 'Redirecting…'}
        </p>
        <p className="text-text-faint text-[length:var(--text-xs)] mt-2">
          You&apos;ll be taken to a secure payment page.
        </p>
      </div>
    </div>
  )
}

export default function CheckoutPage() {
  return (
    <Suspense>
      <CheckoutInner />
    </Suspense>
  )
}
