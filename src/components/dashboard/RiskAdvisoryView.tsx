'use client'

import { useState } from 'react'
import { JURISDICTIONS } from '@/lib/licensing-data'

const SEVERITY_STYLES = {
  critical: { border: 'border-l-red-600', bg: 'bg-red-50', badge: 'bg-red-100 text-red-700' },
  high: { border: 'border-l-orange-500', bg: 'bg-orange-50', badge: 'bg-orange-100 text-orange-700' },
  medium: { border: 'border-l-amber-500', bg: 'bg-amber-50', badge: 'bg-amber-100 text-amber-700' },
}

const REMEDIAL_ACTIONS: Record<string, string> = {
  'Central Bank can freeze operations overnight':
    'Maintain accounts with at least 2 separate UAE banks. Keep 3+ months of operating expenses in a non-VASP corporate entity account. Establish a direct compliance liaison with your banking relationship managers and provide proactive quarterly AML reporting to them.',
  'Wrong license category = forced shutdown':
    'Conduct a quarterly internal audit mapping every active service to its corresponding VARA license category. Before launching any new product feature, obtain written confirmation from your compliance officer that it falls within your licensed scope. File additional license applications proactively.',
  'Marketing before license = immediate enforcement':
    'Implement a marketing compliance gate: no public-facing content (website, social media, event appearances, press releases) referencing your virtual asset services until your VARA license is formally granted. Use a "coming soon" holding page with no service descriptions.',
  'Random audits with no advance notice':
    'Maintain a continuously updated "audit pack" containing all 8 core compliance documents. Assign a backup MLRO and ensure at least 2 team members can produce any compliance document within 4 hours. Run quarterly internal mock audits.',
  'MVP license is not a full license':
    'Track MVP operational limits in a real-time dashboard: user count, transaction volumes, and milestone deadlines. Set alerts at 80% of each limit. Build your go-to-market plan around MVP constraints and timeline your growth for post-full-license.',
  'Banking relationship loss cascades':
    'Onboard with at least 2 banks from day one. Provide monthly compliance summaries to each bank proactively. Maintain a segregated operating account in a non-VASP entity as a fallback for payroll and essential operations.',
  'Stablecoin issuance requires dual regulatory approval':
    'Engage separate legal counsel for VARA and CBUAE workstreams. Begin CBUAE engagement in parallel with VARA application — do not wait for one approval before starting the other. Budget for AED 50M minimum capital and independent monthly reserve attestation costs.',
  'Stablecoin reserve management under constant scrutiny':
    'Appoint an independent auditor for monthly reserve attestation. Restrict reserve composition to cash and short-term UAE sovereign debt only. Implement real-time reserve monitoring with automated alerts for any shortfall below 100% backing.',
  'ADGM is a common law jurisdiction — different legal framework':
    'Retain legal counsel specifically qualified in ADGM/English common law. Review all existing contracts and ensure they are governed by ADGM law where required. Train your team on the differences between common law and UAE civil law dispute resolution.',
  '$8.85M in penalties already imposed':
    'Conduct a gap analysis against every published ADGM enforcement action. Implement a compliance calendar with all filing deadlines. Engage an external compliance consultant for an annual independent review before the FSRA examination.',
  'Enhanced capital requirements with no phase-in':
    'Monitor FSRA regulatory updates weekly. Maintain a capital buffer of at least 20% above the minimum requirement. Establish a capital contingency plan with pre-approved funding sources that can be deployed within 30 days.',
  'Fiat-Referenced Token (FRT) framework is the strictest in the region':
    'Establish relationships with ADGM-recognized banks for reserve custody. Implement real-time reserve monitoring infrastructure before applying. Budget for quarterly stress testing and ensure systems support immediate par-value redemption at all times.',
  'Sandbox exit is not guaranteed':
    'Define sandbox KPIs with the CBB at entry and track them monthly. Prepare a wind-down plan from day one. Maintain sufficient capital to cover orderly wind-down costs throughout the sandbox period.',
  'Small market, high regulator attention':
    'Treat every CBB interaction as a compliance event. Document all regulator communications. Proactively self-report issues before they become findings. Build a direct relationship with your CBB supervisor through regular voluntary updates.',
  'Cross-border operations require separate approvals':
    'Implement geo-blocking for jurisdictions where you are not licensed. Add jurisdiction checks to your onboarding flow. Obtain legal opinions on cross-border service boundaries before launching in any new market.',
  'Payment token services require CBB pre-approval':
    'Begin CBB pre-engagement for payment token services at least 6 months before planned launch. Budget for BHD 1M minimum capital. Prepare for bespoke conditions by building flexibility into your stablecoin infrastructure.',
}

