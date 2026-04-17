'use client'

import { useState } from 'react'
import { JURISDICTIONS, CATEGORY_LABELS, type LicenseStep } from '@/lib/licensing-data'
import { JURISDICTION_PROFILES } from '@/lib/jurisdiction-intelligence'
import { useOnboarding } from '@/lib/onboarding-context'

const REGULATORY_FIGURES: Record<string, { name: string; title: string; organization: string; relevance: string; initials: string }[]> = {
  vara: [
    { name: 'H.E. Helal Saeed Al Marri', title: 'Director General', organization: 'DTCM / Dubai World Trade Centre Authority', relevance: 'Oversees Dubai\'s economic zones including VARA\'s institutional positioning', initials: 'HM' },
    { name: 'Matthew White', title: 'CEO', organization: 'VARA', relevance: 'Leads VARA\'s operational and regulatory strategy. Key figure in licensing decisions.', initials: 'MW' },
    { name: 'Deepa Raja Carbon', title: 'Head of Supervision', organization: 'VARA', relevance: 'Oversees ongoing compliance supervision for licensed VASPs. Your primary regulatory contact post-license.', initials: 'DC' },
  ],
  adgm: [
    { name: 'H.E. Ahmed Jasim Al Zaabi', title: 'Chairman', organization: 'ADGM', relevance: 'Chairman of ADGM. Sets strategic direction for the financial free zone including digital assets.', initials: 'AZ' },
    { name: 'Emmanuel Givanakis', title: 'CEO', organization: 'ADGM FSRA', relevance: 'Leads the FSRA which directly regulates digital asset firms in ADGM.', initials: 'EG' },
    { name: 'Wai Lum Kwong', title: 'Executive Director, Supervision', organization: 'ADGM FSRA', relevance: 'Heads supervision and enforcement. Key figure in compliance examinations.', initials: 'WK' },
  ],
  cbb: [
    { name: 'H.E. Rasheed Al Maraj', title: 'Governor', organization: 'Central Bank of Bahrain', relevance: 'Governor of CBB overseeing all financial regulation including crypto-asset licensing.', initials: 'RM' },
    { name: 'Khalid Hamad', title: 'Executive Director, Banking Supervision', organization: 'CBB', relevance: 'Key decision maker for fintech and crypto-asset sandbox admissions and full license grants.', initials: 'KH' },
    { name: 'Dalal Al Qais', title: 'Director, Licensing & Policy', organization: 'CBB', relevance: 'Manages licensing policy and application reviews for sandbox and CRA module applicants.', initials: 'DQ' },
  ],
}

