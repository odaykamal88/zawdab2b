'use client'

import { useState, useMemo } from 'react'
import { BrandName } from '@/components/ui/BrandName'
import { BrandMark } from '@/components/ui/BrandMark'
import { Button } from '@/components/ui/Button'
import { useOnboarding } from '@/lib/onboarding-context'

function extractDomain(url: string): string {
  try {
    const hostname = new URL(url.startsWith('http') ? url : `https://${url}`).hostname
    return hostname.replace(/^www\./, '')
  } catch {
    return ''
  }
}

function emailMatchesDomain(email: string, website: string): boolean {
  if (!email || !website) return true // no validation if either is empty
  const emailDomain = email.split('@')[1]?.toLowerCase()
  const siteDomain = extractDomain(website).toLowerCase()
  if (!emailDomain || !siteDomain) return true
  return emailDomain === siteDomain || emailDomain.endsWith(`.${siteDomain}`) || siteDomain.endsWith(`.${emailDomain}`)
}

const JURISDICTIONS = [
  // Active licensing frameworks
  { id: 'vara', label: 'UAE — VARA (Dubai)', flag: '🇦🇪', group: 'Licensed' },
  { id: 'adgm', label: 'UAE — ADGM (Abu Dhabi)', flag: '🇦🇪', group: 'Licensed' },
  { id: 'rak-dao', label: 'UAE — RAK DAO (Ras Al Khaimah)', flag: '🇦🇪', group: 'Licensed' },
  { id: 'cbb', label: 'Bahrain — CBB', flag: '🇧🇭', group: 'Licensed' },
  // Emerging frameworks
  { id: 'cma-sa', label: 'Saudi Arabia — CMA', flag: '🇸🇦', group: 'Emerging' },
  { id: 'qfcra', label: 'Qatar — QFCRA', flag: '🇶🇦', group: 'Emerging' },
  { id: 'cma-om', label: 'Oman — CMA / CMSA', flag: '🇴🇲', group: 'Emerging' },
  // No framework — we advise on alternatives
  { id: 'cma-kw', label: 'Kuwait — CBK / CMA', flag: '🇰🇼', group: 'No Framework' },
  { id: 'cbe-eg', label: 'Egypt — CBE', flag: '🇪🇬', group: 'No Framework' },
  { id: 'bam-ma', label: 'Morocco — Bank Al-Maghrib', flag: '🇲🇦', group: 'No Framework' },
  { id: 'cbj-jo', label: 'Jordan — CBJ', flag: '🇯🇴', group: 'No Framework' },
  { id: 'bct-tn', label: 'Tunisia — BCT', flag: '🇹🇳', group: 'No Framework' },
  { id: 'bdl-lb', label: 'Lebanon — BDL', flag: '🇱🇧', group: 'No Framework' },
  { id: 'cbi-iq', label: 'Iraq — CBI', flag: '🇮🇶', group: 'No Framework' },
  { id: 'cbl-ly', label: 'Libya — CBL', flag: '🇱🇾', group: 'No Framework' },
]

const ACTIVITIES = [
  'Exchange / Trading Platform',
  'Broker-Dealer',
  'Custody & Safeguarding',
  'Lending & Borrowing',
  'Advisory Services',
  'Transfer & Settlement',
  'OTC Brokerage',
  'Payments / Remittance',
  'Stablecoin Issuance',
  'Stablecoin Management',
]

const INTERESTS = [
  'VASP Licensing',
  'Travel Rule Compliance',
  'AML / KYC Frameworks',
  'Enforcement Monitoring',
  'Custody & Safeguarding',
  'Board Reporting',
  'SAR Filing',
  'Audit Preparedness',
]

const ROLES = [
  'Chief Compliance Officer',
  'Head of Legal / General Counsel',
  'CEO / Founder',
  'CFO / Treasurer',
  'MLRO',
  'Compliance Analyst',
  'External Advisor / Consultant',
  'Other',
]

const TOTAL_STEPS = 5

