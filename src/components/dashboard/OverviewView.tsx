'use client'

import { useState } from 'react'
import { useOnboarding } from '@/lib/onboarding-context'
import { useSubscription } from '@/hooks/useSubscription'
import { JURISDICTIONS } from '@/lib/licensing-data'
import { BrandName } from '@/components/ui/BrandName'

const ALL_ACTIVITIES = [
  'Exchange / Trading Platform',
  'Broker-Dealer',
  'Custody & Safeguarding',
  'Advisory Services',
  'Lending & Borrowing',
  'Transfer & Settlement',
  'Payments / Remittance',
  'OTC Brokerage',
  'Fund Management / Tokenized Funds',
  'Stablecoin Issuance',
  'Stablecoin Management',
  'NFT / Digital Collectibles Platform',
]

const ALERTS = [
  {
    severity: 'critical' as const,
    jurisdiction: 'vara',
    title: 'VARA Travel Rule — In Effect Since March 2026',
    description:
      'FATF Travel Rule enforcement has been in effect since March 2026. Non-compliant VASPs face license suspension. Ensure your IVMS 101 solution is implemented and tested with counterparty VASPs.',
    date: 'In effect since March 2026',
  },
  {
    severity: 'high' as const,
    jurisdiction: 'adgm',
    title: 'ADGM Updated Capital Requirements',
    description:
      'FSRA implemented new capital adequacy requirements for digital asset firms effective June 2025. No phase-in period — existing licensees must comply immediately.',
    date: 'Effective: June 2025',
  },
  {
    severity: 'medium' as const,
    jurisdiction: 'vara',
    title: 'VARA Quarterly Compliance Returns Due',
    description:
      'Q1 2026 compliance returns due within 30 days of quarter end. Late submissions trigger supervisory escalation.',
    date: 'Due: April 30, 2026',
  },
  {
    severity: 'high' as const,
    jurisdiction: 'cbb',
    title: 'CBB Sandbox Cohort Review — Q2 2026',
    description:
      'CBB is conducting its periodic sandbox cohort review. Sandbox entities must demonstrate progress toward full licensing requirements.',
    date: 'Review: Q2 2026',
  },
  {
    severity: 'high' as const,
    jurisdiction: 'cma-sa',
    title: 'Saudi CMA Digital Asset Framework — Draft',
    description:
      'The CMA Saudi Arabia has published a draft regulatory framework for digital assets. Comments open until Q3 2026.',
    date: 'Draft: Q2 2026',
  },
  {
    severity: 'medium' as const,
    jurisdiction: 'qfcra',
    title: 'QFC Digital Asset Custody Standards',
    description:
      'Qatar Financial Centre Authority introduced custody and safeguarding standards. Entities must appoint a qualified custodian or obtain a custody license.',
    date: 'Effective: July 2026',
  },
]

const UPCOMING_DEADLINES = [
  { title: 'ADGM Capital Adequacy Self-Assessment', date: 'Apr 15, 2026', days: 2, jurisdictionId: 'adgm', jurisdiction: 'ADGM', severity: 'critical' },
  { title: 'VARA Q1 2026 Compliance Returns', date: 'Apr 30, 2026', days: 17, jurisdictionId: 'vara', jurisdiction: 'VARA', severity: 'high' },
  { title: 'CBB Annual AML/CFT Compliance Report', date: 'Apr 30, 2026', days: 17, jurisdictionId: 'cbb', jurisdiction: 'CBB', severity: 'high' },
  { title: 'VARA MLRO Annual Attestation', date: 'May 15, 2026', days: 32, jurisdictionId: 'vara', jurisdiction: 'VARA', severity: 'medium' },
  { title: 'CMA-SA Consultation Response Window', date: 'Jun 30, 2026', days: 76, jurisdictionId: 'cma-sa', jurisdiction: 'CMA-SA', severity: 'medium' },
  { title: 'QFC Custody License Application Window', date: 'Jul 01, 2026', days: 77, jurisdictionId: 'qfcra', jurisdiction: 'QFC', severity: 'medium' },
]

