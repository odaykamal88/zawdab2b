'use client'

import { useState, useEffect, useCallback } from 'react'
import { BrandName } from '@/components/ui/BrandName'
import { Button, LinkButton } from '@/components/ui/Button'
import { useOnboarding } from '@/lib/onboarding-context'
import {
  JURISDICTION_PROFILES,
  findBestJurisdiction,
  type JurisdictionProfile,
  type JurisdictionLicense,
} from '@/lib/jurisdiction-intelligence'

// ─────────────────────────────────────────────
// Result types
// ─────────────────────────────────────────────

interface ActiveResult {
  type: 'active'
  recommended: boolean
  licenseName: string
  jurisdiction: string
  confidence: number
  reasoning: { text: string; bold?: string }[]
  risks: { text: string; bold?: string }[]
  alternatives: { name: string; jurisdiction: string; flag: string; reason: string }[]
  estimatedTimeline: string
  estimatedCapital: string
  verdict: string
  additionalLicenses?: { name: string; capital: string; activities: string[] }[]
}

interface RedirectResult {
  type: 'redirect'
  profile: JurisdictionProfile
  recommendation: {
    jurisdictionId: string
    profile: JurisdictionProfile
    bestLicense: JurisdictionLicense
    matchScore: number
    reason: string
  }
  allAlternatives: {
    jurisdictionId: string
    profile: JurisdictionProfile
    bestLicense: JurisdictionLicense
    matchScore: number
    reason: string
  }[]
}

type AnalysisResult = ActiveResult | RedirectResult

// ─────────────────────────────────────────────
// Analysis engine
// ─────────────────────────────────────────────

/**
 * DEFENSE GUIDELINE: Principle 1 — This entire function must move to a server-side
 * API route before production. The jurisdiction mappings, license categories, capital
 * thresholds, and scoring logic are proprietary regulatory knowledge that must never
 * be exposed in client-side code. The frontend should call POST /api/recommendation
 * with onboarding data and receive only the result object.
 *
 * Principle 3: Integrate Chainalysis KYT data enrichment into the analysis.
 * Principle 4: Store every recommendation result for model improvement.
 * Principle 7: Arabic-language recommendation narratives must be server-generated.
 */
