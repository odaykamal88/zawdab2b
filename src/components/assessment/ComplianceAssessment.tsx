'use client'

import { useState } from 'react'
import { Button, LinkButton } from '@/components/ui/Button'

interface Question {
  id: string
  text: string
  subtitle: string
  /** Optional (i) tooltip rendered inline next to the subtitle. */
  info?: { title: string; body: string }
  options: { label: string; sublabel?: string; score: number }[]
}

const QUESTIONS: Question[] = [
  {
    id: 'jurisdiction',
    text: 'Where does your company operate or plan to operate?',
    subtitle: 'Each jurisdiction has different licensing requirements, capital thresholds, and enforcement approaches.',
    options: [
      { label: 'UAE (VARA / ADGM)', sublabel: 'Strictest enforcement in MENA — 19 firms ceased in Q4 2025', score: 3 },
      { label: 'Bahrain (CBB)', sublabel: 'Sandbox-friendly, lower capital thresholds', score: 2 },
      { label: 'Saudi Arabia (CMA)', sublabel: 'Emerging framework — draft rules expected 2026', score: 1 },
      { label: 'Multiple jurisdictions', sublabel: 'Each requires a separate license — no passporting', score: 4 },
    ],
  },
  {
    id: 'license',
    text: 'Do you currently hold a digital asset license?',
    subtitle: 'Operating without a license is the single biggest enforcement trigger in MENA.',
    options: [
      { label: 'Yes, fully licensed', sublabel: 'Licensed and operating within scope', score: 1 },
      { label: 'Application in progress', sublabel: 'Submitted but not yet approved', score: 2 },
      { label: 'No, not yet', sublabel: 'Planning to apply', score: 4 },
      { label: 'Not sure if we need one', sublabel: 'This alone puts you at risk', score: 5 },
    ],
  },
  {
    id: 'travel-rule',
    text: 'Are you compliant with FATF Travel Rule enforcement?',
    subtitle: 'Live since March 2026. Non-compliant VASPs are facing active license suspensions.',
    info: {
      title: 'What is the FATF Travel Rule?',
      body:
        'FATF Recommendation 16 requires Virtual Asset Service Providers (VASPs) to share originator and beneficiary information — name, account, address, and identifier — on qualifying crypto transfers above the jurisdiction\u2019s de minimis threshold (USD/EUR 1,000 in most of MENA). VARA and ADGM began enforcing it on 1 March 2026.',
    },
    options: [
      { label: 'Fully compliant', sublabel: 'IVMS 101 implemented and tested', score: 1 },
      { label: 'Working on it', sublabel: 'Solution selected, integration underway', score: 3 },
      { label: 'Haven\'t started', sublabel: 'No Travel Rule solution in place', score: 5 },
      { label: 'What is the Travel Rule?', sublabel: 'Critical gap \u2014 this is now mandatory', score: 5 },
    ],
  },
  {
    id: 'treasury',
    text: 'Does your organization hold digital assets on the balance sheet?',
    subtitle: 'Custody and AML frameworks are required for any entity holding virtual assets.',
    options: [
      { label: 'Yes, with compliant custody', sublabel: 'Qualified custodian, segregated assets', score: 1 },
      { label: 'Yes, but custody is informal', sublabel: 'Self-custody or unregulated provider', score: 3 },
      { label: 'Planning to acquire', sublabel: 'Not yet holding, but intend to', score: 2 },
      { label: 'No', sublabel: 'No digital assets on balance sheet', score: 0 },
    ],
  },
  {
    id: 'stablecoin',
    text: 'Are you involved in stablecoin issuance, management, or integration?',
    subtitle: 'Stablecoin activities face the strictest regulatory requirements in MENA — separate from standard VASP licensing.',
    options: [
      { label: 'We issue or plan to issue a stablecoin', sublabel: 'Requires dual approval (VARA + CBUAE), AED 50M capital, 1:1 reserves', score: 5 },
      { label: 'We manage or custody stablecoin reserves', sublabel: 'Reserve management requires HQLA backing and monthly attestation', score: 3 },
      { label: 'We use stablecoins for settlement/payments', sublabel: 'Lower risk — but on/off ramp obligations still apply', score: 1 },
      { label: 'No stablecoin involvement', sublabel: 'Not currently part of our operations', score: 0 },
    ],
  },
]

const CALENDLY_URL = process.env.NEXT_PUBLIC_CALENDLY_URL ?? 'https://calendly.com/zawda/30min'

type RiskLevel = 'low' | 'moderate' | 'high' | 'critical'

interface RiskResult {
  level: RiskLevel
  label: string
  color: string
  bgColor: string
  borderColor: string
  headline: string
  message: string
  actions: string[]
  cta: { label: string; href: string; variant: 'primary' | 'outline' }
}

