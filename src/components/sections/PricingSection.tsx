'use client'

import { useState } from 'react'
import { Button, LinkButton } from '@/components/ui/Button'

const CHECK = <span className="text-gold" aria-hidden="true">&#10003;</span>

type ProductLine = 'intelligence' | 'navigator'

const INTELLIGENCE_PLANS = [
  {
    name: 'Watchlist',
    price: 'Free',
    period: '',
    annualPrice: 'Free',
    description: 'Stay informed. Know when enforcement actions happen in MENA.',
    featured: false,
    features: [
      'Weekly MENA Digital Asset Brief (email)',
      'Enforcement action alerts',
      'Regulator map — 16 jurisdictions',
      'Monthly compliance roundup',
    ],
    cta: 'Join Free via Telegram or Email →',
    ctaHref: '#brief',
    ctaVariant: 'ghost' as const,
    emailCapture: false,
  },
  {
    name: 'Professional',
    price: '$799',
    period: '/mo',
    annualPrice: '$7,999',
    description: 'For compliance officers who need to act on regulatory changes, not just read about them.',
    featured: true,
    badge: 'Most Popular',
    features: [
      'Everything in Watchlist',
      'Dashboard access with licensing roadmap',
      'Real-time regulatory change alerts (same-day)',
      'VARA / ADGM / CBB enforcement tracker',
      'Wallet & counterparty risk screening (KYT integration — roadmap)',
      'Custom jurisdiction watchlist',
      'Travel Rule readiness assessment',
      'Board-ready compliance reporting',
      'Priority email support (48h SLA)',
    ],
    cta: 'Start 14-Day Free Trial',
    ctaHref: '/register?plan=professional',
    ctaVariant: 'primary' as const,
    emailCapture: false,
  },
  {
    name: 'Enterprise Intelligence',
    price: '$2,499',
    period: '/mo',
    annualPrice: '$24,999',
    description: 'Multi-entity compliance operations with API integration and dedicated support.',
    featured: false,
    features: [
      'Everything in Professional',
      'Multi-jurisdiction coordination',
      'KYT provider integration (on roadmap)',
      'SAR filing support (VARA / CBB / FSRA)',
      'Custom API & webhook access',
      'SLA-backed response (4h critical, 24h standard)',
      'Dedicated compliance liaison',
    ],
    cta: 'Contact Us',
    ctaHref: '#brief',
    ctaVariant: 'outline' as const,
    emailCapture: false,
  },
]

const NAVIGATOR_PLANS = [
  {
    name: 'Assessment',
    price: 'Free',
    period: '',
    annualPrice: 'Free',
    description: 'Find out if you can get licensed — and where. No lawyers required.',
    featured: false,
    features: [
      'Applicant viability assessment',
      'Jurisdiction comparison (16 MENA regulators)',
      'Document requirements checklist',
      'Estimated timeline & capital requirements',
    ],
    cta: 'Start Assessment',
    ctaHref: '',
    ctaVariant: 'ghost' as const,
    emailCapture: true,
  },
  {
    name: 'Navigator',
    price: '$2,999',
    period: '/mo',
    annualPrice: '$29,999',
    description: 'Hands-on licensing support. Clear guidance that cuts through regulator and lawyer noise.',
    featured: true,
    badge: 'Best Value',
    features: [
      'Everything in Assessment',
      'Full licensing roadmap with progress tracking',
      'Document vault (encrypted, audit-ready)',
      'Direct advisory access (48h SLA)',
      'License application review & feedback',
      'Hidden risk warnings per jurisdiction',
      'Audit preparedness monitoring',
      'Quarterly strategy call with founder',
    ],
    cta: 'Start 14-Day Free Trial \u2192',
    ctaHref: '/register?plan=navigator',
    ctaVariant: 'primary' as const,
    emailCapture: false,
  },
  {
    name: 'Enterprise',
    price: '$15,000\u2013$30,000',
    period: '/mo',
    annualPrice: 'Custom',
    description: 'Fractional compliance officer & MLRO. CEO/partner-level attention dedicated to your licensing journey.',
    featured: false,
    badge: 'White Glove',
    features: [
      'Everything in Navigator',
      'Fractional MLRO / Compliance Officer (dedicated)',
      'Multi-jurisdiction license applications',
      'Regulator communication & response drafting',
      'Enforcement response & remediation guidance',
      'Vendor & partner due diligence',
      'Annual compliance audit support',
      'Monthly board reporting package',
      'Dedicated licensing manager (CEO/partner level)',
      'SLA: 4h critical response, weekly check-ins',
    ],
    cta: 'Talk to Us',
    ctaHref: '#brief',
    ctaVariant: 'outline' as const,
    emailCapture: false,
  },
]