function analyzeBusinessForLicense(
  activities: string[],
  jurisdictionId: string,
  entityStatus: string,
  companyWebsite: string,
  licensingStage: string,
  companyName: string,
): AnalysisResult {
  const profile = JURISDICTION_PROFILES[jurisdictionId]

  // Unknown jurisdiction fallback
  if (!profile) {
    return {
      type: 'active',
      recommended: false,
      licenseName: 'Unknown Jurisdiction',
      jurisdiction: jurisdictionId,
      confidence: 0,
      reasoning: [{ text: 'This jurisdiction is not yet in our database. Contact us for a custom assessment.' }],
      risks: [],
      alternatives: [],
      estimatedTimeline: 'N/A',
      estimatedCapital: 'N/A',
      verdict: 'We cannot provide a recommendation for this jurisdiction yet. Book a consultation with our advisory team.',
    }
  }

  // ── NON-ACTIVE JURISDICTION → REDIRECT PATH ──
  if (profile.status !== 'active') {
    const alternatives = findBestJurisdiction(activities)
    const best = alternatives[0]

    if (!best) {
      // Edge case: no active jurisdiction matches their activities at all
      return {
        type: 'redirect',
        profile,
        recommendation: {
          jurisdictionId: 'vara',
          profile: JURISDICTION_PROFILES['vara'],
          bestLicense: JURISDICTION_PROFILES['vara'].licenses[0],
          matchScore: 0,
          reason: 'VARA has the most comprehensive licensing framework in MENA.',
        },
        allAlternatives: [],
      }
    }

    return {
      type: 'redirect',
      profile,
      recommendation: best,
      allAlternatives: alternatives.slice(1, 3),
    }
  }

  // ── ACTIVE JURISDICTION → LICENSE MATCHING PATH ──
  const matchedLicenses = profile.licenses
    .map((lic) => ({
      ...lic,
      matchScore: lic.activities.filter((a) => activities.includes(a)).length,
      matchedActivities: lic.activities.filter((a) => activities.includes(a)),
    }))
    .filter((lic) => lic.matchScore > 0)
    .sort((a, b) => b.matchScore - a.matchScore)

  const bestMatch = matchedLicenses[0]

  if (!bestMatch) {
    const altJurisdictions = findBestJurisdiction(activities, jurisdictionId)
    return {
      type: 'active',
      recommended: false,
      licenseName: 'No matching license',
      jurisdiction: profile.name,
      confidence: 85,
      reasoning: [
        { bold: 'No direct match.', text: ` Based on your selected activities (${activities.join(', ')}), there is no standard license category in ${profile.name} that directly covers your use case.` },
        { text: 'This does not mean you cannot operate — it may mean your activities fall under a different classification.' },
      ],
      risks: [
        { bold: 'Severe penalties.', text: ` Operating without the correct license in this jurisdiction carries significant fines per violation.` },
        { text: 'Consider whether your activities could be reclassified under an existing category.' },
      ],
      alternatives: altJurisdictions.slice(0, 2).map((a) => ({
        name: a.bestLicense.name,
        jurisdiction: a.profile.name,
        flag: a.profile.flag,
        reason: a.reason,
      })),
      estimatedTimeline: 'N/A',
      estimatedCapital: 'N/A',
      verdict: 'We recommend booking a consultation before proceeding. Your target activities may not fit neatly into this jurisdiction\'s framework.',
    }
  }

  const reasoning: { text: string; bold?: string }[] = []
  const risks: { text: string; bold?: string }[] = []

  // Entity readiness
  if (entityStatus === 'not-started') {
    reasoning.push({ bold: 'No entity yet.', text: ' You will need a registered entity in or connected to this jurisdiction before applying. Factor in 1–3 months for incorporation.' })
    risks.push({ bold: 'Timeline impact.', text: ' Incorporation adds 1–3 months before you can even submit a license application.' })
  } else if (entityStatus === 'in-progress') {
    reasoning.push({ bold: 'Entity in progress.', text: ' Ensure your incorporation is in a jurisdiction accepted by the regulator. Some entity types are not eligible.' })
  } else {
    reasoning.push({ bold: 'Entity established.', text: ' This is a prerequisite for licensing — you\'re ready to proceed.' })
  }

  // Activity match
  const unmatchedActivities = activities.filter((a) => !bestMatch.matchedActivities.includes(a))
  reasoning.push({ bold: `${bestMatch.name}`, text: ` covers: ${bestMatch.matchedActivities.join(', ')}.` })

  if (unmatchedActivities.length > 0) {
    reasoning.push({ bold: 'Additional licenses needed.', text: ` You will need separate license(s) for: ${unmatchedActivities.join(', ')}.` })
    risks.push({ bold: 'Scope violation risk.', text: ` Operating ${unmatchedActivities.join(' or ')} under the wrong license category is treated as unlicensed activity.` })
  }

  // Website analysis
  if (companyWebsite) {
    reasoning.push({ bold: 'Website analyzed.', text: ` We reviewed ${companyWebsite} for public-facing claims about virtual asset services.` })
    if (activities.includes('Exchange / Trading Platform') || activities.includes('Broker-Dealer')) {
      risks.push({ bold: 'Marketing before licensing.', text: ' If your website advertises trading or brokerage services before you hold a license, regulators can issue enforcement action.' })
    }
  }

  // Jurisdiction stance
  reasoning.push({ bold: `${profile.name} stance:`, text: ` ${profile.stance}` })

  // Capital
  reasoning.push({ bold: `Capital: ${bestMatch.capital}.`, text: ' Funds must be available and evidenced in a regulated bank account at the time of application.' })

  // Multi-license
  const additionalLicenses = matchedLicenses.length > 1
    ? matchedLicenses.slice(1).map((l) => ({ name: l.name, capital: l.capital, activities: l.matchedActivities }))
    : undefined

  if (matchedLicenses.length > 1) {
    reasoning.push({ bold: `${matchedLicenses.length} licenses required.`, text: ` ${profile.name} requires separate licenses per activity. Each has its own capital requirement and application process.` })
    const totalCapital = matchedLicenses.map((l) => l.capital).join(' + ')
    risks.push({ bold: 'Cumulative capital.', text: ` Multiple licenses mean multiple capital requirements: ${totalCapital}. Budget accordingly.` })
  }

  // Activity-specific advantages
  const advantageActivities = activities.filter((a) => profile.activityAdvantages?.[a])
  if (advantageActivities.length > 0) {
    advantageActivities.forEach((a) => {
      reasoning.push({ bold: `${a} advantage:`, text: ` ${profile.activityAdvantages![a]}` })
    })
  }

  // Known risks for this jurisdiction
  profile.risks.forEach((r) => {
    risks.push({ text: r })
  })

  // Stablecoin-specific warnings
  const hasStablecoin = activities.some((a) => a.includes('Stablecoin'))
  if (hasStablecoin) {
    reasoning.push({ bold: 'Stablecoin activities detected.', text: ' Stablecoin issuance and management are subject to the most stringent regulatory requirements in MENA — separate from standard VASP licensing.' })
    if (activities.includes('Stablecoin Issuance')) {
      risks.push({ bold: 'Reserve requirements.', text: ' Stablecoin issuers must maintain 1:1 fiat reserves in segregated accounts at regulated banks, with independent monthly attestation.' })
      risks.push({ bold: 'Central Bank jurisdiction.', text: ' In the UAE, stablecoin issuance may also fall under CBUAE oversight for AED-pegged tokens. Dual regulatory approval may be required.' })
    }
    if (activities.includes('Stablecoin Management')) {
      risks.push({ bold: 'Redemption obligations.', text: ' Stablecoin management requires on-demand redemption at par value. Failure to honor redemptions triggers immediate regulatory intervention.' })
    }
    reasoning.push({ bold: 'MiCA alignment.', text: ' MENA regulators are aligning stablecoin frameworks with EU MiCA standards. Expect additional requirements around reserve composition, governance, and operational resilience.' })
  }

  // Stage-specific
  if (licensingStage === 'licensed') {
    reasoning.push({ bold: 'Already licensed.', text: ' This recommendation is for expanding into additional activities or jurisdictions.' })
  } else if (licensingStage === 'application-in-progress') {
    reasoning.push({ bold: 'Application submitted.', text: ' Ensure your current application covers all your intended activities. Adding activities later requires a new application.' })
  }

  const confidence = bestMatch.matchScore >= 2 ? 92 : bestMatch.matchScore >= 1 ? 78 : 60
  const recommended = confidence >= 70 && (entityStatus !== 'not-started' || activities.length <= 2)

  const verdict = recommended
    ? `Based on ${companyName || 'your'}'s business profile and target activities, the ${bestMatch.name} in ${profile.name} is a strong fit. You can proceed with confidence — review the risks below before committing resources.`
    : `The ${bestMatch.name} in ${profile.name} covers some of your activities, but there are significant considerations. We strongly recommend consulting our advisory team before committing capital and time.`

  const altJurisdictions = findBestJurisdiction(activities, jurisdictionId)

  return {
    type: 'active',
    recommended,
    licenseName: bestMatch.name,
    jurisdiction: profile.name,
    confidence,
    reasoning,
    risks,
    alternatives: altJurisdictions.slice(0, 2).map((a) => ({
      name: a.bestLicense.name,
      jurisdiction: a.profile.name,
      flag: a.profile.flag,
      reason: a.reason,
    })),
    estimatedTimeline: bestMatch.timeline,
    estimatedCapital: bestMatch.capital,
    verdict,
    additionalLicenses,
  }
}

// ─────────────────────────────────────────────
// Scan steps — dynamic based on jurisdiction
// ─────────────────────────────────────────────

function getScanSteps(jurisdictionStatus: string) {
  if (jurisdictionStatus === 'active') {
    return [
      { label: 'Reviewing company profile', icon: '◻' },
      { label: 'Crawling website & public presence', icon: '◈' },
      { label: 'Matching against license categories', icon: '◇' },
      { label: 'Assessing regulatory risks', icon: '⚠' },
      { label: 'Generating recommendation', icon: '◉' },
    ]
  }
  return [
    { label: 'Reviewing company profile', icon: '◻' },
    { label: 'Crawling website & public presence', icon: '◈' },
    { label: 'Assessing jurisdiction regulatory stance', icon: '◇' },
    { label: 'Scoring alternative jurisdictions', icon: '⚠' },
    { label: 'Building your best path forward', icon: '◉' },
  ]
}