function getRisk(score: number): RiskResult {
  if (score <= 6) return {
    level: 'low', label: 'Low Risk', color: 'text-emerald-600', bgColor: 'bg-emerald-50', borderColor: 'border-emerald-200',
    headline: 'Your compliance posture is strong.',
    message: 'You\'re ahead of most firms in MENA. Stay vigilant — VARA and ADGM update their frameworks quarterly, and the Travel Rule is now live. What passes audit today may not tomorrow.',
    actions: [
      'Monitor regulatory changes in real time with our Intelligence dashboard',
      'Set up alerts for your specific jurisdictions and activities',
      'Track enforcement actions to anticipate what regulators audit next',
    ],
    cta: { label: 'Get the Weekly Brief →', href: '#brief', variant: 'primary' },
  }
  if (score <= 11) return {
    level: 'moderate', label: 'Moderate Risk', color: 'text-amber-600', bgColor: 'bg-amber-50', borderColor: 'border-amber-200',
    headline: 'You have gaps that regulators are actively auditing.',
    message: 'VARA issued 19 cease-and-desist orders in Q4 2025 alone, and enforcement has continued into 2026 — firms with compliance gaps similar to yours were on those lists. The good news: these gaps are fixable. A 15-minute consultation can help you prioritize before the next audit round.',
    actions: [
      'Identify which gaps carry the highest enforcement risk',
      'Close any remaining Travel Rule gaps — enforcement is live as of March 2026',
      'Review your license scope against your actual activities',
      'Ensure your AML/KYC framework meets current regulator expectations',
    ],
    cta: { label: 'Book a Free Consultation →', href: CALENDLY_URL, variant: 'primary' },
  }
  if (score <= 17) return {
    level: 'high', label: 'High Risk', color: 'text-orange-600', bgColor: 'bg-orange-50', borderColor: 'border-orange-200',
    headline: 'Your organization is exposed to enforcement action.',
    message: 'At this risk level, fines run up to AED 600K per violation. ADGM has already imposed $8.85M in penalties year-to-date, and 19 firms received VARA cease-and-desist orders in Q4 2025 alone. With the Travel Rule now live, these gaps are license-threatening. The cost of inaction far exceeds the cost of compliance.',
    actions: [
      'Get a formal compliance gap assessment this month',
      'Finish Travel Rule implementation — enforcement is already active',
      'Review your entity structure and license scope for violations',
      'Prepare for a regulatory audit — they arrive without warning',
    ],
    cta: { label: 'Book Advisory Call →', href: CALENDLY_URL, variant: 'primary' },
  }
  return {
    level: 'critical', label: 'Critical Risk', color: 'text-red-600', bgColor: 'bg-red-50', borderColor: 'border-red-200',
    headline: 'Immediate regulatory exposure.',
    message: 'You are in the same position as the 19 firms that received VARA cease-and-desist orders in Q4 2025, and the firms hit by $8.85M in ADGM penalties this year. License suspension, AED 600K per-violation fines, and personal director liability are all on the table. This is not theoretical — it is happening to firms right now.',
    actions: [
      'Stop any unlicensed virtual asset activity immediately',
      'Engage legal counsel to assess your exposure and director liability',
      'File for the appropriate license before enforcement reaches you',
      'Implement emergency AML/KYC and Travel Rule controls — even interim measures reduce risk',
      'Prepare a regulatory response plan in case of an enforcement inquiry',
    ],
    cta: { label: 'Book Urgent Advisory Call →', href: CALENDLY_URL, variant: 'primary' },
  }
}