const SEVERITY_STYLES = {
  critical: 'border-l-red-600 bg-red-50',
  high: 'border-l-orange-500 bg-orange-50',
  medium: 'border-l-amber-500 bg-amber-50',
}

const SEVERITY_LABELS = {
  critical: 'text-red-600',
  high: 'text-orange-600',
  medium: 'text-amber-600',
}

const STAGE_CONTEXT: Record<string, { heading: string; actionItems: string[] }> = {
  exploring: {
    heading: 'You are in the exploration phase. Here is what to focus on:',
    actionItems: [
      'Compare jurisdiction requirements — use the Licensing Roadmap to see the full process side by side.',
      'Assess your entity readiness — most jurisdictions require a purpose-built entity, not a repurposed one.',
      'Review the hidden risks for your target jurisdiction before committing.',
    ],
  },
  'pre-application': {
    heading: 'You are preparing to apply. These are your priorities:',
    actionItems: [
      'Upload your <strong>AML/CFT Policy Manual</strong> — required for Step 4 and frequently the longest document to prepare.',
      'Confirm your <strong>MLRO appointment</strong> — must be UAE-resident with genuine AML experience.',
      'Complete your <strong>Business Plan</strong> with 3-year financial projections.',
    ],
  },
  'application-in-progress': {
    heading: 'Your application is in progress. Stay on top of:',
    actionItems: [
      'Monitor your <strong>application status</strong> — regulators may request additional information at any stage.',
      'Ensure your <strong>Fit & Proper</strong> documentation is complete for all key persons.',
      'Prepare for the <strong>Technology & Security Audit</strong> — book a penetration test now if not already scheduled.',
    ],
  },
  licensed: {
    heading: 'You hold a license. Ongoing compliance is critical:',
    actionItems: [
      'Review the <strong>Travel Rule readiness assessment</strong> — enforcement is now in effect (since March 2026).',
      'Ensure your <strong>quarterly compliance returns</strong> are filed on time.',
      'Keep your <strong>audit pack</strong> current — random audits can happen with 48-hour notice.',
    ],
  },
}

interface GettingStartedStep {
  label: string
  navigateTo: string
  description: string
}

const GETTING_STARTED_STEPS: GettingStartedStep[] = [
  {
    label: 'Review your licensing roadmap',
    navigateTo: 'licensing',
    description: 'Understand the full licensing process for your jurisdiction.',
  },
  {
    label: 'Upload key documents',
    navigateTo: 'documents',
    description: 'Upload your AML policy, business plan, and other required docs.',
  },
  {
    label: 'Review risk advisories',
    navigateTo: 'risks',
    description: 'See hidden risks and common pitfalls for your jurisdiction.',
  },
  {
    label: 'Set up compliance alerts',
    navigateTo: 'alerts',
    description: 'Stay informed about regulatory deadlines and changes.',
  },
  {
    label: 'Consider upgrading for expert guidance',
    navigateTo: 'upgrade',
    description: 'Get one-on-one support from compliance specialists.',
  },
]

function getGreeting(): string {
  const hour = new Date().getHours()
  if (hour < 12) return 'Good morning'
  if (hour < 17) return 'Good afternoon'
  return 'Good evening'
}