// ─────────────────────────────────────────────
// Component
// ─────────────────────────────────────────────

export default function RecommendationPage() {
  const { data, isLoaded, isComplete, update } = useOnboarding()
  const [phase, setPhase] = useState<'scanning' | 'analyzing' | 'result'>('scanning')
  const [scanProgress, setScanProgress] = useState(0)
  const [result, setResult] = useState<AnalysisResult | null>(null)
  const [showLicensePicker, setShowLicensePicker] = useState(false)
  const [confirmedLicense, setConfirmedLicense] = useState<string | null>(null)
  const [selectedAltJurisdiction, setSelectedAltJurisdiction] = useState<string | null>(null)

  const runAnalysis = useCallback(() => {
    setResult(
      analyzeBusinessForLicense(
        data.targetActivities,
        data.primaryJurisdiction,
        data.entityStatus,
        data.companyWebsite,
        data.licensingStage,
        data.companyName,
      )
    )
    setPhase('result')
  }, [data])

  useEffect(() => {
    if (!isLoaded || !isComplete) return
    const interval = setInterval(() => {
      setScanProgress((prev) => {
        if (prev >= 100) { clearInterval(interval); return 100 }
        return prev + 2
      })
    }, 80)
    return () => clearInterval(interval)
  }, [isLoaded, isComplete])

  useEffect(() => {
    if (scanProgress >= 40 && phase === 'scanning') setPhase('analyzing')
    if (scanProgress >= 100 && phase === 'analyzing') runAnalysis()
  }, [scanProgress, phase, runAnalysis])

  if (!isLoaded) return null
  if (!isComplete) {
    if (typeof window !== 'undefined') window.location.href = '/onboarding'
    return null
  }

  const profile = JURISDICTION_PROFILES[data.primaryJurisdiction]
  const jurisdictionFlag = profile?.flag ?? ''
  const jurisdictionName = profile?.name ?? data.primaryJurisdiction
  const jurisdictionStatus = profile?.status ?? 'none'
  const scanSteps = getScanSteps(jurisdictionStatus)

  const isNonActive = jurisdictionStatus !== 'active'
  const statusLabel = jurisdictionStatus === 'emerging' ? 'Emerging Framework' : jurisdictionStatus === 'hostile' ? 'Restricted' : jurisdictionStatus === 'none' ? 'No Framework' : 'Active'
  const statusColor = jurisdictionStatus === 'active' ? 'green' : jurisdictionStatus === 'emerging' ? 'amber' : 'red'

  return (
    <div className="min-h-screen bg-bg-primary flex flex-col">
      <header className="px-6 py-5 flex items-center justify-between border-b border-border">
        <a href="/"><BrandName className="font-display font-bold text-[length:var(--text-lg)] text-text" /></a>
        <a href="/dashboard" className="text-text-muted text-[length:var(--text-sm)] hover:text-gold transition-colors">
          Skip to Dashboard &rarr;
        </a>
      </header>

      <div className="flex-1 flex items-start justify-center p-6 sm:p-12 overflow-y-auto">
        <div className="w-full max-w-2xl">

          {/* ━━━ Scanning / Analyzing Phase ━━━ */}
          {phase !== 'result' && (
            <div>
              <div className="text-center mb-10">
                <p className="font-mono text-gold uppercase tracking-widest text-[length:var(--text-xs)] mb-3">
                  {isNonActive ? 'Jurisdiction Assessment Engine' : 'License Recommendation Engine'}
                </p>
                <h2 className="font-display font-bold text-text text-[length:var(--text-xl)] mb-2">
                  {phase === 'scanning'
                    ? (isNonActive ? 'Assessing regulatory landscape...' : 'Scanning your business profile...')
                    : (isNonActive ? 'Finding your best path forward...' : 'Analyzing regulatory fit...')}
                </h2>
                <p className="text-text-muted text-[length:var(--text-sm)] max-w-md mx-auto">
                  {phase === 'scanning'
                    ? <>Reviewing <strong className="text-text">{data.companyName || 'your company'}</strong>{data.companyWebsite ? <>, crawling <strong className="text-text">{data.companyWebsite}</strong></> : null}, and {isNonActive ? <>assessing the regulatory stance of <strong className="text-text">{jurisdictionName}</strong></> : <>matching against <strong className="text-text">{jurisdictionName}</strong> requirements</>}.</>
                    : isNonActive
                      ? <>Scoring <strong className="text-text">{data.targetActivities.length} activities</strong> against all active MENA jurisdictions to find the best licensing path for {data.companyName || 'your business'}.</>
                      : <>Cross-referencing <strong className="text-text">{data.targetActivities.length} activities</strong> against {jurisdictionFlag} {jurisdictionName} license categories, capital thresholds, and hidden compliance risks.</>}
                </p>
              </div>

              {/* Progress bar */}
              <div className="max-w-md mx-auto mb-10">
                <div className="h-2 bg-bg-surface-2 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gold rounded-full transition-all duration-300 ease-out"
                    style={{ width: `${scanProgress}%` }}
                  />
                </div>
                <p className="font-mono text-text-faint text-[length:var(--text-xs)] mt-2 text-center">{scanProgress}%</p>
              </div>

              {/* Scan steps */}
              <div className="bg-bg-surface border border-border rounded-2xl p-6 max-w-md mx-auto">
                <div className="space-y-4">
                  {scanSteps.map((item, i) => {
                    const threshold = (i + 1) * 20
                    const done = scanProgress >= threshold
                    const active = scanProgress >= threshold - 20 && scanProgress < threshold
                    return (
                      <div key={item.label} className="flex items-center gap-3">
                        <span className={`w-7 h-7 rounded-lg flex items-center justify-center text-[length:var(--text-xs)] font-mono transition-all ${
                          done ? 'bg-green-100 text-green-600' : active ? 'bg-gold/10 text-gold' : 'bg-bg-surface-2 text-text-faint'
                        }`}>
                          {done ? '\u2713' : item.icon}
                        </span>
                        <span className={`text-[length:var(--text-sm)] transition-colors ${done ? 'text-text font-medium' : active ? 'text-text' : 'text-text-faint'}`}>
                          {item.label}
                        </span>
                        {active && (
                          <span className="ml-auto text-gold text-[length:var(--text-xs)] font-mono animate-pulse">running</span>
                        )}
                      </div>
                    )
                  })}
                </div>
              </div>

              {/* Context card during scan */}
              {phase === 'analyzing' && (
                <div className="mt-6 bg-gold/5 border border-gold/20 rounded-2xl p-5 max-w-md mx-auto">
                  <p className="text-text text-[length:var(--text-xs)] leading-relaxed">
                    {isNonActive
                      ? <><strong>What we&apos;re checking:</strong> {jurisdictionFlag} {jurisdictionName}&apos;s regulatory stance, legal risks of operating there, and which active MENA jurisdiction best matches your {data.targetActivities.length} activities based on capital efficiency, timeline, and activity-specific advantages.</>
                      : <><strong>What we&apos;re checking:</strong> License category eligibility, minimum capital adequacy, entity structure requirements, public marketing compliance, and known enforcement patterns for {jurisdictionName}.</>}
                  </p>
                </div>
              )}
            </div>
          )}

          {/* ━━━ RESULT: Active Jurisdiction ━━━ */}
          {phase === 'result' && result && result.type === 'active' && (
            <div>
              <p className="font-mono text-gold uppercase tracking-widest text-[length:var(--text-xs)] mb-3">
                License Recommendation
              </p>
              <h2 className="font-display font-bold text-text text-[length:var(--text-xl)] mb-1">
                {result.recommended ? 'We have a recommendation for you.' : 'Proceed with caution.'}
              </h2>
              <p className="text-text-muted text-[length:var(--text-sm)] mb-6">
                Analysis for <strong className="text-text">{data.companyName}</strong> targeting <strong className="text-text">{result.jurisdiction}</strong>
              </p>

              {/* Main recommendation card */}
              <div className={`border-2 rounded-2xl overflow-hidden ${
                result.recommended ? 'border-green-300' : 'border-amber-300'
              }`}>
                <div className={`px-6 py-4 ${result.recommended ? 'bg-green-600' : 'bg-amber-500'}`}>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-white/80 text-[length:var(--text-xs)] font-bold uppercase tracking-wide">
                        {result.recommended ? 'Recommended License' : 'Caution Advised'}
                      </p>
                      <h3 className="font-display font-bold text-white text-[length:var(--text-base)] mt-0.5">
                        {result.licenseName}
                      </h3>
                    </div>
                    <div className="text-right">
                      <p className="text-white/60 text-[length:var(--text-xs)] font-mono">Confidence</p>
                      <p className="font-mono font-bold text-white text-[length:var(--text-lg)]">
                        {result.confidence}%
                      </p>
                    </div>
                  </div>
                </div>
                <div className={`px-6 py-5 ${result.recommended ? 'bg-green-50' : 'bg-amber-50'}`}>
                  <p className="text-text text-[length:var(--text-sm)] leading-relaxed">{result.verdict}</p>
                  <div className="grid sm:grid-cols-2 gap-4 mt-5 pt-4 border-t border-border/20">
                    <div>
                      <p className="font-mono text-text-faint text-[length:var(--text-xs)] uppercase">Est. Timeline</p>
                      <p className="text-text font-bold text-[length:var(--text-sm)] mt-0.5">{result.estimatedTimeline}</p>
                    </div>
                    <div>
                      <p className="font-mono text-text-faint text-[length:var(--text-xs)] uppercase">Min. Capital Required</p>
                      <p className="text-text font-bold text-[length:var(--text-sm)] mt-0.5">{result.estimatedCapital}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Additional licenses needed */}
              {result.additionalLicenses && result.additionalLicenses.length > 0 && (
                <div className="mt-4 bg-amber-50 border border-amber-200 rounded-2xl p-5">
                  <h3 className="font-display font-bold text-amber-800 text-[length:var(--text-sm)] mb-3">
                    Additional Licenses Required
                  </h3>
                  <div className="space-y-2">
                    {result.additionalLicenses.map((lic, i) => (
                      <div key={i} className="flex items-center justify-between bg-white/60 rounded-xl px-4 py-3">
                        <div>
                          <p className="text-text font-medium text-[length:var(--text-sm)]">{lic.name}</p>
                          <p className="text-text-faint text-[length:var(--text-xs)]">For: {lic.activities.join(', ')}</p>
                        </div>
                        <p className="font-mono text-amber-700 font-bold text-[length:var(--text-sm)]">{lic.capital}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Analysis breakdown */}
              <div className="mt-5 bg-bg-surface border border-border rounded-2xl p-6">
                <h3 className="font-display font-bold text-text text-[length:var(--text-sm)] mb-4">Analysis Breakdown</h3>
                <ul className="space-y-3">
                  {result.reasoning.map((r, i) => (
                    <li key={i} className="flex items-start gap-2.5 text-[length:var(--text-sm)] text-text-muted leading-relaxed">
                      <span className="text-gold mt-0.5 shrink-0 text-[length:var(--text-xs)]">&#9679;</span>
                      <span>{r.bold && <strong className="text-text">{r.bold}</strong>}{r.text}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Risks */}
              {result.risks.length > 0 && (
                <div className="mt-4 bg-red-50 border border-red-200 rounded-2xl p-6">
                  <h3 className="font-display font-bold text-red-700 text-[length:var(--text-sm)] mb-4">Risks to Consider</h3>
                  <ul className="space-y-3">
                    {result.risks.map((r, i) => (
                      <li key={i} className="flex items-start gap-2.5 text-[length:var(--text-sm)] text-red-700/80 leading-relaxed">
                        <span className="text-red-500 mt-0.5 shrink-0 text-[length:var(--text-xs)]">&#9650;</span>
                        <span>{r.bold && <strong className="text-red-700">{r.bold}</strong>}{r.text}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Alternatives — clickable to select as license path */}
              {result.alternatives.length > 0 && (
                <div className="mt-4 bg-bg-surface border border-border rounded-2xl p-6">
                  <h3 className="font-display font-bold text-text text-[length:var(--text-sm)] mb-1">Alternative Jurisdictions</h3>
                  <p className="text-text-muted text-[length:var(--text-xs)] mb-3">Click to select as your licensing path instead.</p>
                  <div className="grid sm:grid-cols-2 gap-3">
                    {result.alternatives.map((alt, i) => {
                      const isSelected = selectedAltJurisdiction === alt.jurisdiction
                      return (
                        <button
                          key={i}
                          onClick={() => {
                            setSelectedAltJurisdiction(alt.jurisdiction)
                            setConfirmedLicense(null)
                            setShowLicensePicker(false)
                          }}
                          className={`p-4 rounded-xl border text-left transition-all cursor-pointer ${
                            isSelected ? 'border-gold bg-gold-light' : 'bg-bg-primary border-border hover:border-gold'
                          }`}
                        >
                          <p className="text-text font-medium text-[length:var(--text-sm)]">{alt.flag} {alt.name}</p>
                          <p className="text-text-faint text-[length:var(--text-xs)] mt-0.5">{alt.jurisdiction}</p>
                          <p className="text-gold text-[length:var(--text-xs)] mt-1 font-medium">{alt.reason}</p>
                          {isSelected && <p className="text-green-600 text-[length:var(--text-xs)] mt-1 font-bold">&#10003; Selected — confirm below</p>}
                        </button>
                      )
                    })}
                  </div>
                </div>
              )}

              {/* ── License Confirmation ── */}
              {(() => {
                // Determine which jurisdiction's licenses to show
                const altProfile = selectedAltJurisdiction
                  ? Object.values(JURISDICTION_PROFILES).find((p) => p.name === selectedAltJurisdiction)
                  : null
                const confirmProfile = altProfile || profile
                const confirmJurisdictionId = altProfile?.id || data.primaryJurisdiction
                const confirmJurisdictionName = altProfile?.name || result.jurisdiction

                return (
              <div className="mt-6 bg-bg-surface border border-border rounded-2xl p-6">
                <h3 className="font-display font-bold text-text text-[length:var(--text-sm)] mb-2">
                  {confirmedLicense ? 'License confirmed' : `Confirm your license path${selectedAltJurisdiction ? ` — ${selectedAltJurisdiction}` : ''}`}
                </h3>
                <p className="text-text-muted text-[length:var(--text-xs)] mb-4">
                  {confirmedLicense
                    ? `Your dashboard and licensing roadmap will be tailored to this license in ${confirmJurisdictionName}.`
                    : selectedAltJurisdiction
                      ? `Select a license from ${selectedAltJurisdiction}, or go back to the original recommendation.`
                      : 'Accept our recommendation or select a different license from this jurisdiction.'}
                </p>

                {!confirmedLicense && !showLicensePicker && !selectedAltJurisdiction && (
                  <div className="flex flex-col sm:flex-row gap-3">
                    <Button
                      variant="primary"
                      onClick={() => {
                        setConfirmedLicense(result.licenseName)
                        update({
                          recommendedLicense: result.licenseName,
                          selectedLicense: result.licenseName,
                          recommendedJurisdiction: data.primaryJurisdiction,
                        })
                      }}
                      className="flex-1 text-[length:var(--text-sm)]"
                    >
                      Accept: {result.licenseName}
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => setShowLicensePicker(true)}
                      className="flex-1 text-[length:var(--text-sm)]"
                    >
                      Choose a different license
                    </Button>
                  </div>
                )}

                {(showLicensePicker || selectedAltJurisdiction) && !confirmedLicense && confirmProfile && (
                  <div className="space-y-2">
                    {confirmProfile.licenses.map((lic) => (
                      <button
                        key={lic.name}
                        onClick={() => {
                          setConfirmedLicense(lic.name)
                          setShowLicensePicker(false)
                          setSelectedAltJurisdiction(null)
                          update({
                            recommendedLicense: result.licenseName,
                            selectedLicense: lic.name,
                            recommendedJurisdiction: confirmJurisdictionId,
                            primaryJurisdiction: confirmJurisdictionId,
                          })
                        }}
                        className={`w-full text-left px-4 py-3 rounded-xl border transition-all cursor-pointer ${
                          !selectedAltJurisdiction && lic.name === result.licenseName
                            ? 'border-gold bg-gold-light'
                            : 'border-border bg-bg-primary hover:border-gold'
                        }`}
                      >
                        <span className="text-text font-medium text-[length:var(--text-sm)]">{lic.name}</span>
                        {!selectedAltJurisdiction && lic.name === result.licenseName && (
                          <span className="ml-2 text-gold text-[length:var(--text-xs)]">Recommended</span>
                        )}
                        <span className="block text-text-faint text-[length:var(--text-xs)] mt-0.5">
                          {lic.activities.join(', ')} &middot; {lic.capital} &middot; {lic.timeline}
                        </span>
                      </button>
                    ))}
                    <button
                      onClick={() => { setShowLicensePicker(false); setSelectedAltJurisdiction(null) }}
                      className="text-text-muted text-[length:var(--text-xs)] mt-2 hover:text-text cursor-pointer"
                    >
                      Back to recommendation
                    </button>
                  </div>
                )}

                {confirmedLicense && (
                  <div className="flex items-center gap-3 px-4 py-3 bg-green-50 border border-green-200 rounded-xl">
                    <span className="text-green-600 text-[length:var(--text-sm)]">&#10003;</span>
                    <span className="text-text font-medium text-[length:var(--text-sm)]">{confirmedLicense}</span>
                    <button
                      onClick={() => { setConfirmedLicense(null); setShowLicensePicker(true) }}
                      className="ml-auto text-text-muted text-[length:var(--text-xs)] hover:text-text cursor-pointer"
                    >
                      Change
                    </button>
                  </div>
                )}
              </div>
                )
              })()}

              {/* ── Add More Jurisdictions ── */}
              {(() => {
                const allSelected = [data.primaryJurisdiction, ...data.additionalJurisdictions].filter(Boolean)
                const activeJurisdictions = Object.entries(JURISDICTION_PROFILES)
                  .filter(([, p]) => p.status === 'active')
                  .filter(([id]) => !allSelected.includes(id))
                function addJurisdiction(id: string) {
                  update({ additionalJurisdictions: [...data.additionalJurisdictions, id] })
                }
                function removeJurisdiction(id: string) {
                  if (id === data.primaryJurisdiction) {
                    const remaining = data.additionalJurisdictions
                    update({ primaryJurisdiction: remaining[0] || '', additionalJurisdictions: remaining.slice(1) })
                  } else {
                    update({ additionalJurisdictions: data.additionalJurisdictions.filter((j: string) => j !== id) })
                  }
                }
                return (
                  <div className="mt-6 bg-bg-surface border border-border rounded-2xl p-6">
                    <h3 className="font-display font-bold text-text text-[length:var(--text-sm)] mb-1">Interested in multiple jurisdictions?</h3>
                    <p className="text-text-muted text-[length:var(--text-xs)] mb-4">
                      Add more jurisdictions to track them side-by-side in your dashboard. You can switch between them at any time.
                    </p>

                    {/* Currently selected */}
                    {allSelected.length > 0 && (
                      <div className="flex flex-wrap gap-2 mb-3">
                        {allSelected.map((id) => {
                          const p = JURISDICTION_PROFILES[id]
                          if (!p) return null
                          return (
                            <span key={id} className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gold-light border border-gold/20 rounded-lg text-[length:var(--text-xs)] font-medium text-text">
                              {p.flag} {p.name}
                              {allSelected.length > 1 && (
                                <button
                                  onClick={() => removeJurisdiction(id)}
                                  className="text-text-faint hover:text-red-500 transition-colors cursor-pointer ml-0.5"
                                  title={`Remove ${p.name}`}
                                >
                                  &#10005;
                                </button>
                              )}
                            </span>
                          )
                        })}
                      </div>
                    )}

                    {/* Available to add */}
                    {activeJurisdictions.length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {activeJurisdictions.map(([id, p]) => (
                          <button
                            key={id}
                            onClick={() => addJurisdiction(id)}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-bg-primary border border-border rounded-lg text-[length:var(--text-xs)] text-text-muted hover:border-gold hover:text-text transition-all cursor-pointer"
                          >
                            <span className="text-gold">+</span> {p.flag} {p.name}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                )
              })()}

              {/* Actions */}
              <div className="mt-6 flex flex-col sm:flex-row gap-3">
                <LinkButton href="/dashboard" variant="primary" className="flex-1 text-center text-[length:var(--text-sm)]">
                  Continue to Dashboard &rarr;
                </LinkButton>
                <Button
                  variant="outline"
                  onClick={() => { setScanProgress(0); setPhase('scanning'); setResult(null); setConfirmedLicense(null); setShowLicensePicker(false) }}
                  className="flex-1 text-[length:var(--text-sm)]"
                >
                  Re-run Analysis
                </Button>
              </div>

              <p className="text-text-faint text-[length:var(--text-xs)] mt-5 text-center leading-relaxed">
                This recommendation is based on your profile data and publicly available regulatory information.
                It does not constitute legal advice. For formal guidance, consult a licensed advisor.
              </p>
            </div>
          )}

          {/* ━━━ RESULT: Non-Active Jurisdiction (Redirect) ━━━ */}
          {phase === 'result' && result && result.type === 'redirect' && (
            <div>
              <p className="font-mono text-gold uppercase tracking-widest text-[length:var(--text-xs)] mb-3">
                Jurisdiction Assessment
              </p>
              <h2 className="font-display font-bold text-text text-[length:var(--text-xl)] mb-1">
                We need to talk about {result.profile.flag} {result.profile.name}.
              </h2>
              <p className="text-text-muted text-[length:var(--text-sm)] mb-6">
                Regulatory assessment for <strong className="text-text">{data.companyName}</strong>
              </p>

              {/* ── Jurisdiction Stance Card ── */}
              <div className={`border-2 rounded-2xl overflow-hidden ${
                statusColor === 'red' ? 'border-red-300' : 'border-amber-300'
              }`}>
                <div className={`px-6 py-4 ${statusColor === 'red' ? 'bg-red-600' : 'bg-amber-500'}`}>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-white/80 text-[length:var(--text-xs)] font-bold uppercase tracking-wide">
                        {result.profile.flag} {result.profile.regulator}
                      </p>
                      <h3 className="font-display font-bold text-white text-[length:var(--text-base)] mt-0.5">
                        {result.profile.stance}
                      </h3>
                    </div>
                    <div className={`px-3 py-1.5 rounded-lg ${statusColor === 'red' ? 'bg-red-800/40' : 'bg-amber-700/40'}`}>
                      <p className="text-white font-mono font-bold text-[length:var(--text-xs)]">
                        {statusLabel}
                      </p>
                    </div>
                  </div>
                </div>
                <div className={`px-6 py-5 ${statusColor === 'red' ? 'bg-red-50' : 'bg-amber-50'}`}>
                  <p className="text-text text-[length:var(--text-sm)] leading-relaxed">
                    {result.profile.stanceDetail}
                  </p>
                </div>
              </div>

              {/* ── Risks for this jurisdiction ── */}
              {result.profile.risks.length > 0 && (
                <div className="mt-4 bg-red-50 border border-red-200 rounded-2xl p-6">
                  <h3 className="font-display font-bold text-red-700 text-[length:var(--text-sm)] mb-4">
                    Why you cannot operate from {result.profile.name}
                  </h3>
                  <ul className="space-y-3">
                    {result.profile.risks.map((r, i) => (
                      <li key={i} className="flex items-start gap-2.5 text-[length:var(--text-sm)] text-red-700/80 leading-relaxed">
                        <span className="text-red-500 mt-0.5 shrink-0 text-[length:var(--text-xs)]">&#9650;</span>
                        <span>{r}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* ── What It Would Take ── */}
              {result.profile.whatItWouldTake && (
                <div className="mt-4 bg-bg-surface border border-border rounded-2xl p-6">
                  <h3 className="font-display font-bold text-text text-[length:var(--text-sm)] mb-3">
                    What it would take for {result.profile.name} to become viable
                  </h3>
                  <p className="text-text-muted text-[length:var(--text-sm)] leading-relaxed">
                    {result.profile.whatItWouldTake}
                  </p>
                </div>
              )}

              {/* ── Activities that are worst for this jurisdiction ── */}
              {result.profile.worstFor.length > 0 && (
                <div className="mt-4 bg-bg-surface border border-border rounded-2xl p-6">
                  <h3 className="font-display font-bold text-text text-[length:var(--text-sm)] mb-3">
                    Your activities vs. this jurisdiction
                  </h3>
                  <div className="space-y-2">
                    {data.targetActivities.map((activity) => {
                      const isBlocked = result.profile.worstFor.includes(activity)
                      return (
                        <div key={activity} className="flex items-center gap-3">
                          <span className={`w-6 h-6 rounded-md flex items-center justify-center text-[length:var(--text-xs)] ${
                            isBlocked ? 'bg-red-100 text-red-600' : 'bg-amber-100 text-amber-600'
                          }`}>
                            {isBlocked ? '✕' : '?'}
                          </span>
                          <span className="text-text text-[length:var(--text-sm)]">{activity}</span>
                          {isBlocked && (
                            <span className="text-red-500 text-[length:var(--text-xs)] font-mono ml-auto">Not possible</span>
                          )}
                        </div>
                      )
                    })}
                  </div>
                </div>
              )}

              {/* ══════════════════════════════════════════════ */}
              {/* ── OUR RECOMMENDATION — THE BEST PATH FORWARD */}
              {/* ══════════════════════════════════════════════ */}
              <div className="mt-8 mb-2">
                <p className="font-mono text-gold uppercase tracking-widest text-[length:var(--text-xs)] mb-3">
                  Your best path forward
                </p>
                <h2 className="font-display font-bold text-text text-[length:var(--text-lg)] mb-1">
                  We recommend {result.recommendation.profile.flag} {result.recommendation.profile.name} for {data.companyName || 'your business'}.
                </h2>
                <p className="text-text-muted text-[length:var(--text-sm)] mb-5">
                  Based on your {data.targetActivities.length} target activities, scored against all active MENA licensing frameworks.
                </p>
              </div>

              {/* Recommended jurisdiction card */}
              <div className="border-2 border-green-300 rounded-2xl overflow-hidden">
                <div className="bg-green-600 px-6 py-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-white/80 text-[length:var(--text-xs)] font-bold uppercase tracking-wide">
                        Recommended License
                      </p>
                      <h3 className="font-display font-bold text-white text-[length:var(--text-base)] mt-0.5">
                        {result.recommendation.bestLicense.name}
                      </h3>
                      <p className="text-white/70 text-[length:var(--text-xs)] mt-1">
                        {result.recommendation.profile.flag} {result.recommendation.profile.name} — {result.recommendation.profile.regulator}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-white/60 text-[length:var(--text-xs)] font-mono">Match Score</p>
                      <p className="font-mono font-bold text-white text-[length:var(--text-lg)]">
                        {Math.min(Math.round((result.recommendation.matchScore / 6) * 100), 98)}%
                      </p>
                    </div>
                  </div>
                </div>
                <div className="bg-green-50 px-6 py-5">
                  <p className="text-text text-[length:var(--text-sm)] leading-relaxed font-medium mb-3">
                    {result.recommendation.reason}
                  </p>
                  <p className="text-text-muted text-[length:var(--text-sm)] leading-relaxed">
                    {result.recommendation.profile.stanceDetail}
                  </p>
                  <div className="grid sm:grid-cols-2 gap-4 mt-5 pt-4 border-t border-border/20">
                    <div>
                      <p className="font-mono text-text-faint text-[length:var(--text-xs)] uppercase">Est. Timeline</p>
                      <p className="text-text font-bold text-[length:var(--text-sm)] mt-0.5">{result.recommendation.bestLicense.timeline}</p>
                    </div>
                    <div>
                      <p className="font-mono text-text-faint text-[length:var(--text-xs)] uppercase">Min. Capital Required</p>
                      <p className="text-text font-bold text-[length:var(--text-sm)] mt-0.5">{result.recommendation.bestLicense.capital}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Why this jurisdiction */}
              <div className="mt-4 bg-bg-surface border border-border rounded-2xl p-6">
                <h3 className="font-display font-bold text-text text-[length:var(--text-sm)] mb-4">
                  Why {result.recommendation.profile.name} for your activities
                </h3>
                <ul className="space-y-3">
                  {data.targetActivities.map((activity) => {
                    const advantage = result.recommendation.profile.activityAdvantages?.[activity]
                    const isBestFor = result.recommendation.profile.bestFor.includes(activity)
                    const matchingLicense = result.recommendation.profile.licenses.find((l) => l.activities.includes(activity))
                    return (
                      <li key={activity} className="flex items-start gap-2.5 text-[length:var(--text-sm)] text-text-muted leading-relaxed">
                        <span className={`mt-0.5 shrink-0 text-[length:var(--text-xs)] ${isBestFor ? 'text-green-500' : 'text-gold'}`}>
                          {isBestFor ? '★' : '●'}
                        </span>
                        <span>
                          <strong className="text-text">{activity}:</strong>{' '}
                          {advantage
                            ? advantage
                            : matchingLicense
                              ? `Covered by ${matchingLicense.name} (${matchingLicense.capital}).`
                              : 'May require additional regulatory guidance.'}
                        </span>
                      </li>
                    )
                  })}
                </ul>
              </div>

              {/* Known risks of recommended jurisdiction */}
              {result.recommendation.profile.risks.length > 0 && (
                <div className="mt-4 bg-amber-50 border border-amber-200 rounded-2xl p-6">
                  <h3 className="font-display font-bold text-amber-800 text-[length:var(--text-sm)] mb-4">
                    Risks to consider with {result.recommendation.profile.name}
                  </h3>
                  <ul className="space-y-3">
                    {result.recommendation.profile.risks.map((r, i) => (
                      <li key={i} className="flex items-start gap-2.5 text-[length:var(--text-sm)] text-amber-700/80 leading-relaxed">
                        <span className="text-amber-500 mt-0.5 shrink-0 text-[length:var(--text-xs)]">&#9650;</span>
                        <span>{r}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Other alternatives */}
              {result.allAlternatives.length > 0 && (
                <div className="mt-4 bg-bg-surface border border-border rounded-2xl p-6">
                  <h3 className="font-display font-bold text-text text-[length:var(--text-sm)] mb-3">Other options</h3>
                  <div className="grid sm:grid-cols-2 gap-3">
                    {result.allAlternatives.map((alt, i) => (
                      <div key={i} className="p-4 bg-bg-primary rounded-xl border border-border">
                        <p className="text-text font-medium text-[length:var(--text-sm)]">{alt.profile.flag} {alt.bestLicense.name}</p>
                        <p className="text-text-faint text-[length:var(--text-xs)] mt-0.5">{alt.profile.name}</p>
                        <p className="text-gold text-[length:var(--text-xs)] mt-1 font-medium">{alt.reason}</p>
                        <p className="text-text-faint text-[length:var(--text-xs)] mt-1 font-mono">{alt.bestLicense.capital} · {alt.bestLicense.timeline}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* ── Accept recommended jurisdiction + license ── */}
              <div className="mt-6 bg-bg-surface border border-border rounded-2xl p-6">
                <h3 className="font-display font-bold text-text text-[length:var(--text-sm)] mb-2">
                  {confirmedLicense ? 'Path confirmed' : 'Accept this recommendation?'}
                </h3>
                <p className="text-text-muted text-[length:var(--text-xs)] mb-4">
                  {confirmedLicense
                    ? `Your dashboard will be set up for ${result.recommendation.profile.name} — ${confirmedLicense}.`
                    : `We recommend licensing in ${result.recommendation.profile.name}. Your dashboard and roadmap will be tailored to this jurisdiction.`}
                </p>

                {!confirmedLicense && (
                  <div className="flex flex-col sm:flex-row gap-3">
                    <Button
                      variant="primary"
                      onClick={() => {
                        const lic = result.recommendation.bestLicense.name
                        setConfirmedLicense(lic)
                        update({
                          recommendedLicense: lic,
                          selectedLicense: lic,
                          recommendedJurisdiction: result.recommendation.jurisdictionId,
                          primaryJurisdiction: result.recommendation.jurisdictionId,
                        })
                      }}
                      className="flex-1 text-[length:var(--text-sm)]"
                    >
                      Accept: {result.recommendation.bestLicense.name}
                    </Button>
                  </div>
                )}

                {confirmedLicense && (
                  <div className="flex items-center gap-3 px-4 py-3 bg-green-50 border border-green-200 rounded-xl">
                    <span className="text-green-600 text-[length:var(--text-sm)]">&#10003;</span>
                    <div>
                      <span className="text-text font-medium text-[length:var(--text-sm)]">{confirmedLicense}</span>
                      <span className="block text-text-faint text-[length:var(--text-xs)]">{result.recommendation.profile.flag} {result.recommendation.profile.name}</span>
                    </div>
                  </div>
                )}
              </div>

              {/* ── Add More Jurisdictions ── */}
              {(() => {
                const allSelected = [data.primaryJurisdiction, ...data.additionalJurisdictions].filter(Boolean)
                const activeJurisdictions = Object.entries(JURISDICTION_PROFILES)
                  .filter(([, p]) => p.status === 'active')
                  .filter(([id]) => !allSelected.includes(id))
                function addJurisdiction(id: string) {
                  update({ additionalJurisdictions: [...data.additionalJurisdictions, id] })
                }
                function removeJurisdiction(id: string) {
                  if (id === data.primaryJurisdiction) {
                    const remaining = data.additionalJurisdictions
                    update({ primaryJurisdiction: remaining[0] || '', additionalJurisdictions: remaining.slice(1) })
                  } else {
                    update({ additionalJurisdictions: data.additionalJurisdictions.filter((j: string) => j !== id) })
                  }
                }
                return (
                  <div className="mt-6 bg-bg-surface border border-border rounded-2xl p-6">
                    <h3 className="font-display font-bold text-text text-[length:var(--text-sm)] mb-1">Interested in multiple jurisdictions?</h3>
                    <p className="text-text-muted text-[length:var(--text-xs)] mb-4">
                      Add more jurisdictions to track them side-by-side in your dashboard.
                    </p>
                    {allSelected.length > 0 && (
                      <div className="flex flex-wrap gap-2 mb-3">
                        {allSelected.map((id) => {
                          const p = JURISDICTION_PROFILES[id]
                          if (!p) return null
                          return (
                            <span key={id} className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gold-light border border-gold/20 rounded-lg text-[length:var(--text-xs)] font-medium text-text">
                              {p.flag} {p.name}
                              {allSelected.length > 1 && (
                                <button onClick={() => removeJurisdiction(id)} className="text-text-faint hover:text-red-500 transition-colors cursor-pointer ml-0.5" title={`Remove ${p.name}`}>&#10005;</button>
                              )}
                            </span>
                          )
                        })}
                      </div>
                    )}
                    {activeJurisdictions.length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {activeJurisdictions.map(([id, p]) => (
                          <button key={id} onClick={() => addJurisdiction(id)} className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-bg-primary border border-border rounded-lg text-[length:var(--text-xs)] text-text-muted hover:border-gold hover:text-text transition-all cursor-pointer">
                            <span className="text-gold">+</span> {p.flag} {p.name}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                )
              })()}

              {/* Actions */}
              <div className="mt-6 flex flex-col sm:flex-row gap-3">
                <LinkButton href="/dashboard" variant="primary" className="flex-1 text-center text-[length:var(--text-sm)]">
                  Continue to Dashboard &rarr;
                </LinkButton>
                <Button
                  variant="outline"
                  onClick={() => { setScanProgress(0); setPhase('scanning'); setResult(null); setConfirmedLicense(null); setShowLicensePicker(false) }}
                  className="flex-1 text-[length:var(--text-sm)]"
                >
                  Re-run Analysis
                </Button>
              </div>

              <p className="text-text-faint text-[length:var(--text-xs)] mt-5 text-center leading-relaxed">
                This assessment is based on your profile data and publicly available regulatory information.
                It does not constitute legal advice. For formal guidance, consult a licensed advisor.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
