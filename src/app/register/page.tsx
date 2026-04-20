'use client'

import { Suspense, useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import { useSignUp, useClerk } from '@clerk/nextjs'
import { BrandName } from '@/components/ui/BrandName'
import { BrandMark } from '@/components/ui/BrandMark'
import { Button } from '@/components/ui/Button'
import { useOnboarding } from '@/lib/onboarding-context'

export default function RegisterPage() {
  return (
    <Suspense>
      <RegisterForm />
    </Suspense>
  )
}

function extractClerkMessage(err: unknown): string {
  if (!err) return 'An unexpected error occurred. Please try again.'
  if (typeof err === 'string') return err
  if (typeof err === 'object') {
    // { errors: [{ message: '...' }] } — Clerk API error array
    if ('errors' in err && Array.isArray((err as { errors: unknown[] }).errors)) {
      const first = (err as { errors: { message?: string }[] }).errors[0]
      if (first?.message) return first.message
    }
    // { message: '...' } — standard Error or ClerkAPIError
    if ('message' in err && typeof (err as { message: unknown }).message === 'string') {
      return (err as { message: string }).message
    }
    // { longMessage: '...' }
    if ('longMessage' in err && typeof (err as { longMessage: unknown }).longMessage === 'string') {
      return (err as { longMessage: string }).longMessage
    }
  }
  return 'Could not create account. Please try again.'
}

function RegisterForm() {
  const searchParams = useSearchParams()
  const { update } = useOnboarding()
  const { signUp } = useSignUp()
  const clerk = useClerk()
  const [form, setForm] = useState({ name: '', email: '', company: '', password: '' })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [verifying, setVerifying] = useState(false)
  const [code, setCode] = useState('')

  const plan = searchParams.get('plan')

  useEffect(() => {
    if (plan) update({ plan })
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [plan])

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      // Wait for Clerk to be ready (with a 10-second timeout)
      if (!clerk.loaded) {
        await Promise.race([
          new Promise<void>((resolve) => {
            const check = setInterval(() => {
              if (clerk.loaded) { clearInterval(check); resolve() }
            }, 100)
          }),
          new Promise<void>((_, reject) =>
            setTimeout(() => reject(new Error('Clerk is taking too long to load. Please refresh the page and try again.')), 10_000)
          ),
        ])
      }

      if (!signUp) {
        setError('Authentication service is not available. Please refresh and try again.')
        return
      }

      const nameParts = form.name.trim().split(' ')
      const firstName = nameParts[0]
      const lastName = nameParts.slice(1).join(' ') || undefined

      const createResult = await signUp.create({
        emailAddress: form.email,
        password: form.password,
        firstName,
        lastName,
      })

      if (createResult?.error) {
        console.error('[Register] signUp.create error:', createResult.error)
        setError(extractClerkMessage(createResult.error))
        return
      }

      const sendResult = await signUp.verifications.sendEmailCode()
      if (sendResult?.error) {
        console.error('[Register] sendEmailCode error:', sendResult.error)
        setError(extractClerkMessage(sendResult.error))
        return
      }

      // Save company to onboarding context for after verification
      update({ companyName: form.company, ...(plan ? { plan } : {}) })
      setVerifying(true)
    } catch (err: unknown) {
      console.error('[Register] unexpected error:', err)
      setError(extractClerkMessage(err))
    } finally {
      setLoading(false)
    }
  }

  async function handleVerify(e: React.FormEvent) {
    e.preventDefault()
    if (!signUp) return
    setError('')
    setLoading(true)
    try {
      const verifyResult = await signUp.verifications.verifyEmailCode({ code })
      if (verifyResult?.error) {
        console.error('[Register] verifyEmailCode error:', verifyResult.error)
        setError(extractClerkMessage(verifyResult.error))
        return
      }
      if (signUp.status === 'complete') {
        const finalizeResult = await signUp.finalize()
        if (finalizeResult?.error) {
          console.error('[Register] finalize error:', finalizeResult.error)
          setError(extractClerkMessage(finalizeResult.error))
          return
        }
        window.location.href = '/onboarding'
      } else {
        setError('Verification could not be completed. Please try again.')
      }
    } catch (err: unknown) {
      console.error('[Register] verify unexpected error:', err)
      setError(extractClerkMessage(err))
    } finally {
      setLoading(false)
    }
  }

  const leftPanel = (
    <div className="relative hidden lg:flex lg:w-1/2 bg-bg-dark text-text-on-dark flex-col justify-between p-12 overflow-hidden">
      <div className="absolute inset-0 bg-zawda-pattern opacity-[0.06] pointer-events-none" aria-hidden="true" />
      <div className="relative">
        <a href="/" className="inline-flex items-center gap-3">
          <BrandMark size={32} className="text-gold shrink-0" />
          <BrandName className="font-display font-bold text-[length:var(--text-lg)] tracking-[0.08em] text-white uppercase" />
        </a>
      </div>
      <div className="relative max-w-md">
        <p className="font-mono text-gold uppercase tracking-widest text-[length:var(--text-xs)] mb-4">
          {plan === 'navigator' ? 'Licensing Navigator' : 'Regulatory Intelligence'}
        </p>
        <h1 className="font-display font-bold text-[length:var(--text-xl)] leading-tight mb-4">
          {plan === 'navigator'
            ? 'Get licensed without the noise.'
            : 'Stay ahead of every MENA digital asset regulation.'}
        </h1>
        <p className="text-text-on-dark/70 text-[length:var(--text-base)] leading-relaxed">
          {plan === 'navigator'
            ? 'Clear licensing guidance, document tracking, and risk warnings — built for the companies actually going through the process.'
            : 'Join the compliance teams already using Zawda to track enforcement actions and regulatory changes across 7 MENA jurisdictions.'}
        </p>
        <div className="mt-10 space-y-4">
          {[
            'Real-time alerts on VARA, ADGM, CBB enforcement actions',
            'Licensing roadmap with hidden risk warnings per jurisdiction',
            'Document vault with audit-ready tracking',
          ].map((point) => (
            <div key={point} className="flex items-start gap-3">
              <span className="text-gold mt-0.5">&#10003;</span>
              <span className="text-text-on-dark/80 text-[length:var(--text-sm)]">{point}</span>
            </div>
          ))}
        </div>
      </div>
      <p className="relative text-text-on-dark/40 text-[length:var(--text-xs)]">
        © {new Date().getFullYear()} <BrandName />. All rights reserved.
      </p>
    </div>
  )

  if (verifying) {
    return (
      <div className="min-h-screen flex">
        {leftPanel}
        <div className="flex-1 flex items-center justify-center p-6 sm:p-12 bg-bg-primary">
          <div className="w-full max-w-md">
            <div className="lg:hidden mb-8">
              <a href="/" className="inline-flex items-center gap-2.5">
                <BrandMark size={28} className="text-gold shrink-0" />
                <BrandName className="font-display font-bold text-[length:var(--text-lg)] tracking-[0.08em] text-text uppercase" />
              </a>
            </div>
            <h2 className="font-display font-bold text-text text-[length:var(--text-xl)] mb-2">
              Check your email
            </h2>
            <p className="text-text-muted text-[length:var(--text-sm)] mb-8">
              We sent a 6-digit code to <strong>{form.email}</strong>. Enter it below to verify your account.
            </p>
            {error && (
              <div className="mb-5 px-4 py-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-[length:var(--text-sm)]">
                {error}
              </div>
            )}
            <form onSubmit={handleVerify} className="space-y-5">
              <div>
                <label htmlFor="code" className="block text-text text-[length:var(--text-sm)] font-medium mb-1.5">
                  Verification code
                </label>
                <input
                  id="code" name="code" type="text" required
                  value={code} onChange={(e) => setCode(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-border bg-bg-surface text-text text-[length:var(--text-sm)] placeholder:text-text-faint focus:outline-none focus:border-gold focus:ring-1 focus:ring-gold transition-colors tracking-widest text-center text-lg"
                  placeholder="123456"
                  maxLength={6}
                />
              </div>
              <Button type="submit" variant="primary" className="w-full text-[length:var(--text-sm)]" disabled={loading}>
                {loading ? 'Verifying…' : 'Verify Email'}
              </Button>
            </form>
            <p className="text-text-muted text-[length:var(--text-xs)] mt-6 text-center">
              Didn&apos;t receive it?{' '}
              <button
                type="button"
                className="text-gold hover:underline font-medium bg-transparent border-none cursor-pointer"
                onClick={async () => {
                  if (signUp) await signUp.verifications.sendEmailCode()
                }}
              >
                Resend code
              </button>
            </p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex">
      {leftPanel}

      {/* Right panel — form */}
      <div className="flex-1 flex items-center justify-center p-6 sm:p-12 bg-bg-primary">
        <div className="w-full max-w-md">
          <div className="lg:hidden mb-8">
            <a href="/" className="inline-flex items-center gap-2.5">
              <BrandMark size={28} className="text-gold shrink-0" />
              <BrandName className="font-display font-bold text-[length:var(--text-lg)] tracking-[0.08em] text-text uppercase" />
            </a>
          </div>

          <h2 className="font-display font-bold text-text text-[length:var(--text-xl)] mb-2">
            Start your 14-day free trial
          </h2>
          <p className="text-text-muted text-[length:var(--text-sm)] mb-2">
            {plan
              ? `You selected the ${plan.charAt(0).toUpperCase() + plan.slice(1)} plan. Full access for 14 days — no charge.`
              : 'Full dashboard access for 14 days. No credit card required to start.'}
          </p>
          <div className="flex items-center gap-2 mb-6 px-3 py-2 bg-green-50 border border-green-200 rounded-xl">
            <span className="text-green-600 text-[length:var(--text-sm)]">&#10003;</span>
            <span className="text-green-700 text-[length:var(--text-xs)] font-medium">14-day free trial &middot; Cancel anytime &middot; No setup fees</span>
          </div>

          {error && (
            <div className="mb-5 px-4 py-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-[length:var(--text-sm)]">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label htmlFor="name" className="block text-text text-[length:var(--text-sm)] font-medium mb-1.5">
                Full name
              </label>
              <input
                id="name" name="name" type="text" required
                value={form.name} onChange={handleChange}
                className="w-full px-4 py-3 rounded-xl border border-border bg-bg-surface text-text text-[length:var(--text-sm)] placeholder:text-text-faint focus:outline-none focus:border-gold focus:ring-1 focus:ring-gold transition-colors"
                placeholder="Fatima Al-Rashid"
              />
            </div>
            <div>
              <label htmlFor="email" className="block text-text text-[length:var(--text-sm)] font-medium mb-1.5">
                Work email
              </label>
              <input
                id="email" name="email" type="email" required
                value={form.email} onChange={handleChange}
                className="w-full px-4 py-3 rounded-xl border border-border bg-bg-surface text-text text-[length:var(--text-sm)] placeholder:text-text-faint focus:outline-none focus:border-gold focus:ring-1 focus:ring-gold transition-colors"
                placeholder="fatima@company.com"
              />
            </div>
            <div>
              <label htmlFor="company" className="block text-text text-[length:var(--text-sm)] font-medium mb-1.5">
                Company name
              </label>
              <input
                id="company" name="company" type="text" required
                value={form.company} onChange={handleChange}
                className="w-full px-4 py-3 rounded-xl border border-border bg-bg-surface text-text text-[length:var(--text-sm)] placeholder:text-text-faint focus:outline-none focus:border-gold focus:ring-1 focus:ring-gold transition-colors"
                placeholder="Acme Holdings"
              />
            </div>
            <div>
              <label htmlFor="password" className="block text-text text-[length:var(--text-sm)] font-medium mb-1.5">
                Password
              </label>
              <input
                id="password" name="password" type="password" required minLength={8}
                value={form.password} onChange={handleChange}
                className="w-full px-4 py-3 rounded-xl border border-border bg-bg-surface text-text text-[length:var(--text-sm)] placeholder:text-text-faint focus:outline-none focus:border-gold focus:ring-1 focus:ring-gold transition-colors"
                placeholder="Min. 8 characters"
              />
            </div>

            <Button type="submit" variant="primary" className="w-full text-[length:var(--text-sm)]" disabled={loading}>
              {loading ? 'Creating account…' : 'Start 14-Day Free Trial'}
            </Button>

            <p className="text-text-faint text-[length:var(--text-xs)] text-center mt-2">
              After your trial, plans start at $799/mo.{' '}
              <a href="/#pricing" className="text-gold hover:underline">View pricing</a>
            </p>
          </form>

          <p className="text-text-muted text-[length:var(--text-xs)] mt-6 text-center">
            Already have an account?{' '}
            <a href="/login" className="text-gold hover:underline font-medium">Sign in</a>
          </p>

          <p className="text-text-faint text-[length:var(--text-xs)] mt-4 text-center leading-relaxed">
            By creating an account you agree to our <a href="/terms" className="text-gold hover:underline">Terms of Service</a> and{' '}
            <a href="/privacy" className="text-gold hover:underline">Privacy Policy</a>. Your trial will begin immediately and you
            will not be charged during the 14-day trial period.
          </p>
        </div>
      </div>
    </div>
  )
}
