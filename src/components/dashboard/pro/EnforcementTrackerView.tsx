import { UpgradeBanner, mapJurisdictionsToLabels } from './UpgradeBanner'

const ACTIONS = [
  { date: '2026-04-08', regulator: 'VARA', entity: 'AlphaChain FZE', type: 'Cease & Desist', severity: 'critical', fine: 'AED 600,000', detail: 'Operating broker-dealer services without a valid VASP license.' },
  { date: '2026-04-05', regulator: 'ADGM', entity: 'Gulf Digital Markets Ltd', type: 'Public Censure', severity: 'high', fine: '$1,250,000', detail: 'Failure to segregate client assets per FSMR Rule 3.11.2.' },
  { date: '2026-04-02', regulator: 'VARA', entity: 'DuneEx Trading', type: 'Financial Penalty', severity: 'high', fine: 'AED 450,000', detail: 'Inadequate AML/CFT transaction monitoring and delayed SAR filing.' },
  { date: '2026-03-28', regulator: 'CBB', entity: 'Bahrain Crypto Exchange', type: 'License Restriction', severity: 'moderate', fine: 'BHD 75,000', detail: 'Non-compliance with Travel Rule requirements — no IVMS 101 solution.' },
  { date: '2026-03-25', regulator: 'VARA', entity: 'MetaVault DMCC', type: 'Cease & Desist', severity: 'critical', fine: 'AED 600,000', detail: 'Unlicensed custody services and marketing of virtual asset products.' },
  { date: '2026-03-20', regulator: 'ADGM', entity: 'Nexus Capital Partners', type: 'Financial Penalty', severity: 'moderate', fine: '$500,000', detail: 'Late submission of quarterly compliance reports and inadequate MLRO documentation.' },
  { date: '2026-03-15', regulator: 'CMA-SA', entity: 'Riyadh Digital Securities Co', type: 'Financial Penalty', severity: 'high', fine: 'SAR 2,000,000', detail: 'Marketing digital asset securities without CMA authorization under FinTech Lab.' },
  { date: '2026-03-10', regulator: 'QFC', entity: 'Doha Crypto Advisory LLC', type: 'Public Censure', severity: 'moderate', fine: 'QAR 400,000', detail: 'Operating unlicensed investment advisory on virtual assets.' },
]

const PATTERNS = [
  { violation: 'Unlicensed operations', count: 23, trend: '&#9650; 40%', trendColor: 'text-red-600' },
  { violation: 'AML/KYC deficiencies', count: 18, trend: '&#9650; 25%', trendColor: 'text-red-600' },
  { violation: 'Travel Rule non-compliance', count: 14, trend: '&#9650; 60%', trendColor: 'text-red-600' },
  { violation: 'Client asset segregation', count: 9, trend: '&#8594; Stable', trendColor: 'text-amber-600' },
  { violation: 'Unauthorized marketing', count: 7, trend: '&#9650; 15%', trendColor: 'text-orange-600' },
]

const SEVERITY_COLORS: Record<string, string> = {
  critical: 'bg-red-50 text-red-700 border-red-200',
  high: 'bg-orange-50 text-orange-700 border-orange-200',
  moderate: 'bg-amber-50 text-amber-700 border-amber-200',
}

interface Props { jurisdictions: string[] }

export function EnforcementTrackerView({ jurisdictions }: Props) {
  const labels = mapJurisdictionsToLabels(jurisdictions)
  const filtered = labels.length > 0 ? ACTIONS.filter((a) => labels.includes(a.regulator)) : ACTIONS
  const regulatorsTracked = new Set(filtered.map((a) => a.regulator)).size

  return (
    <div className="space-y-6">
      <div>
        <div className="inline-block px-2.5 py-1 bg-gold/10 text-gold text-[length:var(--text-xs)] font-bold uppercase rounded mb-3">Preview</div>
        <h1 className="font-display font-bold text-text text-[length:var(--text-lg)]">Enforcement Tracker</h1>
        <p className="text-text-muted text-[length:var(--text-sm)] mt-1">
          Real-time monitoring of enforcement actions across {labels.length > 0 ? labels.join(', ') : 'your regulators'}.
        </p>
      </div>

      <UpgradeBanner title="Enforcement Tracker" />

      {/* Stats row */}
      <div className="grid grid-cols-4 gap-4">
        <div className="bg-bg-primary border border-border rounded-xl p-4 text-center">
          <p className="font-mono text-alert font-bold text-[length:var(--text-xl)]">{filtered.length}</p>
          <p className="text-text-faint text-[length:var(--text-xs)]">Actions this quarter</p>
        </div>
        <div className="bg-bg-primary border border-border rounded-xl p-4 text-center">
          <p className="font-mono text-gold font-bold text-[length:var(--text-xl)]">$4.2M</p>
          <p className="text-text-faint text-[length:var(--text-xs)]">Total fines imposed</p>
        </div>
        <div className="bg-bg-primary border border-border rounded-xl p-4 text-center">
          <p className="font-mono text-red-600 font-bold text-[length:var(--text-xl)]">{filtered.filter((a) => a.severity === 'critical').length}</p>
          <p className="text-text-faint text-[length:var(--text-xs)]">Licenses suspended</p>
        </div>
        <div className="bg-bg-primary border border-border rounded-xl p-4 text-center">
          <p className="font-mono text-orange-600 font-bold text-[length:var(--text-xl)]">{regulatorsTracked}</p>
          <p className="text-text-faint text-[length:var(--text-xs)]">Regulators tracked</p>
        </div>
      </div>

      {/* Pattern analysis */}
      <div className="bg-bg-primary border border-border rounded-2xl p-6">
        <h2 className="font-display font-bold text-text text-[length:var(--text-base)] mb-4">Violation Pattern Analysis</h2>
        <div className="space-y-3">
          {PATTERNS.map((p) => (
            <div key={p.violation} className="flex items-center justify-between py-2 border-b border-border last:border-0">
              <span className="text-text text-[length:var(--text-sm)]">{p.violation}</span>
              <div className="flex items-center gap-4">
                <span className="font-mono text-text-muted text-[length:var(--text-sm)]">{p.count} cases</span>
                <span className={`font-mono text-[length:var(--text-xs)] ${p.trendColor}`} dangerouslySetInnerHTML={{ __html: p.trend }} />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Recent actions */}
      <div className="bg-bg-primary border border-border rounded-2xl p-6">
        <h2 className="font-display font-bold text-text text-[length:var(--text-base)] mb-4">Recent Enforcement Actions</h2>
        {filtered.length === 0 ? (
          <p className="text-text-muted text-[length:var(--text-sm)]">No recent enforcement actions for your selected jurisdictions.</p>
        ) : (
          <div className="space-y-4">
            {filtered.map((action, i) => (
              <div key={i} className="border border-border rounded-xl p-4">
                <div className="flex items-start justify-between gap-3 mb-2">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`text-[length:var(--text-xs)] px-2 py-0.5 rounded-full border font-medium ${SEVERITY_COLORS[action.severity]}`}>
                        {action.severity}
                      </span>
                      <span className="font-mono text-text-faint text-[length:var(--text-xs)]">{action.regulator}</span>
                    </div>
                    <p className="text-text font-medium text-[length:var(--text-sm)]">{action.entity}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="font-mono text-alert font-bold text-[length:var(--text-sm)]">{action.fine}</p>
                    <p className="text-text-faint text-[length:var(--text-xs)]">{action.date}</p>
                  </div>
                </div>
                <p className="text-text-muted text-[length:var(--text-xs)]"><strong>{action.type}:</strong> {action.detail}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