interface PenaltyCategory {
  violation: string
  penalty: string
  severity: 'critical' | 'high' | 'medium'
}

const JURISDICTION_PENALTIES: Record<string, PenaltyCategory[]> = {
  vara: [
    { violation: 'Operating without license', penalty: 'Up to AED 10M (~$2.7M) + cease-and-desist', severity: 'critical' },
    { violation: 'AML/CFT violations', penalty: 'Up to AED 5M (~$1.36M) per violation', severity: 'critical' },
    { violation: 'Marketing without license', penalty: 'Up to AED 600,000 (~$163K) + criminal referral', severity: 'high' },
    { violation: 'Breach of licensing conditions', penalty: 'AED 100K\u20131M per breach', severity: 'high' },
    { violation: 'Late compliance returns', penalty: 'Supervisory escalation, potential license suspension', severity: 'medium' },
  ],
  adgm: [
    { violation: 'Market misconduct', penalty: 'Up to $25M or 3x profits gained', severity: 'critical' },
    { violation: 'AML/CFT violations', penalty: 'Censure + unlimited financial penalty', severity: 'critical' },
    { violation: 'Non-disclosure of material changes', penalty: 'Up to $5M', severity: 'high' },
    { violation: 'Failure to maintain capital', penalty: 'Immediate license conditions or revocation', severity: 'high' },
    { violation: 'Total penalties imposed to date', penalty: '$8.85M cumulative', severity: 'medium' },
  ],
  cbb: [
    { violation: 'Operating without authorization', penalty: 'Criminal referral + BHD 1M (~$2.65M)', severity: 'critical' },
    { violation: 'AML/CFT violations', penalty: 'BHD 100K\u2013500K (~$265K\u2013$1.3M) per violation', severity: 'critical' },
    { violation: 'Sandbox violations', penalty: 'Immediate exit from sandbox program', severity: 'high' },
    { violation: 'Late filings', penalty: 'BHD 10K (~$26.5K) per day of delay', severity: 'medium' },
  ],
}

const MAX_FINES: Record<string, string> = {
  vara: 'AED 10M (~$2.7M)',
  adgm: '$25M or 3x profits',
  cbb: 'BHD 1M (~$2.65M)',
}