export function OverviewView({ onNavigate }: { onNavigate: (id: string) => void }) {
  const { data: onboardingData, update } = useOnboarding()
  const { subscription } = useSubscription()
  const [editingActivities, setEditingActivities] = useState(false)

  const stage = onboardingData?.licensingStage ?? 'exploring'
  const context = STAGE_CONTEXT[stage] ?? STAGE_CONTEXT['exploring']
  const jurisdiction = JURISDICTIONS.find((j) => j.id === onboardingData?.primaryJurisdiction)
  const riskCount = jurisdiction?.hiddenRisks.length ?? 6
  const stepCount = jurisdiction?.steps.length ?? 12
  const userJurisdictions = [onboardingData?.primaryJurisdiction, ...(onboardingData?.additionalJurisdictions ?? [])].filter(Boolean) as string[]
  const filteredAlerts = userJurisdictions.length > 0
    ? ALERTS.filter((a) => userJurisdictions.includes(a.jurisdiction))
    : ALERTS
  const filteredDeadlines = userJurisdictions.length > 0
    ? UPCOMING_DEADLINES.filter((d) => userJurisdictions.includes(d.jurisdictionId))
    : UPCOMING_DEADLINES
  const deadlinesThisMonth = filteredDeadlines.filter((d) => d.days <= 30).length
  const displayName = onboardingData?.companyName
    ? onboardingData.companyName.split(' ')[0]
    : 'there'

  const isNewUser = stage === 'exploring' || !onboardingData?.completedAt
  const hasActivities = onboardingData && onboardingData.targetActivities.length > 0

  function toggleActivity(activity: string) {
    const current = onboardingData?.targetActivities ?? []
    const next = current.includes(activity)
      ? current.filter((a) => a !== activity)
      : [...current, activity]
    update({ targetActivities: next })
  }

  return (
    <div className="space-y-8">
      {/* Welcome */}
      <div>
        <h1 className="font-display font-bold text-text text-[length:var(--text-xl)]">
          {getGreeting()}, {displayName}.
        </h1>
        <p className="text-text-muted text-[length:var(--text-sm)] mt-1">
          {isNewUser ? (
            <>
              Welcome to <BrandName className="font-medium text-text" />. Follow the steps below to get started with your compliance journey.
            </>
          ) : (
            <>
              Here&rsquo;s your compliance status as of{' '}
              {new Date().toLocaleDateString('en-US', {
                month: 'long',
                day: 'numeric',
                year: 'numeric',
              })}
              .
              {jurisdiction && (
                <>
                  {' '}
                  Jurisdiction: <strong className="text-text">{jurisdiction.name}</strong>.
                </>
              )}
            </>
          )}
        </p>
      </div>

      {/* Plan upgrade banner — shown for free plan users */}
      {subscription && subscription.plan === 'watchlist-free' && (
        <div className="bg-gradient-to-br from-gold/5 via-bg-primary to-gold/5 border border-gold/20 rounded-2xl p-5 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <p className="font-display font-bold text-text text-[length:var(--text-sm)]">
              You&apos;re on the Free plan
            </p>
            <p className="text-text-muted text-[length:var(--text-xs)] mt-0.5 leading-relaxed max-w-sm">
              Upgrade to unlock real-time alerts, risk screening, travel rule tools, and the full compliance dashboard.
            </p>
          </div>
          <a
            href="/checkout?plan=professional-799"
            className="shrink-0 px-5 py-2 bg-gold text-white text-[length:var(--text-xs)] font-medium rounded-lg hover:brightness-110 transition-all whitespace-nowrap"
          >
            Upgrade to Professional &rarr;
          </a>
        </div>
      )}

      {/* Getting Started Checklist — shown for new users */}
      {isNewUser && (
        <div className="bg-bg-primary border border-gold/20 rounded-2xl p-6">
          <h2 className="font-display font-bold text-text text-[length:var(--text-base)] mb-1">
            Getting Started
          </h2>
          <p className="text-text-muted text-[length:var(--text-xs)] mb-5">
            Complete these steps to set up your compliance workspace.
          </p>
          <ol className="space-y-3">
            {GETTING_STARTED_STEPS.map((step, i) => (
              <li key={i}>
                <button
                  onClick={() => onNavigate(step.navigateTo)}
                  className="w-full flex items-start gap-3 text-left group cursor-pointer rounded-xl p-3 -mx-3 hover:bg-gold/5 transition-colors"
                >
                  <span className="mt-0.5 shrink-0 w-6 h-6 rounded-full border-2 border-gold/40 flex items-center justify-center text-[length:var(--text-xs)] font-mono font-bold text-gold">
                    {i + 1}
                  </span>
                  <div className="min-w-0">
                    <span className="text-text font-medium text-[length:var(--text-sm)] group-hover:text-gold transition-colors">
                      {step.label}
                    </span>
                    <p className="text-text-faint text-[length:var(--text-xs)] mt-0.5">
                      {step.description}
                    </p>
                  </div>
                  <span className="ml-auto shrink-0 text-text-faint group-hover:text-gold transition-colors text-[length:var(--text-sm)]">
                    &rarr;
                  </span>
                </button>
              </li>
            ))}
          </ol>
        </div>
      )}

      {/* Compliance Health Scorecard */}
      <div className="bg-bg-primary border border-border rounded-2xl p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-display font-bold text-text text-[length:var(--text-base)]">Compliance Health</h2>
          <span className="font-mono text-text-faint text-[length:var(--text-xs)]">Updated today</span>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="text-center">
            <div className="relative w-16 h-16 mx-auto mb-2">
              <svg viewBox="0 0 36 36" className="w-full h-full -rotate-90">
                <circle cx="18" cy="18" r="15" fill="none" stroke="var(--border)" strokeWidth="3" />
                <circle cx="18" cy="18" r="15" fill="none" stroke="var(--gold)" strokeWidth="3" strokeDasharray="0 100" strokeLinecap="round" />
              </svg>
              <span className="absolute inset-0 flex items-center justify-center font-mono text-gold font-bold text-[length:var(--text-sm)]">0%</span>
            </div>
            <p className="text-text-faint text-[length:var(--text-xs)]">Licensing</p>
          </div>
          <div className="text-center">
            <div className="relative w-16 h-16 mx-auto mb-2">
              <svg viewBox="0 0 36 36" className="w-full h-full -rotate-90">
                <circle cx="18" cy="18" r="15" fill="none" stroke="var(--border)" strokeWidth="3" />
                <circle cx="18" cy="18" r="15" fill="none" stroke="var(--gold)" strokeWidth="3" strokeDasharray="0 100" strokeLinecap="round" />
              </svg>
              <span className="absolute inset-0 flex items-center justify-center font-mono text-gold font-bold text-[length:var(--text-sm)]">0%</span>
            </div>
            <p className="text-text-faint text-[length:var(--text-xs)]">Documents</p>
          </div>
          <div className="text-center">
            <div className="relative w-16 h-16 mx-auto mb-2">
              <svg viewBox="0 0 36 36" className="w-full h-full -rotate-90">
                <circle cx="18" cy="18" r="15" fill="none" stroke="var(--border)" strokeWidth="3" />
                <circle cx="18" cy="18" r="15" fill="none" stroke="#ef4444" strokeWidth="3" strokeDasharray="100 0" strokeLinecap="round" />
              </svg>
              <span className="absolute inset-0 flex items-center justify-center font-mono text-red-600 font-bold text-[length:var(--text-sm)]">{riskCount}</span>
            </div>
            <p className="text-text-faint text-[length:var(--text-xs)]">Risks</p>
          </div>
          <div className="text-center">
            <div className="relative w-16 h-16 mx-auto mb-2">
              <svg viewBox="0 0 36 36" className="w-full h-full -rotate-90">
                <circle cx="18" cy="18" r="15" fill="none" stroke="var(--border)" strokeWidth="3" />
                <circle cx="18" cy="18" r="15" fill="none" stroke="#f59e0b" strokeWidth="3" strokeDasharray="35 65" strokeLinecap="round" />
              </svg>
              <span className="absolute inset-0 flex items-center justify-center font-mono text-amber-600 font-bold text-[length:var(--text-sm)]">35%</span>
            </div>
            <p className="text-text-faint text-[length:var(--text-xs)]">Deadlines</p>
          </div>
        </div>
      </div>

      {/* Status cards */}
      <div className="grid sm:grid-cols-4 gap-4">
        <button
          onClick={() => onNavigate('licensing')}
          className="bg-bg-primary border border-border rounded-2xl p-5 text-left hover:border-gold transition-colors cursor-pointer"
        >
          <p className="font-mono text-text-faint uppercase tracking-widest text-[length:var(--text-xs)] mb-2">
            Licensing
          </p>
          <p className="font-mono text-gold font-bold text-[length:var(--text-xl)]">
            0/{stepCount}
          </p>
          <p className="text-text-muted text-[length:var(--text-xs)]">
            {jurisdiction?.name ?? 'VARA'} steps
          </p>
        </button>
        <button
          onClick={() => onNavigate('documents')}
          className="bg-bg-primary border border-border rounded-2xl p-5 text-left hover:border-gold transition-colors cursor-pointer"
        >
          <p className="font-mono text-text-faint uppercase tracking-widest text-[length:var(--text-xs)] mb-2">
            Documents
          </p>
          <p className="font-mono text-gold font-bold text-[length:var(--text-xl)]">0/16</p>
          <p className="text-text-muted text-[length:var(--text-xs)]">
            Required uploaded
          </p>
        </button>
        <button
          onClick={() => onNavigate('calendar')}
          className="bg-bg-primary border border-border rounded-2xl p-5 text-left hover:border-gold transition-colors cursor-pointer"
        >
          <p className="font-mono text-text-faint uppercase tracking-widest text-[length:var(--text-xs)] mb-2">
            Deadlines
          </p>
          <p className="font-mono text-orange-600 font-bold text-[length:var(--text-xl)]">{deadlinesThisMonth}</p>
          <p className="text-text-muted text-[length:var(--text-xs)]">
            Due this month
          </p>
        </button>
        <button
          onClick={() => onNavigate('risks')}
          className="bg-bg-primary border border-border rounded-2xl p-5 text-left hover:border-gold transition-colors cursor-pointer"
        >
          <p className="font-mono text-text-faint uppercase tracking-widest text-[length:var(--text-xs)] mb-2">
            Risk Warnings
          </p>
          <p className="font-mono text-alert font-bold text-[length:var(--text-xl)]">
            {riskCount}
          </p>
          <p className="text-text-muted text-[length:var(--text-xs)]">
            Active risks
          </p>
        </button>
      </div>

      {/* Target Activities with edit */}
      <div className="bg-bg-primary border border-gold/20 rounded-2xl p-6">
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-display font-bold text-text text-[length:var(--text-base)]">
            Your Target Activities
          </h2>
          <button
            onClick={() => setEditingActivities(!editingActivities)}
            className="text-gold text-[length:var(--text-xs)] font-mono hover:underline cursor-pointer"
          >
            {editingActivities ? 'Done' : 'Edit'}
          </button>
        </div>

        {/* Current activities display */}
        {hasActivities && !editingActivities && (
          <div className="flex flex-wrap gap-2">
            {onboardingData.targetActivities.map((activity) => (
              <span
                key={activity}
                className="px-3 py-1.5 rounded-lg bg-gold-light text-text text-[length:var(--text-xs)] font-medium"
              >
                {activity}
              </span>
            ))}
          </div>
        )}

        {/* Empty state */}
        {!hasActivities && !editingActivities && (
          <p className="text-text-faint text-[length:var(--text-sm)]">
            No activities selected yet.{' '}
            <button
              onClick={() => setEditingActivities(true)}
              className="text-gold hover:underline cursor-pointer"
            >
              Add your target activities
            </button>
            .
          </p>
        )}

        {/* Activity picker */}
        {editingActivities && (
          <div className="grid sm:grid-cols-2 gap-2 mt-1">
            {ALL_ACTIVITIES.map((activity) => {
              const selected = onboardingData?.targetActivities?.includes(activity) ?? false
              return (
                <button
                  key={activity}
                  onClick={() => toggleActivity(activity)}
                  className={`flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-left text-[length:var(--text-xs)] font-medium transition-colors cursor-pointer border ${
                    selected
                      ? 'bg-gold/10 border-gold/30 text-text'
                      : 'bg-bg-primary border-border text-text-muted hover:border-gold/20'
                  }`}
                >
                  <span
                    className={`shrink-0 w-4 h-4 rounded border flex items-center justify-center text-[10px] ${
                      selected
                        ? 'bg-gold border-gold text-white'
                        : 'border-border'
                    }`}
                  >
                    {selected && '\u2713'}
                  </span>
                  {activity}
                </button>
              )
            })}
          </div>
        )}

        {jurisdiction && !editingActivities && hasActivities && (
          <p className="text-text-faint text-[length:var(--text-xs)] mt-3">
            In {jurisdiction.name}, each activity requires a separate license application. Capital
            requirements vary by activity type.
          </p>
        )}
      </div>

      {/* Regulatory Activity Timeline */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-display font-bold text-text text-[length:var(--text-lg)]">
            Regulatory Activity
          </h2>
          <div className="flex items-center gap-3">
            <button
              onClick={() => onNavigate('calendar')}
              className="text-gold text-[length:var(--text-xs)] hover:underline cursor-pointer"
            >
              Calendar &rarr;
            </button>
            <button
              onClick={() => onNavigate('alerts')}
              className="text-gold text-[length:var(--text-xs)] hover:underline cursor-pointer"
            >
              All alerts &rarr;
            </button>
          </div>
        </div>
        <div className="space-y-3">
          {filteredAlerts.map((alert, i) => (
            <div
              key={i}
              className={`border-l-4 rounded-xl p-5 ${SEVERITY_STYLES[alert.severity]}`}
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span
                      className={`font-mono uppercase text-[length:var(--text-xs)] font-bold ${SEVERITY_LABELS[alert.severity]}`}
                    >
                      {alert.severity}
                    </span>
                    <span className="text-text-faint text-[length:var(--text-xs)]">
                      {alert.date}
                    </span>
                  </div>
                  <h3 className="text-text font-medium text-[length:var(--text-sm)]">
                    {alert.title}
                  </h3>
                  <p className="text-text-muted text-[length:var(--text-xs)] mt-1 leading-relaxed">
                    {alert.description}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Upcoming Deadlines Quick View */}
      <div className="bg-bg-primary border border-border rounded-2xl p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-display font-bold text-text text-[length:var(--text-base)]">Upcoming Deadlines</h2>
          <button
            onClick={() => onNavigate('calendar')}
            className="text-gold text-[length:var(--text-xs)] hover:underline cursor-pointer"
          >
            Full calendar &rarr;
          </button>
        </div>
        <div className="space-y-3">
          {filteredDeadlines.map((d, i) => (
            <div key={i} className="flex items-center justify-between py-2 border-b border-border last:border-0 gap-3">
              <div className="min-w-0 flex-1">
                <p className="text-text text-[length:var(--text-sm)] font-medium truncate">{d.title}</p>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="font-mono text-text-faint text-[length:var(--text-xs)]">{d.jurisdiction}</span>
                  <span className="text-text-faint text-[length:var(--text-xs)]">&middot;</span>
                  <span className="text-text-faint text-[length:var(--text-xs)]">{d.date}</span>
                </div>
              </div>
              <span className={`shrink-0 font-mono font-bold text-[length:var(--text-xs)] px-2.5 py-1 rounded-lg ${
                d.days <= 7 ? 'text-red-600 bg-red-50' : d.days <= 30 ? 'text-orange-600 bg-orange-50' : 'text-amber-600 bg-amber-50'
              }`}>
                {d.days}d
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Stage-specific action items */}
      <div className="bg-bg-primary border border-border rounded-2xl p-6">
        <h2 className="font-display font-bold text-text text-[length:var(--text-base)] mb-2">
          What you should do this week
        </h2>
        <p className="text-text-muted text-[length:var(--text-xs)] mb-4">{context.heading}</p>
        <ul className="space-y-3">
          {context.actionItems.map((item, i) => (
            <li
              key={i}
              className="flex items-start gap-3 text-text-muted text-[length:var(--text-sm)]"
            >
              <span className={`mt-0.5 shrink-0 ${i === 0 ? 'text-alert' : 'text-gold'}`}>
                &#9679;
              </span>
              <span dangerouslySetInnerHTML={{ __html: item }} />
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}