export default function OnboardingPage() {
  const { data, update, complete } = useOnboarding()
  const [step, setStep] = useState(0)
  const [transitioning, setTransitioning] = useState(false)
  const [verificationSent, setVerificationSent] = useState(false)
  const [verificationCode, setVerificationCode] = useState('')

  const emailDomainValid = useMemo(() => emailMatchesDomain(data.workEmail, data.companyWebsite), [data.workEmail, data.companyWebsite])

  function handleSendVerification() {
    // Simulate sending verification code
    setVerificationSent(true)
    setTimeout(() => update({ emailVerified: true }), 0)
  }

  function handleVerifyCode() {
    // Simulate code verification — in production this hits an API
    if (verificationCode.length >= 4) {
      update({ emailVerified: true, mfaEnabled: true })
    }
  }

  function toggleList(key: 'additionalJurisdictions' | 'targetActivities' | 'complianceInterests', item: string) {
    const current = data[key]
    update({ [key]: current.includes(item) ? current.filter((x: string) => x !== item) : [...current, item] })
  }

  function goTo(next: number) {
    setTransitioning(true)
    setTimeout(() => {
      setStep(next)
      setTransitioning(false)
    }, 250)
  }

  function handleFinish() {
    complete()
    setTransitioning(true)
    setTimeout(() => {
      window.location.href = '/recommendation'
    }, 600)
  }

  const canProceed = (() => {
    switch (step) {
      case 0: {
        const hasName = data.companyName.trim() !== ''
        const hasEmail = data.workEmail.includes('@')
        const domainOk = emailDomainValid
        return hasName && hasEmail && domainOk
      }
      case 1: return data.primaryJurisdiction !== ''
      case 2: return data.targetActivities.length > 0
      case 3: return data.complianceInterests.length > 0
      case 4: return data.role !== ''
      default: return true
    }
  })()

  return (
    <div className="min-h-screen bg-bg-primary flex flex-col">
      <header className="px-6 py-5 flex items-center justify-between border-b border-border">
        <a href="/" className="inline-flex items-center gap-2.5">
          <BrandMark size={26} className="text-gold shrink-0" />
          <BrandName className="font-display font-bold text-[length:var(--text-lg)] tracking-[0.08em] text-text uppercase" />
        </a>
        <span className="font-mono text-text-faint text-[length:var(--text-xs)]">
          Step {step + 1} of {TOTAL_STEPS}
        </span>
      </header>

      <div className="h-1 bg-bg-surface-2">
        <div className="h-full bg-gold transition-all duration-500 ease-out" style={{ width: `${((step + 1) / TOTAL_STEPS) * 100}%` }} />
      </div>

      <div className="flex-1 flex items-start justify-center p-6 sm:p-12 overflow-y-auto">
        <div className={`w-full max-w-lg transition-all duration-250 ${transitioning ? 'opacity-0 translate-y-4' : 'opacity-100 translate-y-0'}`}>

          {/* Step 1: Company basics (KYB) */}
          {step === 0 && (
            <div>
              <p className="font-mono text-gold uppercase tracking-widest text-[length:var(--text-xs)] mb-3">Company Profile</p>
              <h2 className="font-display font-bold text-text text-[length:var(--text-xl)] mb-2">Tell us about your organization</h2>
              <p className="text-text-muted text-[length:var(--text-sm)] mb-8">
                This helps us tailor your licensing roadmap and compliance requirements. All fields are used to customize your dashboard — not shared externally.
              </p>

              <div className="space-y-5">
                <div>
                  <label className="block text-text text-[length:var(--text-sm)] font-medium mb-1.5">Company name</label>
                  <input
                    type="text"
                    value={data.companyName}
                    onChange={(e) => update({ companyName: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border border-border bg-bg-surface text-text text-[length:var(--text-sm)] placeholder:text-text-faint focus:outline-none focus:border-gold transition-colors"
                    placeholder="e.g. Acme Digital Assets"
                  />
                </div>

                <div>
                  <label className="block text-text text-[length:var(--text-sm)] font-medium mb-1.5">Company website (optional)</label>
                  <input
                    type="url"
                    value={data.companyWebsite}
                    onChange={(e) => update({ companyWebsite: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border border-border bg-bg-surface text-text text-[length:var(--text-sm)] placeholder:text-text-faint focus:outline-none focus:border-gold transition-colors"
                    placeholder="https://acme.com"
                  />
                </div>

                <div>
                  <label className="block text-text text-[length:var(--text-sm)] font-medium mb-1.5">Work email</label>
                  <div className="flex gap-2">
                    <input
                      type="email"
                      value={data.workEmail}
                      onChange={(e) => update({ workEmail: e.target.value, emailVerified: false })}
                      className={`flex-1 px-4 py-3 rounded-xl border bg-bg-surface text-text text-[length:var(--text-sm)] placeholder:text-text-faint focus:outline-none focus:border-gold transition-colors ${
                        data.workEmail && !emailDomainValid ? 'border-red-400' : 'border-border'
                      }`}
                      placeholder="fatima@acme.com"
                    />
                    {data.workEmail && emailDomainValid && !data.emailVerified && (
                      <button
                        type="button"
                        onClick={handleSendVerification}
                        className="px-4 py-3 rounded-xl bg-gold text-white text-[length:var(--text-xs)] font-medium whitespace-nowrap hover:brightness-110 transition-all cursor-pointer"
                      >
                        {verificationSent ? 'Resend' : 'Verify'}
                      </button>
                    )}
                    {data.emailVerified && (
                      <span className="flex items-center px-3 text-green-600 text-[length:var(--text-sm)] font-medium">&#10003;</span>
                    )}
                  </div>
                  {data.workEmail && !emailDomainValid && (
                    <p className="text-red-500 text-[length:var(--text-xs)] mt-1.5">
                      Email domain must match your company website domain
                    </p>
                  )}
                  {verificationSent && !data.emailVerified && (
                    <div className="mt-2 flex gap-2">
                      <input
                        type="text"
                        value={verificationCode}
                        onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                        className="flex-1 px-4 py-2.5 rounded-xl border border-border bg-bg-surface text-text text-[length:var(--text-sm)] placeholder:text-text-faint focus:outline-none focus:border-gold transition-colors"
                        placeholder="Enter 6-digit code"
                      />
                      <button
                        type="button"
                        onClick={handleVerifyCode}
                        disabled={verificationCode.length < 4}
                        className="px-4 py-2.5 rounded-xl bg-gold text-white text-[length:var(--text-xs)] font-medium hover:brightness-110 transition-all cursor-pointer disabled:opacity-50"
                      >
                        Confirm
                      </button>
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-text text-[length:var(--text-sm)] font-medium mb-1.5">Phone number (for 2FA)</label>
                  <input
                    type="tel"
                    value={data.phoneNumber}
                    onChange={(e) => update({ phoneNumber: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border border-border bg-bg-surface text-text text-[length:var(--text-sm)] placeholder:text-text-faint focus:outline-none focus:border-gold transition-colors"
                    placeholder="+971 50 123 4567"
                  />
                  <p className="text-text-faint text-[length:var(--text-xs)] mt-1.5">
                    Used for two-factor authentication. We will never share your number.
                  </p>
                </div>

                <div>
                  <label className="block text-text text-[length:var(--text-sm)] font-medium mb-3">Entity status</label>
                  <div className="grid gap-2">
                    {[
                      { id: 'not-started' as const, label: 'No entity yet', desc: 'Haven\'t incorporated — exploring options' },
                      { id: 'in-progress' as const, label: 'Entity in progress', desc: 'Incorporation underway in a MENA jurisdiction' },
                      { id: 'established' as const, label: 'Entity established', desc: 'Have a registered entity ready for licensing' },
                    ].map((opt) => (
                      <button
                        key={opt.id}
                        onClick={() => update({ entityStatus: opt.id })}
                        className={`text-left px-4 py-3 rounded-xl border transition-all cursor-pointer ${
                          data.entityStatus === opt.id ? 'border-gold bg-gold-light' : 'border-border bg-bg-surface hover:border-gold'
                        }`}
                      >
                        <span className="text-text text-[length:var(--text-sm)] font-medium">{opt.label}</span>
                        <span className="block text-text-faint text-[length:var(--text-xs)] mt-0.5">{opt.desc}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-text text-[length:var(--text-sm)] font-medium mb-3">Team size</label>
                  <div className="grid grid-cols-4 gap-2">
                    {(['1-5', '6-20', '21-50', '50+'] as const).map((size) => (
                      <button
                        key={size}
                        onClick={() => update({ teamSize: size })}
                        className={`px-3 py-2.5 rounded-xl border text-[length:var(--text-sm)] font-medium transition-all cursor-pointer ${
                          data.teamSize === size ? 'border-gold bg-gold-light text-text' : 'border-border bg-bg-surface text-text-muted hover:border-gold'
                        }`}
                      >
                        {size}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Jurisdiction & licensing stage */}
          {step === 1 && (
            <div>
              <p className="font-mono text-gold uppercase tracking-widest text-[length:var(--text-xs)] mb-3">Licensing</p>
              <h2 className="font-display font-bold text-text text-[length:var(--text-xl)] mb-2">Where do you want to get licensed?</h2>
              <p className="text-text-muted text-[length:var(--text-sm)] mb-6">
                Select one or more jurisdictions you&apos;re interested in. We&apos;ll tailor your assessment and dashboard accordingly.
              </p>

              <div className="mb-6">
                <label className="block text-text text-[length:var(--text-sm)] font-medium mb-3">Current licensing stage</label>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { id: 'exploring' as const, label: 'Exploring', desc: 'Researching options' },
                    { id: 'pre-application' as const, label: 'Pre-application', desc: 'Preparing documents' },
                    { id: 'application-in-progress' as const, label: 'Applied', desc: 'Application submitted' },
                    { id: 'licensed' as const, label: 'Licensed', desc: 'Already hold a license' },
                  ].map((opt) => (
                    <button
                      key={opt.id}
                      onClick={() => update({ licensingStage: opt.id })}
                      className={`text-left px-4 py-3 rounded-xl border transition-all cursor-pointer ${
                        data.licensingStage === opt.id ? 'border-gold bg-gold-light' : 'border-border bg-bg-surface hover:border-gold'
                      }`}
                    >
                      <span className="text-text text-[length:var(--text-sm)] font-medium">{opt.label}</span>
                      <span className="block text-text-faint text-[length:var(--text-xs)] mt-0.5">{opt.desc}</span>
                    </button>
                  ))}
                </div>
              </div>

              {(() => {
                // Combine primary + additional into a single selected set
                const allSelected = [data.primaryJurisdiction, ...data.additionalJurisdictions].filter(Boolean)
                function toggleJurisdiction(id: string) {
                  if (allSelected.includes(id)) {
                    // Removing — if it's the primary, promote the next one
                    if (data.primaryJurisdiction === id) {
                      const remaining = data.additionalJurisdictions.filter((j: string) => j !== id)
                      update({ primaryJurisdiction: remaining[0] || '', additionalJurisdictions: remaining.slice(1) })
                    } else {
                      update({ additionalJurisdictions: data.additionalJurisdictions.filter((j: string) => j !== id) })
                    }
                  } else {
                    // Adding — if no primary yet, set as primary; otherwise add to additional
                    if (!data.primaryJurisdiction) {
                      update({ primaryJurisdiction: id })
                    } else {
                      update({ additionalJurisdictions: [...data.additionalJurisdictions, id] })
                    }
                  }
                }
                return (
                  <>
                    <label className="block text-text text-[length:var(--text-sm)] font-medium mb-3">
                      Select jurisdictions
                      {allSelected.length > 0 && (
                        <span className="ml-2 text-gold font-mono text-[length:var(--text-xs)]">{allSelected.length} selected</span>
                      )}
                    </label>
                    <div className="space-y-4">
                      {(['Licensed', 'Emerging', 'No Framework'] as const).map((group) => {
                        const items = JURISDICTIONS.filter((j) => j.group === group)
                        if (items.length === 0) return null
                        return (
                          <div key={group}>
                            <p className="text-text-faint text-[length:var(--text-xs)] font-mono uppercase tracking-wider mb-2">
                              {group === 'Licensed' ? 'Active licensing frameworks' : group === 'Emerging' ? 'Emerging / draft frameworks' : 'No digital asset framework'}
                            </p>
                            <div className="grid gap-2">
                              {items.map((j) => {
                                const isSelected = allSelected.includes(j.id)
                                const isPrimary = data.primaryJurisdiction === j.id
                                return (
                                  <button
                                    key={j.id}
                                    onClick={() => toggleJurisdiction(j.id)}
                                    className={`text-left px-4 py-3 rounded-xl border transition-all cursor-pointer ${
                                      isSelected ? 'border-gold bg-gold-light text-text font-medium' : 'border-border bg-bg-surface text-text hover:border-gold'
                                    }`}
                                  >
                                    <span className="flex items-center gap-2">
                                      {isSelected && <span className="text-gold">&#10003;</span>}
                                      <span>{j.flag} {j.label}</span>
                                      {isPrimary && allSelected.length > 1 && (
                                        <span className="ml-auto text-[length:var(--text-xs)] bg-gold/15 text-gold px-2 py-0.5 rounded font-mono">Primary</span>
                                      )}
                                    </span>
                                    {group === 'No Framework' && !isSelected && (
                                      <span className="text-text-faint text-[length:var(--text-xs)] ml-6 block">We&apos;ll recommend alternatives</span>
                                    )}
                                  </button>
                                )
                              })}
                            </div>
                          </div>
                        )
                      })}
                    </div>

                    {allSelected.length > 1 && (
                      <div className="mt-4 px-4 py-3 bg-gold-light border border-gold/20 rounded-xl">
                        <p className="text-text text-[length:var(--text-xs)] leading-relaxed">
                          <strong>Multi-jurisdiction licensing:</strong> Your dashboard will let you filter between jurisdictions and track each licensing journey separately.
                          {data.primaryJurisdiction && <> Our assessment will focus on <strong>{JURISDICTIONS.find((j) => j.id === data.primaryJurisdiction)?.label ?? data.primaryJurisdiction}</strong> as your primary jurisdiction.</>}
                        </p>
                      </div>
                    )}
                  </>
                )
              })()}
            </div>
          )}

          {/* Step 3: Target activities */}
          {step === 2 && (
            <div>
              <p className="font-mono text-gold uppercase tracking-widest text-[length:var(--text-xs)] mb-3">Activities</p>
              <h2 className="font-display font-bold text-text text-[length:var(--text-xl)] mb-2">What activities will you operate?</h2>
              <p className="text-text-muted text-[length:var(--text-sm)] mb-6">
                Each activity may require a separate license. We will show you the exact requirements and capital thresholds for each.
              </p>
              <div className="grid grid-cols-2 gap-3">
                {ACTIVITIES.map((activity) => (
                  <button
                    key={activity}
                    onClick={() => toggleList('targetActivities', activity)}
                    className={`text-left px-4 py-3 rounded-xl border transition-all text-[length:var(--text-sm)] cursor-pointer ${
                      data.targetActivities.includes(activity) ? 'border-gold bg-gold-light text-text font-medium' : 'border-border bg-bg-surface text-text hover:border-gold'
                    }`}
                  >
                    {data.targetActivities.includes(activity) && <span className="text-gold mr-1.5">&#10003;</span>}
                    {activity}
                  </button>
                ))}
              </div>

              {data.targetActivities.length > 0 && (
                <div className="mt-6 px-4 py-3 bg-gold-light border border-gold/20 rounded-xl">
                  <p className="text-text text-[length:var(--text-xs)] leading-relaxed">
                    <strong>Note:</strong> In most MENA jurisdictions, each activity requires its own license application and separate capital requirements. Your dashboard will show the specific requirements for each activity you selected.
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Step 4: Compliance focus */}
          {step === 3 && (
            <div>
              <p className="font-mono text-gold uppercase tracking-widest text-[length:var(--text-xs)] mb-3">Focus Areas</p>
              <h2 className="font-display font-bold text-text text-[length:var(--text-xl)] mb-2">What compliance areas matter most?</h2>
              <p className="text-text-muted text-[length:var(--text-sm)] mb-6">
                We will prioritize these in your alerts, weekly brief, and dashboard.
              </p>
              <div className="grid grid-cols-2 gap-3">
                {INTERESTS.map((interest) => (
                  <button
                    key={interest}
                    onClick={() => toggleList('complianceInterests', interest)}
                    className={`text-left px-4 py-3 rounded-xl border transition-all text-[length:var(--text-sm)] cursor-pointer ${
                      data.complianceInterests.includes(interest) ? 'border-gold bg-gold-light text-text font-medium' : 'border-border bg-bg-surface text-text hover:border-gold'
                    }`}
                  >
                    {data.complianceInterests.includes(interest) && <span className="text-gold mr-1.5">&#10003;</span>}
                    {interest}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Step 5: Role */}
          {step === 4 && (
            <div>
              <p className="font-mono text-gold uppercase tracking-widest text-[length:var(--text-xs)] mb-3">Your Role</p>
              <h2 className="font-display font-bold text-text text-[length:var(--text-xl)] mb-2">What best describes your role?</h2>
              <p className="text-text-muted text-[length:var(--text-sm)] mb-6">
                This helps us tailor the depth and format of your reports and recommendations.
              </p>
              <div className="grid gap-3">
                {ROLES.map((role) => (
                  <button
                    key={role}
                    onClick={() => update({ role })}
                    className={`text-left px-5 py-3.5 rounded-xl border transition-all text-[length:var(--text-sm)] cursor-pointer ${
                      data.role === role ? 'border-gold bg-gold-light text-text font-medium' : 'border-border bg-bg-surface text-text hover:border-gold'
                    }`}
                  >
                    {data.role === role && <span className="text-gold mr-2">&#10003;</span>}
                    {role}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Navigation */}
          <div className="flex items-center justify-between mt-8 pt-6 border-t border-border">
            {step > 0 ? (
              <button onClick={() => goTo(step - 1)} className="text-text-muted hover:text-text text-[length:var(--text-sm)] transition-colors cursor-pointer">
                ← Back
              </button>
            ) : (
              <div />
            )}
            {step < TOTAL_STEPS - 1 ? (
              <Button variant="primary" onClick={() => goTo(step + 1)} disabled={!canProceed}>
                Continue →
              </Button>
            ) : (
              <Button variant="primary" onClick={handleFinish} disabled={!canProceed}>
                Go to Dashboard →
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