export function RiskAdvisoryView({ jurisdictions }: { jurisdictions?: string[] }) {
  const availableJurisdictions = jurisdictions && jurisdictions.length > 0
    ? JURISDICTIONS.filter((j) => jurisdictions.includes(j.id))
    : JURISDICTIONS

  const [selectedJurisdiction, setSelectedJurisdiction] = useState(
    availableJurisdictions[0]?.id || 'vara'
  )
  const jurisdiction = availableJurisdictions.find((j) => j.id === selectedJurisdiction) ?? availableJurisdictions[0]

  const criticalCount = jurisdiction.hiddenRisks.filter((r) => r.severity === 'critical').length
  const highCount = jurisdiction.hiddenRisks.filter((r) => r.severity === 'high').length
  const penalties = JURISDICTION_PENALTIES[jurisdiction.id] || []

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-display font-bold text-text text-[length:var(--text-lg)]">Risk Advisory</h1>
          <p className="text-text-muted text-[length:var(--text-sm)]">Hidden risks that regulators, lawyers, and websites don&rsquo;t make obvious</p>
        </div>
        <select
          value={selectedJurisdiction}
          onChange={(e) => setSelectedJurisdiction(e.target.value)}
          className="px-4 py-2.5 rounded-xl border border-border bg-bg-primary text-text text-[length:var(--text-sm)] focus:outline-none focus:border-gold cursor-pointer"
        >
          {availableJurisdictions.map((j) => (
            <option key={j.id} value={j.id}>{j.flag} {j.name}</option>
          ))}
        </select>
      </div>

      {/* Penalty Exposure summary */}
      <div className="bg-bg-primary border border-border rounded-2xl p-5">
        <div className="flex items-center gap-3 mb-4">
          <span className="text-red-600 text-[length:var(--text-lg)]">&#9888;</span>
          <h2 className="font-display font-bold text-text text-[length:var(--text-base)]">Penalty Exposure &mdash; {jurisdiction.name}</h2>
        </div>
        <div className="flex items-center gap-4 mb-4">
          <div className="bg-red-50 rounded-xl px-4 py-3">
            <p className="font-mono text-red-600 font-bold text-[length:var(--text-xl)]">{MAX_FINES[jurisdiction.id]}</p>
            <p className="text-text-muted text-[length:var(--text-xs)]">Maximum single penalty</p>
          </div>
          <div className="bg-orange-50 rounded-xl px-4 py-3">
            <p className="font-mono text-orange-600 font-bold text-[length:var(--text-lg)]">{penalties.length}</p>
            <p className="text-text-muted text-[length:var(--text-xs)]">Penalty categories</p>
          </div>
        </div>
        <div className="space-y-2">
          {penalties.map((p, i) => {
            const style = SEVERITY_STYLES[p.severity]
            return (
              <div key={i} className="flex items-center justify-between gap-4 py-2 border-b border-border last:border-b-0">
                <div className="flex items-center gap-2">
                  <span className={`px-2 py-0.5 rounded text-[length:var(--text-xs)] font-bold uppercase font-mono ${style.badge}`}>
                    {p.severity}
                  </span>
                  <span className="text-text text-[length:var(--text-sm)]">{p.violation}</span>
                </div>
                <span className="font-mono text-text font-bold text-[length:var(--text-sm)] shrink-0">{p.penalty}</span>
              </div>
            )
          })}
        </div>
      </div>

      {/* Risk summary */}
      <div className="bg-bg-primary border border-alert/30 rounded-2xl p-6">
        <div className="flex items-center gap-6">
          <div>
            <p className="font-mono text-alert font-bold text-[length:var(--text-xl)]">{jurisdiction.hiddenRisks.length}</p>
            <p className="text-text-muted text-[length:var(--text-xs)]">Active risks</p>
          </div>
          <div className="h-10 w-px bg-border" />
          <div>
            <p className="font-mono text-red-600 font-bold text-[length:var(--text-lg)]">{criticalCount}</p>
            <p className="text-text-muted text-[length:var(--text-xs)]">Critical</p>
          </div>
          <div>
            <p className="font-mono text-orange-600 font-bold text-[length:var(--text-lg)]">{highCount}</p>
            <p className="text-text-muted text-[length:var(--text-xs)]">High</p>
          </div>
        </div>
        <p className="text-text-muted text-[length:var(--text-sm)] mt-4 leading-relaxed">
          These are the risks that cause licensed firms to lose their operations overnight. They are not listed on regulator websites. They come from operating experience in {jurisdiction.name}.
        </p>
      </div>

      {/* Risk cards */}
      <div className="space-y-4">
        {jurisdiction.hiddenRisks.map((risk, i) => {
          const style = SEVERITY_STYLES[risk.severity]
          const remedialAction = REMEDIAL_ACTIONS[risk.title]
          return (
            <div key={i} className={`border-l-4 ${style.border} ${style.bg} rounded-xl p-6`}>
              <div className="flex items-start gap-3">
                <span className={`px-2 py-0.5 rounded text-[length:var(--text-xs)] font-bold uppercase ${style.badge}`}>
                  {risk.severity}
                </span>
                <div className="flex-1">
                  <h3 className="text-text font-bold text-[length:var(--text-base)]">{risk.title}</h3>
                  <p className="text-text-muted text-[length:var(--text-sm)] mt-2 leading-relaxed">{risk.description}</p>
                  {remedialAction && (
                    <div className="mt-4 bg-gold/10 border border-gold-light rounded-xl p-4">
                      <p className="font-mono font-bold text-gold text-[length:var(--text-xs)] uppercase mb-1">Recommended Action</p>
                      <p className="text-text text-[length:var(--text-sm)] leading-relaxed">{remedialAction}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* General audit preparedness */}
      <div className="bg-bg-primary border border-border rounded-2xl p-6">
        <h2 className="font-display font-bold text-text text-[length:var(--text-base)] mb-4">Audit Preparedness Checklist</h2>
        <p className="text-text-muted text-[length:var(--text-sm)] mb-4">
          {jurisdiction.regulator} conducts {jurisdiction.auditFrequency.toLowerCase()}. The following must be audit-ready at all times:
        </p>
        <ul className="space-y-2">
          {[
            'Complete and current AML/CFT policy manual',
            'Transaction monitoring logs with documented review decisions',
            'SAR filing records with timestamps and supporting evidence',
            'Customer due diligence files for all onboarded clients',
            'Staff training records (AML/CFT training within last 12 months)',
            'Board meeting minutes covering compliance oversight',
            'Incident response records (any previous issues + resolutions)',
            'MLRO annual report (filed or in preparation)',
          ].map((item) => (
            <li key={item} className="flex items-start gap-2 text-text-muted text-[length:var(--text-sm)]">
              <span className="text-gold mt-0.5 shrink-0">&#9671;</span>{item}
            </li>
          ))}
        </ul>
      </div>

      {/* Operational risk scenarios */}
      <div className="bg-bg-primary border border-border rounded-2xl p-6">
        <h2 className="font-display font-bold text-text text-[length:var(--text-base)] mb-4">
          What happens when things go wrong
        </h2>
        <div className="space-y-4">
          <div className="border-l-4 border-l-red-300 pl-4">
            <h3 className="text-text font-medium text-[length:var(--text-sm)]">Frozen bank accounts</h3>
            <p className="text-text-muted text-[length:var(--text-xs)] mt-1 leading-relaxed">
              Your bank terminates your relationship without prior notice. You cannot process deposits, withdrawals, or payroll. This has happened to licensed VASPs when their bank&rsquo;s compliance team flagged activity they didn&rsquo;t understand. <strong>Mitigation:</strong> Maintain relationships with 2+ banks. Keep 3 months of operating expenses in a non-VASP entity account.
            </p>
          </div>
          <div className="border-l-4 border-l-red-300 pl-4">
            <h3 className="text-text font-medium text-[length:var(--text-sm)]">Surprise regulatory audit</h3>
            <p className="text-text-muted text-[length:var(--text-xs)] mt-1 leading-relaxed">
              You receive a 48-hour notice to produce compliance documentation. Your MLRO is on leave. Your transaction monitoring logs have gaps. <strong>Mitigation:</strong> Keep an always-current &ldquo;audit pack&rdquo; with the 8 documents listed above. Designate a backup MLRO.
            </p>
          </div>
          <div className="border-l-4 border-l-red-300 pl-4">
            <h3 className="text-text font-medium text-[length:var(--text-sm)]">New user onboarding suspended</h3>
            <p className="text-text-muted text-[length:var(--text-xs)] mt-1 leading-relaxed">
              The regulator issues a direction to stop onboarding new customers while they review a compliance concern. Your existing users can transact but you cannot grow. This can last weeks or months. <strong>Mitigation:</strong> Proactively address compliance gaps before they become findings. Self-report issues before the regulator discovers them.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
