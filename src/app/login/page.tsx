'use client'

import { useState } from 'react'
import { useSignIn } from '@clerk/nextjs'
import { BrandName } from '@/components/ui/BrandName'
import { BrandMark } from '@/components/ui/BrandMark'
import { Button } from '@/components/ui/Button'
import { useOnboarding } from '@/lib/onboarding-context'

export default function LoginPage() {
  const { isComplete, isLoaded } = useOnboarding()
  const { signIn } = useSignIn()
  const [form, setForm] = useState({ email: '', password: '' })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!signIn) return
    setError('')
    setLoading(true)
    try {
      const { error: createError } = await signIn.create({
        identifier: form.email,
        password: form.password,
      })
      if (createError) {
        setError(createError.message ?? 'Invalid email or password.')
        setLoading(false)
        return
      }
      if (signIn.status === 'complete') {
        await signIn.finalize()
        window.location.href = isLoaded && isComplete ? '/dashboard' : '/onboarding'
      } else {
        setError('Sign-in could not be completed. Please try again.')
        setLoading(false)
      }
    } catch (err: unknown) {
      const msg =
        err && typeof err === 'object' && 'errors' in err
          ? (err as { errors: { message: string }[] }).errors[0]?.message
          : 'Invalid email or password.'
      setError(msg ?? 'Invalid email or password.')
      setLoading(false)
    }
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
            Welcome Back
          </p>
          <h1 className="font-display font-bold text-[length:var(--text-xl)] leading-tight mb-4">
            Your compliance dashboard awaits.
          </h1>
          <p className="text-text-on-dark/70 text-[length:var(--text-base)] leading-relaxed mb-8">
            Track VARA enforcement, monitor regulatory changes, and keep your compliance roadmap on track.
          </p>
          <div className="space-y-3">
            {[
              'Regulatory intelligence across VARA, ADGM, and CBB',
              'Enforcement tracking — penalties up to AED 600K per violation',
              'Daily monitoring of MENA regulators',
            ].map((point) => (
              <div key={point} className="flex items-start gap-2.5">
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="mt-0.5 shrink-0" aria-hidden="true">
                  <circle cx="8" cy="8" r="7" stroke="#D69828" strokeWidth="1.5" />
                  <path d="M5 8l2 2 4-4" stroke="#D69828" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                <span className="text-text-on-dark/60 text-[length:var(--text-sm)]">{point}</span>
              </div>
            ))}
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
            Sign in
          </h2>
          <p className="text-text-muted text-[length:var(--text-base)] mb-8">
            Access your regulatory intelligence dashboard.
          </p>

          {error && (
            <div className="mb-5 px-4 py-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-[length:var(--text-sm)]">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label htmlFor="email" className="block text-text text-[length:var(--text-sm)] font-medium mb-1.5">
                Work email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                value={form.email}
                onChange={handleChange}
                className="w-full px-4 py-3 rounded-xl border border-border bg-bg-surface text-text text-[length:var(--text-base)] placeholder:text-text-faint focus:outline-none focus:border-gold focus:ring-1 focus:ring-gold transition-colors"
                placeholder="fatima@company.com"
              />
            </div>
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label htmlFor="password" className="block text-text text-[length:var(--text-sm)] font-medium">
                  Password
                </label>
                <a href="#" className="text-gold text-[length:var(--text-xs)] hover:underline">
                  Forgot password?
                </a>
              </div>
              <input
                id="password"
                name="password"
                type="password"
                required
                value={form.password}
                onChange={handleChange}
                className="w-full px-4 py-3 rounded-xl border border-border bg-bg-surface text-text text-[length:var(--text-base)] placeholder:text-text-faint focus:outline-none focus:border-gold focus:ring-1 focus:ring-gold transition-colors"
                placeholder="Enter your password"
              />
            </div>

            <Button
              type="submit"
              variant="primary"
              className="w-full text-[length:var(--text-base)]"
              disabled={loading}
            >
              {loading ? 'Signing in…' : 'Sign In'}
            </Button>
          </form>

          <p className="text-text-muted text-[length:var(--text-xs)] mt-6 text-center">
            Don&apos;t have an account?{' '}
            <a href="/register" className="text-gold hover:underline font-medium">Create one free</a>
          </p>
        </div>
      </div>
    </div>
  )
}