export function PricingSection() {
  const [annual, setAnnual] = useState(false)
  const [activeLine, setActiveLine] = useState<ProductLine>('intelligence')
  const [emailInputs, setEmailInputs] = useState<Record<string, string>>({})
  const [emailSubmitted, setEmailSubmitted] = useState<Record<string, boolean>>({})

  const plans = activeLine === 'intelligence' ? INTELLIGENCE_PLANS : NAVIGATOR_PLANS

  function handleEmailSubmit(planName: string) {
    const email = emailInputs[planName]
    if (!email || !email.includes('@')) return
    // In production: POST /api/leads with { email, plan: planName }
    setEmailSubmitted((prev) => ({ ...prev, [planName]: true }))
  }

  return (
    <section id="pricing" className="py-20 sm:py-28" aria-labelledby="pricing-heading">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto">
          <p className="font-mono text-gold uppercase tracking-widest text-[length:var(--text-xs)] mb-4">Two Products. One Platform.</p>
          <h2 id="pricing-heading" className="font-display font-bold text-text tracking-tight" style={{ fontSize: 'var(--text-xl)' }}>
            Choose what your organization needs.
          </h2>
        </div>

        {/* Product line toggle */}
        <div className="flex justify-center mt-8">
          <div className="inline-flex bg-bg-surface border border-border rounded-2xl p-1.5">
            <button
              onClick={() => setActiveLine('intelligence')}
              className={`px-6 py-3 rounded-xl text-[length:var(--text-sm)] font-medium transition-all cursor-pointer ${
                activeLine === 'intelligence'
                  ? 'bg-bg-primary text-text shadow-sm border border-border'
                  : 'text-text-muted hover:text-text'
              }`}
            >
              <span className="block font-display font-bold">Compliance Intelligence</span>
              <span className="block text-[length:var(--text-xs)] mt-0.5 font-normal">Monitor &middot; Alert &middot; Report</span>
            </button>
            <button
              onClick={() => setActiveLine('navigator')}
              className={`px-6 py-3 rounded-xl text-[length:var(--text-sm)] font-medium transition-all cursor-pointer ${
                activeLine === 'navigator'
                  ? 'bg-bg-primary text-text shadow-sm border border-border'
                  : 'text-text-muted hover:text-text'
              }`}
            >
              <span className="block font-display font-bold">Licensing Navigator</span>
              <span className="block text-[length:var(--text-xs)] mt-0.5 font-normal">Assess &middot; Apply &middot; License</span>
            </button>
          </div>
        </div>

        {/* Product description */}
        <div className="text-center mt-6 max-w-xl mx-auto">
          {activeLine === 'intelligence' ? (
            <p className="text-text-muted text-[length:var(--text-sm)]">
              Real-time regulatory intelligence and enforcement tracking, with wallet risk screening on our roadmap. Built for compliance officers who need to stay ahead of MENA regulators.
            </p>
          ) : (
            <p className="text-text-muted text-[length:var(--text-sm)]">
              Clear, direct licensing guidance that cuts through the noise from regulators, lawyers, and government websites. From free assessments to dedicated fractional compliance officers.
            </p>
          )}
        </div>

        {/* Billing toggle */}
        <div className="flex items-center justify-center gap-3 mt-6">
          <span className={`text-[length:var(--text-sm)] ${!annual ? 'text-text font-medium' : 'text-text-muted'}`}>Monthly</span>
          <button
            onClick={() => setAnnual(!annual)}
            className={`relative w-12 h-6 rounded-full transition-colors cursor-pointer ${annual ? 'bg-gold' : 'bg-border'}`}
            aria-label="Toggle annual billing"
            role="switch"
            aria-checked={annual}
          >
            <span className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white transition-transform shadow-sm ${annual ? 'translate-x-6' : ''}`} />
          </button>
          <span className={`text-[length:var(--text-sm)] ${annual ? 'text-text font-medium' : 'text-text-muted'}`}>
            Annual <span className="text-gold font-medium">save 17%</span>
          </span>
        </div>

        {/* Plans grid */}
        <div className="grid sm:grid-cols-3 gap-5 mt-10 items-start">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className={`rounded-2xl p-7 flex flex-col ${
                plan.featured
                  ? 'bg-bg-surface border-2 border-gold gold-glow relative scale-[1.02]'
                  : 'bg-bg-surface border border-border'
              }`}
            >
              {plan.featured && plan.badge && (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-gold text-white text-[length:var(--text-xs)] font-bold px-4 py-1 rounded-full whitespace-nowrap">
                  {plan.badge}
                </span>
              )}
              {!plan.featured && 'badge' in plan && plan.badge && (
                <span className="inline-block self-start bg-text text-bg-primary text-[length:var(--text-xs)] font-bold px-3 py-0.5 rounded-full mb-2">
                  {plan.badge}
                </span>
              )}
              <h3 className="font-display font-bold text-text text-[length:var(--text-lg)]">{plan.name}</h3>
              <div className="mt-3 flex items-baseline gap-1">
                <span className="font-mono text-text font-bold text-[length:var(--text-xl)]">
                  {plan.price === 'Free' ? 'Free' : annual ? plan.annualPrice : plan.price}
                </span>
                <span className="text-text-muted text-[length:var(--text-sm)]">
                  {plan.price === 'Free' || plan.price === 'Custom' || plan.price.includes('\u2013') ? '' : annual ? '/year' : plan.period}
                </span>
              </div>
              <p className="text-text-muted text-[length:var(--text-sm)] mt-2">{plan.description}</p>

              <ul className="mt-5 space-y-2.5 flex-1">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-2 text-text-muted text-[length:var(--text-xs)]">
                    {CHECK}<span>{feature}</span>
                  </li>
                ))}
              </ul>

              {/* Email capture for free tiers */}
              {plan.emailCapture ? (
                <div className="mt-6">
                  {emailSubmitted[plan.name] ? (
                    <div className="text-center py-3">
                      <p className="text-green-600 font-medium text-[length:var(--text-sm)]">&#10003; You&apos;re in!</p>
                      <p className="text-text-faint text-[length:var(--text-xs)] mt-1">Check your email to get started.</p>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <input
                        type="email"
                        placeholder="your@email.com"
                        value={emailInputs[plan.name] || ''}
                        onChange={(e) => setEmailInputs((prev) => ({ ...prev, [plan.name]: e.target.value }))}
                        onKeyDown={(e) => e.key === 'Enter' && handleEmailSubmit(plan.name)}
                        className="w-full px-4 py-2.5 rounded-xl border border-border bg-bg-primary text-text text-[length:var(--text-sm)] placeholder:text-text-faint focus:outline-none focus:border-gold transition-colors"
                      />
                      <Button
                        variant="ghost"
                        onClick={() => handleEmailSubmit(plan.name)}
                        className="w-full text-[length:var(--text-sm)]"
                      >
                        {plan.cta}
                      </Button>
                    </div>
                  )}
                </div>
              ) : (
                <div className="mt-6">
                  <LinkButton href={plan.ctaHref} variant={plan.ctaVariant} className="w-full text-[length:var(--text-sm)]">
                    {plan.cta}
                  </LinkButton>
                </div>
              )}
            </div>
          ))}
        </div>

      </div>
    </section>
  )
}
