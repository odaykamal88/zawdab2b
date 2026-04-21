'use client'

/**
 * /checkout/success?id=hp_xxx
 *
 * Chargebee redirects here after a successful payment.
 * This page calls /api/checkout/verify, which syncs the subscription into Redis,
 * then redirects the user to /onboarding to complete their profile setup.
 */

import { useEffect, useState, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { BrandMark } from '@/components/ui/BrandMark'
import { Button } from '@/components/ui/Button'

function CheckoutSuccessInner() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const hostedPageId = searchParams.get('id')

  const [status, setStatus] = useState<'verifying' | 'success' | 'error'>('verifying')
  const [errorMsg, setErrorMsg] = useState('')

  useEffect(() => {
    if (!hostedPageId) {
      setErrorMsg('Missing payment reference. Please contact support.')
      setStatus('error')
      return
    }

    let cancelled = false

    async function verify() {
      try {
        const res = await fetch(`/api/checkout/verify?id=${hostedPageId}`)
        const data = await res.json() as { ok: boolean; redirect?: string; reason?: string }

        if (cancelled) return

        if (data.ok && data.redirect) {
          setStatus('success')
          // Brief success flash before redirect so it doesn't feel instant
          setTimeout(() => router.replace(data.redirect!), 1200)
        } else {
          setErrorMsg(data.reason ?? 'Payment could not be confirmed.')
          setStatus('error')
        }
      } catch {
        if (!cancelled) {
          setErrorMsg('Could not confirm your payment. Please contact support@zawda.me.')
          setStatus('error')
        }
      }
    }

    void verify()
    return () => { cancelled = true }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hostedPageId])

  // ── Success ────────────────────────────────────────────────────────────
  if (status === 'success') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-bg-primary px-4">
        <div className="max-w-sm w-full text-center">
          <div className="mb-6 flex justify-center">
            <span className="text-5xl" aria-label="Success">✓</span>
          </div>
          <h1 className="font-display font-bold text-text text-[length:var(--text-xl)] mb-3">
            You&apos;re in.
          </h1>
          <p className="text-text-muted text-[length:var(--text-sm)]">
            Payment confirmed. Taking you to setup…
          </p>
        </div>
      </div>
    )
  }

  // ── Error ──────────────────────────────────────────────────────────────
  if (status === 'error') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-bg-primary px-4">
        <div className="max-w-md w-full text-center">
          <div className="mb-6 flex justify-center">
            <BrandMark size={40} className="text-gold" />
          </div>
          <h1 className="font-display font-bold text-text text-[length:var(--text-xl)] mb-3">
            Payment not confirmed
          </h1>
          <p className="text-text-muted text-[length:var(--text-sm)] mb-2">{errorMsg}</p>
          <p className="text-text-faint text-[length:var(--text-xs)] mb-8">
            If you were charged, please email{' '}
            <a href="mailto:support@zawda.me" className="text-gold hover:underline">
              support@zawda.me
            </a>{' '}
            with your order details and we&apos;ll resolve it within 2 hours.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button variant="primary" onClick={() => router.push('/checkout')}>
              Try again
            </Button>
            <Button variant="ghost" onClick={() => router.push('/dashboard')}>
              Go to dashboard
            </Button>
          </div>
        </div>
      </div>
    )
  }

  // ── Verifying ──────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen flex items-center justify-center bg-bg-primary px-4">
      <div className="max-w-sm w-full text-center">
        <div className="mb-6 flex justify-center">
          <BrandMark size={40} className="text-gold" />
        </div>
        <div className="flex justify-center mb-6" aria-hidden="true">
          <div className="w-8 h-8 border-2 border-border border-t-gold rounded-full animate-spin" />
        </div>
        <p className="text-text-muted text-[length:var(--text-sm)]">Confirming your payment…</p>
        <p className="text-text-faint text-[length:var(--text-xs)] mt-2">This only takes a moment.</p>
      </div>
    </div>
  )
}

export default function CheckoutSuccessPage() {
  return (
    <Suspense>
      <CheckoutSuccessInner />
    </Suspense>
  )
}
