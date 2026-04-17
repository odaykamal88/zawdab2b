'use client'

import { Suspense, useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
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

function RegisterForm() {
  const searchParams = useSearchParams()
  const { update } = useOnboarding()
  const [form, setForm] = useState({ name: '', email: '', company: '', password: '' })
  const [loading, setLoading] = useState(false)

  const plan = searchParams.get('plan')

  useEffect(() => {
    if (plan) update({ plan })
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [plan])

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    // Save company name to onboarding context
    update({ companyName: form.company })
    setTimeout(() => {
      window.location.href = '/onboarding'
    }, 800)
  }

  return (
    <div className="min-h-screen flex">
      {/* Left panel — branding */}
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
            <div className="flex items-start gap-3">
              <span className="text-gold mt-0.5">&#10003;</span>
              <span className="text-text-on-dark/80 text-[length:var(--text-sm)]">Real-time alerts on VARA, ADGM, CBB enforcement actions</span>
            </div>
            <div className="flex items-start gap-3">
              <span className="text-gold mt-0.5">&#10003;</span>
              <span className="text-text-on-dark/80 text-[length:var(--text-sm)]">Licensing roadmap with hidden risk warnings per jurisdiction</span>
            </div>
            <div className="flex items-start gap-3">
              <span className="text-gold mt-0.5">&#10003;</span>
              <span className="text-text-on-dark/80 text-[length:var(--text-sm)]">Document vault with audit-ready tracking</span>
            </div>
          </div>
        </div>
        <p className="relative text-text-on-dark/40 text-[length:var(--text-xs)]">
          © {new Date().getFullYear()} <BrandName />. All rights reserved.
        </p>
      </div>

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