export function LicensingView({ defaultJurisdiction }: { defaultJurisdiction?: string }) {
  const { data } = useOnboarding()

  // Use the recommended jurisdiction (from recommendation engine) if available,
  // otherwise fall back to the primary jurisdiction from onboarding
  const effectiveJurisdiction = data.recommendedJurisdiction || defaultJurisdiction || data.primaryJurisdiction || 'vara'

  // Only show jurisdictions the user has selected (primary + additional), plus the recommended one
  const userJurisdictionIds = new Set([
    data.primaryJurisdiction,
    ...(data.additionalJurisdictions || []),
    ...(data.recommendedJurisdiction ? [data.recommendedJurisdiction] : []),
  ].filter(Boolean))

  // Filter licensing-data jurisdictions to only those the user selected
  // If no match (e.g. user selected an emerging/hostile jurisdiction), show all active ones
  const availableJurisdictions = JURISDICTIONS.filter((j) => userJurisdictionIds.has(j.id))
  const displayJurisdictions = availableJurisdictions.length > 0 ? availableJurisdictions : JURISDICTIONS

  const [selectedJurisdiction, setSelectedJurisdiction] = useState(
    displayJurisdictions.find((j) => j.id === effectiveJurisdiction)?.id || displayJurisdictions[0]?.id || 'vara'
  )
  const [completed, setCompleted] = useState<Record<string, boolean>>({})
  const [expandedStep, setExpandedStep] = useState<string | null>(null)

  // License selector state: get available licenses for the selected jurisdiction
  const jurisdictionProfile = JURISDICTION_PROFILES[selectedJurisdiction]
  const availableLicenses = jurisdictionProfile?.licenses || []

  // Determine which license is active — default to the user's selectedLicense if it exists in this jurisdiction
  const defaultLicense = availableLicenses.find((l) => l.name === data.selectedLicense)?.name
    || availableLicenses.find((l) => l.name === data.recommendedLicense)?.name
    || ''
  const [selectedLicenseTab, setSelectedLicenseTab] = useState(defaultLicense)

  // Reset license tab when jurisdiction changes (handled via key below)
  const activeLicense = availableLicenses.find((l) => l.name === selectedLicenseTab)

  const jurisdiction = displayJurisdictions.find((j) => j.id === selectedJurisdiction) ?? displayJurisdictions[0] ?? JURISDICTIONS[0]
  const completedCount = jurisdiction.steps.filter((s) => completed[s.id]).length
  const progressPercent = Math.round((completedCount / jurisdiction.steps.length) * 100)

  function toggleStep(id: string) {
    setCompleted((prev) => ({ ...prev, [id]: !prev[id] }))
  }

  function handleJurisdictionChange(id: string) {
    setSelectedJurisdiction(id)
    setExpandedStep(null)
    // Reset license tab to user's selected license if available in new jurisdiction, or clear
    const newProfile = JURISDICTION_PROFILES[id]
    const newLicenses = newProfile?.licenses || []
    const match = newLicenses.find((l) => l.name === data.selectedLicense)?.name
      || newLicenses.find((l) => l.name === data.recommendedLicense)?.name
      || ''
    setSelectedLicenseTab(match)
  }

  const categories = ['pre-application', 'application', 'post-license'] as const
  const figures = REGULATORY_FIGURES[selectedJurisdiction] || []

  return (
    <div className="space-y-6">
      {/* Header + jurisdiction selector */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-display font-bold text-text text-[length:var(--text-lg)]">Licensing Roadmap</h1>
          <p className="text-text-muted text-[length:var(--text-sm)]">
            {data.selectedLicense
              ? <>Tailored for <strong className="text-text">{data.selectedLicense}</strong></>
              : 'Step-by-step guide with required documents and risk warnings'}
          </p>
        </div>
        {displayJurisdictions.length > 1 ? (
          <select
            value={selectedJurisdiction}
            onChange={(e) => handleJurisdictionChange(e.target.value)}
            className="px-4 py-2.5 rounded-xl border border-border bg-bg-primary text-text text-[length:var(--text-sm)] focus:outline-none focus:border-gold cursor-pointer"
          >
            {displayJurisdictions.map((j) => (
              <option key={j.id} value={j.id}>
                {j.flag} {j.name}
                {j.id === effectiveJurisdiction ? ' (Recommended)' : ''}
              </option>
            ))}
          </select>
        ) : (
          <div className="px-4 py-2.5 rounded-xl border border-gold/30 bg-gold-light text-text text-[length:var(--text-sm)] font-medium">
            {jurisdiction.flag} {jurisdiction.name}
          </div>
        )}
      </div>

      {/* License selector */}
      {availableLicenses.length > 1 && (
        <div>
          <p className="font-mono text-text-faint text-[length:var(--text-xs)] uppercase tracking-wider mb-2">License Type</p>
          <div className="flex flex-wrap gap-2">
            {availableLicenses.map((license) => {
              const isActive = selectedLicenseTab === license.name
              const isUserSelected = license.name === data.selectedLicense
              return (
                <button
                  key={license.name}
                  onClick={() => setSelectedLicenseTab(isActive ? '' : license.name)}
                  className={`px-3 py-1.5 rounded-lg text-[length:var(--text-xs)] font-mono transition-all cursor-pointer border ${
                    isActive
                      ? 'bg-gold/10 border-gold text-gold font-bold'
                      : 'bg-bg-primary border-border text-text-muted hover:border-gold/50'
                  }`}
                >
                  {license.name}
                  {isUserSelected && ' *'}
                </button>
              )
            })}
          </div>
          {activeLicense && (
            <div className="mt-3 bg-bg-primary border border-gold/20 rounded-xl p-4 grid sm:grid-cols-3 gap-3">
              <div>
                <p className="font-mono text-text-faint text-[length:var(--text-xs)] uppercase tracking-wider">Activities</p>
                <p className="text-text text-[length:var(--text-sm)] mt-1">{activeLicense.activities.join(', ')}</p>
              </div>
              <div>
                <p className="font-mono text-text-faint text-[length:var(--text-xs)] uppercase tracking-wider">Min Capital</p>
                <p className="text-text font-bold text-[length:var(--text-sm)] mt-1">{activeLicense.capital}</p>
              </div>
              <div>
                <p className="font-mono text-text-faint text-[length:var(--text-xs)] uppercase tracking-wider">Timeline</p>
                <p className="text-text text-[length:var(--text-sm)] mt-1">{activeLicense.timeline}</p>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Selected license callout */}
      {data.selectedLicense && (
        <div className="bg-green-50 border border-green-200 rounded-2xl p-5">
          <div className="flex items-center gap-3">
            <span className="text-green-600 text-[length:var(--text-sm)]">&#10003;</span>
            <div>
              <p className="text-text font-medium text-[length:var(--text-sm)]">{data.selectedLicense}</p>
              <p className="text-text-muted text-[length:var(--text-xs)]">
                {data.selectedLicense === data.recommendedLicense
                  ? 'This is the license our engine recommended for your activities.'
                  : 'You selected this license. The roadmap below applies to this license category.'}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Jurisdiction summary */}
      <div className="grid sm:grid-cols-4 gap-4">
        <div className="bg-bg-primary border border-border rounded-xl p-4">
          <p className="font-mono text-text-faint text-[length:var(--text-xs)] uppercase tracking-wider">Progress</p>
          <p className="font-mono text-gold font-bold text-[length:var(--text-lg)] mt-1">{completedCount}/{jurisdiction.steps.length}</p>
          <div className="mt-2 h-1.5 bg-bg-surface-2 rounded-full"><div className="h-full bg-gold rounded-full transition-all" style={{ width: `${progressPercent}%` }} /></div>
        </div>
        <div className="bg-bg-primary border border-border rounded-xl p-4">
          <p className="font-mono text-text-faint text-[length:var(--text-xs)] uppercase tracking-wider">Avg Timeline</p>
          <p className="text-text font-bold text-[length:var(--text-base)] mt-1">{jurisdiction.avgTimeline}</p>
        </div>
        <div className="bg-bg-primary border border-border rounded-xl p-4">
          <p className="font-mono text-text-faint text-[length:var(--text-xs)] uppercase tracking-wider">Min Capital</p>
          <p className="text-text font-bold text-[length:var(--text-base)] mt-1">{jurisdiction.minCapital}</p>
        </div>
        <div className="bg-bg-primary border border-border rounded-xl p-4">
          <p className="font-mono text-text-faint text-[length:var(--text-xs)] uppercase tracking-wider">Audit Cadence</p>
          <p className="text-text-muted text-[length:var(--text-xs)] mt-1 leading-relaxed">{jurisdiction.auditFrequency}</p>
        </div>
      </div>

      {/* Steps by category */}
      {categories.map((cat) => {
        const steps = jurisdiction.steps.filter((s) => s.category === cat)
        if (steps.length === 0) return null
        return (
          <div key={cat}>
            <h2 className="font-mono text-gold uppercase tracking-widest text-[length:var(--text-xs)] mb-4">{CATEGORY_LABELS[cat]}</h2>
            <div className="space-y-3">
              {steps.map((step) => (
                <StepCard
                  key={step.id}
                  step={step}
                  isDone={!!completed[step.id]}
                  isExpanded={expandedStep === step.id}
                  onToggleComplete={() => toggleStep(step.id)}
                  onToggleExpand={() => setExpandedStep(expandedStep === step.id ? null : step.id)}
                />
              ))}
            </div>
          </div>
        )
      })}

      {/* Key Regulatory Figures */}
      {figures.length > 0 && (
        <div>
          <h2 className="font-mono text-gold uppercase tracking-widest text-[length:var(--text-xs)] mb-4">Key Regulatory Figures</h2>
          <div className="grid sm:grid-cols-3 gap-4">
            {figures.map((figure) => (
              <div key={figure.initials} className="bg-bg-primary border border-border rounded-2xl p-5">
                <div className="w-12 h-12 rounded-full bg-gold/10 flex items-center justify-center mb-3">
                  <span className="font-mono text-gold font-bold text-[length:var(--text-sm)]">{figure.initials}</span>
                </div>
                <p className="font-display font-bold text-text text-[length:var(--text-sm)]">{figure.name}</p>
                <p className="text-gold text-[length:var(--text-xs)] font-medium mt-0.5">{figure.title}</p>
                <p className="font-mono text-text-faint text-[length:var(--text-xs)] mt-0.5">{figure.organization}</p>
                <p className="text-text-muted text-[length:var(--text-xs)] mt-2 leading-relaxed">{figure.relevance}</p>
              </div>
            ))}
          </div>
          <p className="text-text-faint text-[length:var(--text-xs)] mt-3">
            These are key regulatory figures you may interact with during your licensing journey.
          </p>
        </div>
      )}
    </div>
  )
}

function StepCard({ step, isDone, isExpanded, onToggleComplete, onToggleExpand }: {
  step: LicenseStep; isDone: boolean; isExpanded: boolean
  onToggleComplete: () => void; onToggleExpand: () => void
}) {
  return (
    <div className={`bg-bg-primary border rounded-2xl transition-all ${isDone ? 'border-gold/30 bg-gold-light/20' : 'border-border'}`}>
      <div className="p-5 flex items-start gap-4">
        <button
          onClick={onToggleComplete}
          className={`mt-0.5 w-6 h-6 rounded-lg border-2 flex items-center justify-center shrink-0 transition-all cursor-pointer ${
            isDone ? 'bg-gold border-gold text-white' : 'border-border hover:border-gold'
          }`}
          aria-label={`Mark step ${step.step} as ${isDone ? 'incomplete' : 'complete'}`}
        >
          {isDone && <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round"><polyline points="20 6 9 17 4 12" /></svg>}
        </button>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3">
            <span className="font-mono text-text-faint text-[length:var(--text-xs)]">{String(step.step).padStart(2, '0')}</span>
            <h3 className={`font-display font-bold text-[length:var(--text-base)] ${isDone ? 'text-text-muted line-through' : 'text-text'}`}>
              {step.title}
            </h3>
            <span className="font-mono text-text-faint text-[length:var(--text-xs)] hidden sm:inline">~{step.timeline}</span>
          </div>
          <p className={`mt-1.5 text-[length:var(--text-sm)] leading-relaxed ${isDone ? 'text-text-faint' : 'text-text-muted'}`}>
            {step.description}
          </p>

          {step.riskWarning && (
            <div className="mt-3 px-3 py-2 bg-red-50 border border-red-100 rounded-lg">
              <p className="text-red-700 text-[length:var(--text-xs)] leading-relaxed">
                <strong>Risk:</strong> {step.riskWarning}
              </p>
            </div>
          )}

          <button
            onClick={onToggleExpand}
            className="mt-3 text-gold text-[length:var(--text-xs)] hover:underline cursor-pointer"
          >
            {isExpanded ? 'Hide details \u2191' : 'Required documents & details \u2193'}
          </button>
        </div>
      </div>

      {isExpanded && (
        <div className="px-5 pb-5 pt-0 ml-10 border-t border-border mt-0 pt-4">
          <h4 className="font-display font-bold text-text text-[length:var(--text-xs)] uppercase tracking-wider mb-2">Required Documents</h4>
          <ul className="space-y-1.5">
            {step.documents.map((doc) => (
              <li key={doc} className="flex items-start gap-2 text-text-muted text-[length:var(--text-sm)]">
                <span className="text-gold mt-0.5 shrink-0">{'\u25C7'}</span>{doc}
              </li>
            ))}
          </ul>
          <p className="mt-3 text-text-faint text-[length:var(--text-xs)]">Estimated timeline: {step.timeline}</p>
        </div>
      )}
    </div>
  )
}