export function ComplianceAssessment() {
  const [currentStep, setCurrentStep] = useState(0)
  const [answers, setAnswers] = useState<Record<string, number>>({})
  const [showResult, setShowResult] = useState(false)
  const [infoOpen, setInfoOpen] = useState(false)

  const totalSteps = QUESTIONS.length
  const progress = showResult ? 100 : (currentStep / totalSteps) * 100

  function handleSelect(questionId: string, score: number) {
    const newAnswers = { ...answers, [questionId]: score }
    setAnswers(newAnswers)
    setInfoOpen(false)
    if (currentStep < totalSteps - 1) {
      setCurrentStep(currentStep + 1)
    } else {
      setShowResult(true)
    }
  }

  function reset() {
    setCurrentStep(0)
    setAnswers({})
    setShowResult(false)
  }

  const totalScore = Object.values(answers).reduce((sum, s) => sum + s, 0)
  const risk = getRisk(totalScore)
  const question = QUESTIONS[currentStep]

  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-bg-surface border border-border rounded-2xl p-6 sm:p-8 shadow-sm">
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <span className="font-mono text-gold text-[length:var(--text-xs)] uppercase tracking-widest">
              Compliance Assessment
            </span>
            <span className="text-text-muted text-[length:var(--text-xs)]">
              {showResult ? 'Complete' : `${currentStep + 1} of ${totalSteps}`}
            </span>
          </div>
          <div className="h-1.5 bg-bg-surface-2 rounded-full overflow-hidden">
            <div className="h-full bg-gold rounded-full transition-all duration-500" style={{ width: `${progress}%` }} />
          </div>
        </div>

        {showResult ? (
          <div className="space-y-5">
            {/* Risk level header */}
            <div className={`${risk.bgColor} ${risk.borderColor} border rounded-xl p-5`}>
              <div className="flex items-start justify-between">
                <div>
                  <p className={`font-display font-bold text-[length:var(--text-xl)] ${risk.color}`}>
                    {risk.label}
                  </p>
                  <p className="font-display font-bold text-text text-[length:var(--text-base)] mt-1">
                    {risk.headline}
                  </p>
                </div>
                <div className="text-right shrink-0 ml-4">
                  <p className="font-mono text-text-faint text-[length:var(--text-xs)]">Score</p>
                  <p className={`font-mono font-bold text-[length:var(--text-lg)] ${risk.color}`}>
                    {totalScore}<span className="text-text-faint font-normal">/{totalSteps * 5}</span>
                  </p>
                </div>
              </div>
            </div>

            {/* Main message */}
            <p className="text-text text-[length:var(--text-base)] leading-relaxed">
              {risk.message}
            </p>

            {/* Action items */}
            <div className="bg-bg-primary border border-border rounded-xl p-5">
              <p className="font-display font-bold text-text text-[length:var(--text-sm)] mb-3">
                What you should do next:
              </p>
              <ul className="space-y-2.5">
                {risk.actions.map((action, i) => (
                  <li key={i} className="flex items-start gap-2.5">
                    <span className="text-gold font-bold text-[length:var(--text-sm)] mt-0.5 shrink-0">{i + 1}.</span>
                    <span className="text-text-muted text-[length:var(--text-sm)] leading-relaxed">{action}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* CTAs — primary action, watch demo (scrolls to #demo), dashboard, retake */}
            <div className="flex flex-col sm:flex-row sm:flex-wrap gap-3 pt-2">
              <LinkButton
                href={risk.cta.href}
                variant={risk.cta.variant}
                target={risk.cta.href.startsWith('http') ? '_blank' : undefined}
                rel={risk.cta.href.startsWith('http') ? 'noopener noreferrer' : undefined}
              >
                {risk.cta.label}
              </LinkButton>
              <LinkButton href="#demo" variant="outline">
                Watch Dashboard Demo &rarr;
              </LinkButton>
              <LinkButton href="/register" variant="outline">
                Access the Dashboard &rarr;
              </LinkButton>
              <Button variant="ghost" onClick={reset}>
                Retake
              </Button>
            </div>
          </div>
        ) : (
          <div>
            <h3 className="font-display font-bold text-text text-[length:var(--text-lg)] mb-1.5">
              {question.text}
            </h3>
            <div className="mb-5">
              <p className="text-text-muted text-[length:var(--text-xs)] leading-relaxed inline">
                {question.subtitle}
              </p>
              {question.info && (
                <>
                  {' '}
                  <button
                    type="button"
                    onClick={() => setInfoOpen((open) => !open)}
                    aria-expanded={infoOpen}
                    aria-label={`More about: ${question.info.title}`}
                    className="inline-flex items-center justify-center w-4 h-4 rounded-full border border-gold/60 text-gold text-[10px] font-bold leading-none align-middle hover:bg-gold hover:text-white transition-colors cursor-pointer"
                  >
                    i
                  </button>
                  {infoOpen && (
                    <div
                      role="note"
                      className="mt-3 bg-gold-light border border-gold/30 rounded-xl p-4 text-[length:var(--text-xs)] leading-relaxed"
                    >
                      <p className="font-display font-bold text-text mb-1">
                        {question.info.title}
                      </p>
                      <p className="text-text-muted">{question.info.body}</p>
                    </div>
                  )}
                </>
              )}
            </div>
            <div className="grid gap-3">
              {question.options.map((option) => (
                <button
                  key={option.label}
                  onClick={() => handleSelect(question.id, option.score)}
                  className="text-left px-5 py-4 rounded-xl border border-border bg-bg-primary hover:border-gold hover:bg-gold-light transition-all cursor-pointer group"
                >
                  <span className="text-text font-medium text-[length:var(--text-base)] group-hover:text-text">
                    {option.label}
                  </span>
                  {option.sublabel && (
                    <span className="block text-text-faint text-[length:var(--text-xs)] mt-0.5">
                      {option.sublabel}
                    </span>
                  )}
                </button>
              ))}
            </div>
            {currentStep > 0 && (
              <button
                onClick={() => setCurrentStep(currentStep - 1)}
                className="mt-4 text-text-muted hover:text-text text-[length:var(--text-sm)] transition-colors cursor-pointer"
              >
                &larr; Back
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
