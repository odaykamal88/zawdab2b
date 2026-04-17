'use client'

import { useState, type FormEvent } from 'react'
import { BrandName } from '@/components/ui/BrandName'
import { Button } from '@/components/ui/Button'

const TELEGRAM_BOT_URL = process.env.NEXT_PUBLIC_TELEGRAM_BOT_URL ?? 'https://t.me/ZawdaBot'

export function BriefSection() {
  const [showEmail, setShowEmail] = useState(false)
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const [errorMsg, setErrorMsg] = useState('')

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setStatus('loading')
    setErrorMsg('')
    try {
      const res = await fetch('/api/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })
      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        throw new Error(data.error ?? 'Subscription failed')
      }
      setStatus('success')
      setEmail('')
    } catch (err) {
      setStatus('error')
      setErrorMsg(err instanceof Error ? err.message : 'Something went wrong')
    }
  }

  return (
    <section id="brief" className="py-20 sm:py-28" aria-labelledby="brief-heading">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto">
          {/* Bot CTA — Primary */}
          <div className="border-l-4 border-l-gold bg-bg-surface rounded-2xl p-8 sm:p-12">
            <div className="flex items-start gap-4 mb-6">
              <div className="w-14 h-14 rounded-2xl bg-gold/10 flex items-center justify-center shrink-0">
                <span className="text-[1.75rem]" role="img" aria-label="bell">&#128276;</span>
              </div>
              <div>
                <h2 id="brief-heading" className="font-display font-bold text-text tracking-tight" style={{ fontSize: 'var(--text-xl)' }}>
                  Regulatory Alerts — Where You Already Work
                </h2>
                <p className="text-text-muted text-[length:var(--text-base)] mt-2 leading-relaxed">
                  Get enforcement actions, regulatory changes, and deadline updates from across MENA — delivered via Telegram, not buried in your inbox.
                </p>
              </div>
            </div>

            {/* How it works */}
            <div className="grid sm:grid-cols-3 gap-4 mb-8">
              <div className="bg-bg-primary border border-border rounded-xl p-4">
                <p className="font-mono text-gold font-bold text-[length:var(--text-sm)]">1-2x / week</p>
                <p className="text-text-muted text-[length:var(--text-xs)] mt-1">
                  Curated updates, never spam. Only what matters for your jurisdictions.
                </p>
              </div>
              <div className="bg-bg-primary border border-border rounded-xl p-4">
                <p className="font-mono text-gold font-bold text-[length:var(--text-sm)]">14 regulators</p>
                <p className="text-text-muted text-[length:var(--text-xs)] mt-1">
                  VARA, ADGM, CBB, DFSA, CBUAE, CMA, SAMA, QFCRA, and more — all monitored.
                </p>
              </div>
              <div className="bg-bg-primary border border-border rounded-xl p-4">
                <p className="font-mono text-gold font-bold text-[length:var(--text-sm)]">Breaking alerts</p>
                <p className="text-text-muted text-[length:var(--text-xs)] mt-1">
                  Major enforcement actions and deadline changes reach you immediately.
                </p>
              </div>
            </div>

            {/* Sample alert preview */}
            <div className="bg-bg-primary border border-border rounded-xl p-5 mb-8">
              <p className="font-mono text-text-faint text-[length:var(--text-xs)] uppercase mb-3">Sample Alert</p>
              <div className="font-mono text-[length:var(--text-sm)] leading-relaxed space-y-1">
                <p className="text-text">
                  <span className="inline-block w-3 h-3 rounded-full bg-red-500 mr-2 align-middle" />
                  <strong>Enforcement Action</strong>
                </p>
                <p className="text-text-muted">&#127462;&#127466; VARA (Dubai)</p>
                <p className="text-text mt-2"><strong>Cease &#38; desist issued to unlicensed broker-dealer</strong></p>
                <p className="text-text-muted">Entity: [Redacted] FZE</p>
                <p className="text-text-muted">Penalty: AED 600,000</p>
                <p className="text-text-muted mt-2 text-[length:var(--text-xs)]">
                  Operating virtual asset broker-dealer services without a valid VASP license. All operations to cease within 15 days.
                </p>
                <p className="text-gold text-[length:var(--text-xs)] mt-2">Read full details &#8594;</p>
                <p className="text-text-faint text-[length:var(--text-xs)] italic mt-1">Apr 8, 2026 &#183; via Zawda</p>
              </div>
            </div>

            {/* CTA buttons */}
            <div className="flex flex-col sm:flex-row gap-3">
              <a
                href={TELEGRAM_BOT_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-[#0088cc] text-white text-[length:var(--text-sm)] font-medium rounded-xl hover:brightness-110 transition-all"
              >
                <svg viewBox="0 0 24 24" width="20" height="20" fill="white">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.8c-.15 1.58-.8 5.42-1.13 7.19-.14.75-.42 1-.68 1.03-.58.05-1.02-.38-1.58-.75-.88-.58-1.38-.94-2.23-1.5-.99-.65-.35-1.01.22-1.59.15-.15 2.71-2.48 2.76-2.69a.2.2 0 00-.05-.18c-.06-.05-.14-.03-.21-.02-.09.02-1.49.95-4.22 2.79-.4.27-.76.41-1.08.4-.36-.01-1.04-.2-1.55-.37-.63-.2-1.12-.31-1.08-.66.02-.18.27-.36.74-.55 2.92-1.27 4.86-2.11 5.83-2.51 2.78-1.16 3.35-1.36 3.73-1.36.08 0 .27.02.39.12.1.08.13.19.14.27-.01.06.01.24 0 .38z" />
                </svg>
                Join on Telegram
              </a>
              <button
                onClick={() => setShowEmail(!showEmail)}
                className="inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-bg-primary border border-border text-text text-[length:var(--text-sm)] font-medium rounded-xl hover:border-gold transition-colors cursor-pointer"
              >
                <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="2" y="4" width="20" height="16" rx="2" />
                  <polyline points="22,7 12,13 2,7" />
                </svg>
                {showEmail ? 'Hide email option' : 'Prefer email instead?'}
              </button>
            </div>

            {/* Email fallback */}
            {showEmail && (
              <div className="mt-6 pt-6 border-t border-border">
                {status === 'success' ? (
                  <div className="bg-gold-light rounded-lg p-4 text-gold font-medium text-[length:var(--text-sm)]">
                    You&rsquo;re in. Weekly digest will arrive every Monday.
                  </div>
                ) : (
                  <>
                    <p className="text-text-muted text-[length:var(--text-sm)] mb-3">
                      Get a weekly email digest every Monday morning instead. Same intelligence, different channel.
                    </p>
                    <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3">
                      <label htmlFor="brief-email" className="sr-only">Work email address</label>
                      <input
                        id="brief-email"
                        type="email"
                        required
                        placeholder="Work email address"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="flex-1 rounded-xl border border-border bg-bg-primary px-5 py-3 text-text placeholder:text-text-faint focus:outline-none focus:border-gold text-[length:var(--text-sm)]"
                      />
                      <Button type="submit" variant="primary" disabled={status === 'loading'} className="text-[length:var(--text-sm)]">
                        {status === 'loading' ? 'Subscribing...' : 'Subscribe to Email Digest'}
                      </Button>
                    </form>
                    {status === 'error' && <p className="mt-2 text-alert text-[length:var(--text-xs)]">{errorMsg}</p>}
                  </>
                )}
              </div>
            )}

            <p className="text-text-faint text-[length:var(--text-xs)] mt-6">
              Used by CCOs, MLROs, and legal counsel at VASPs, family offices, and digital asset firms across the GCC.
              Curated by <BrandName className="text-gold font-semibold" />.
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}
