'use client'

import { useState, useEffect, useCallback } from 'react'

interface Alert {
  id: string
  severity: 'critical' | 'high' | 'medium' | 'info'
  title: string
  description: string
  date: string
  jurisdiction: string
  category: string
  isNew: boolean
  sourceUrl: string
}

/**
 * DEFENSE GUIDELINE: Principle 1 — Alert content, severity scoring, and jurisdiction
 * mappings must be served from a backend API in production. The client should receive
 * only the alerts relevant to the authenticated user's jurisdictions.
 *
 * Principle 4: Alert triage data (read/dismiss/escalate) feeds the compliance case
 * database. Store disposition patterns to improve alert relevance scoring.
 * Principle 5: Alerts sourced from regulator portal integrations (goAML, VARA portal)
 * are invisible to any frontend clone.
 */
const ALERTS: Alert[] = [
  {
    id: 'travel-rule-2026',
    severity: 'critical',
    title: 'VARA Travel Rule Enforcement — March 2026',
    description: 'FATF Travel Rule enforcement has been in effect since March 2026. Non-compliant VASPs face license suspension. Ensure your IVMS 101 solution is implemented and tested with counterparty VASPs. This is not optional — VARA has confirmed enforcement action against non-compliant entities.',
    date: 'In effect since March 2026',
    jurisdiction: 'VARA',
    category: 'Regulation',
    isNew: true,
    sourceUrl: 'https://www.vara.ae/en/regulations',
  },
  {
    id: 'adgm-capital',
    severity: 'critical',
    title: 'ADGM Capital Requirements — Immediate Compliance',
    description: 'FSRA implemented new capital adequacy requirements for digital asset firms effective June 2025. There is no phase-in period — existing licensees must comply immediately. Failure to meet the new thresholds can result in license conditions or revocation.',
    date: 'Effective: June 2025',
    jurisdiction: 'ADGM',
    category: 'Regulation',
    isNew: false,
    sourceUrl: 'https://www.adgm.com/setting-up/digital-assets',
  },
  {
    id: 'vara-q1-returns',
    severity: 'high',
    title: 'VARA Q1 2026 Compliance Returns Due',
    description: 'Quarterly compliance returns due within 30 days of quarter end. Late submissions trigger supervisory escalation and may affect your license standing. Ensure transaction volumes, AML metrics, and incident reports are compiled.',
    date: 'Due: April 30, 2026',
    jurisdiction: 'VARA',
    category: 'Filing',
    isNew: true,
    sourceUrl: 'https://www.vara.ae/en/compliance-reporting',
  },
  {
    id: 'cbb-sandbox-review',
    severity: 'high',
    title: 'CBB Sandbox Cohort Review — Q2 2026',
    description: 'CBB is conducting its periodic sandbox cohort review. Companies in the sandbox must demonstrate progress toward full licensing requirements. Underperforming participants may be exited from the program.',
    date: 'Review: Q2 2026',
    jurisdiction: 'CBB',
    category: 'Supervision',
    isNew: false,
    sourceUrl: 'https://www.cbb.gov.bh/fintech/',
  },
  {
    id: 'vara-marketing-crackdown',
    severity: 'high',
    title: 'VARA Marketing Compliance Enforcement',
    description: 'VARA has intensified enforcement against unlicensed promotion. Any public marketing of virtual asset services without a valid VARA license — including social media — is subject to penalties up to AED 600K and criminal referral.',
    date: 'Ongoing',
    jurisdiction: 'VARA',
    category: 'Enforcement',
    isNew: false,
    sourceUrl: 'https://www.vara.ae/en/enforcement-actions',
  },
  {
    id: 'adgm-penalties',
    severity: 'medium',
    title: 'ADGM Published $8.85M Penalty Summary',
    description: 'ADGM FSRA published its cumulative penalty summary totalling $8.85M across digital asset firms. Common violations: inadequate AML controls, failure to maintain minimum capital, and non-disclosure of material changes.',
    date: 'Published: March 2026',
    jurisdiction: 'ADGM',
    category: 'Enforcement',
    isNew: true,
    sourceUrl: 'https://www.adgm.com/media/announcements',
  },
  {
    id: 'vara-mlro-residency',
    severity: 'medium',
    title: 'VARA MLRO Residency Reminder',
    description: 'VARA requires all licensed VASPs to maintain a UAE-resident MLRO at all times. If your current MLRO is relocating or resigning, notify VARA immediately and appoint an interim within 5 business days.',
    date: 'Ongoing requirement',
    jurisdiction: 'VARA',
    category: 'Personnel',
    isNew: false,
    sourceUrl: 'https://www.vara.ae/en/licensing-requirements',
  },
  {
    id: 'cbb-cross-border',
    severity: 'info',
    title: 'CBB Cross-Border Guidance Update',
    description: 'CBB issued updated guidance on cross-border virtual asset services. Entities licensed in Bahrain serving customers in other GCC states must obtain separate authorization in each jurisdiction. Passporting is not available.',
    date: 'Published: February 2026',
    jurisdiction: 'CBB',
    category: 'Regulation',
    isNew: false,
    sourceUrl: 'https://www.cbb.gov.bh/regulations/',
  },
  {
    id: 'vara-stablecoin-framework',
    severity: 'critical',
    title: 'VARA Stablecoin Regulation — Dual Approval Required',
    description: 'VARA has formalized stablecoin issuance under a dedicated license category requiring AED 50M minimum capital. AED-pegged stablecoins also require Central Bank of the UAE (CBUAE) approval — issuers need dual regulatory sign-off. Reserve requirements mandate 1:1 fiat backing in segregated UAE bank accounts with monthly independent attestation. Algorithmic stablecoins are explicitly prohibited.',
    date: 'Effective: Q1 2026',
    jurisdiction: 'VARA',
    category: 'Regulation',
    isNew: true,
    sourceUrl: 'https://www.vara.ae/en/regulations',
  },
  {
    id: 'adgm-frt-rules',
    severity: 'high',
    title: 'ADGM Fiat-Referenced Token (FRT) Framework Published',
    description: 'FSRA published final rules for Fiat-Referenced Token issuers. USD 8M minimum capital, HQLA reserve requirements, real-time reserve monitoring, quarterly stress testing, and immediate par-value redemption guarantees. Algorithmic stablecoins are banned. Existing stablecoin operators in ADGM must apply for FRT authorization within 6 months.',
    date: 'Published: March 2026',
    jurisdiction: 'ADGM',
    category: 'Regulation',
    isNew: true,
    sourceUrl: 'https://www.adgm.com/setting-up/digital-assets',
  },
  {
    id: 'cbuae-payment-tokens',
    severity: 'high',
    title: 'CBUAE Payment Token Regulation — Onshore Backing Required',
    description: 'The Central Bank of the UAE issued directives requiring all AED-denominated payment tokens (stablecoins) to maintain reserves exclusively in UAE-based banks. Foreign reserve backing is no longer sufficient. Existing issuers have 90 days to comply. This affects Tether (USDT) and Circle (USDC) operations involving AED on/off ramps.',
    date: 'Effective: June 2026',
    jurisdiction: 'VARA',
    category: 'Regulation',
    isNew: true,
    sourceUrl: 'https://www.centralbank.ae/en/regulations',
  },
  {
    id: 'cma-sa-framework',
    severity: 'high',
    title: 'Saudi CMA Digital Asset Framework — Draft Published',
    description: 'The Capital Market Authority of Saudi Arabia has published a draft regulatory framework for digital assets. Comments open until Q3 2026. This signals Saudi Arabia is moving toward formal VASP licensing — monitor for final rules.',
    date: 'Draft: Q2 2026',
    jurisdiction: 'CMA-SA',
    category: 'Regulation',
    isNew: true,
    sourceUrl: 'https://cma.org.sa/en/Pages/default.aspx',
  },
  {
    id: 'qfc-custody',
    severity: 'medium',
    title: 'QFC Custody Standards for Digital Assets',
    description: 'Qatar Financial Centre Authority introduced custody and safeguarding standards for digital asset service providers operating within the QFC. Entities must appoint a qualified custodian or obtain a custody license.',
    date: 'Effective: July 2026',
    jurisdiction: 'QFC',
    category: 'Regulation',
    isNew: true,
    sourceUrl: 'https://www.qfc.qa/en/Pages/default.aspx',
  },
]

const SEVERITY_STYLES = {
  critical: { border: 'border-l-red-600', bg: 'bg-red-50', badge: 'bg-red-100 text-red-700', label: 'Critical' },
  high: { border: 'border-l-orange-500', bg: 'bg-orange-50', badge: 'bg-orange-100 text-orange-700', label: 'High' },
  medium: { border: 'border-l-amber-500', bg: 'bg-amber-50', badge: 'bg-amber-100 text-amber-700', label: 'Medium' },
  info: { border: 'border-l-blue-400', bg: 'bg-blue-50', badge: 'bg-blue-100 text-blue-700', label: 'Info' },
}

const CATEGORY_OPTIONS = ['All', 'Regulation', 'Enforcement', 'Filing', 'Supervision', 'Personnel']

const JURISDICTION_MAP: Record<string, string> = {
  vara: 'VARA',
  adgm: 'ADGM',
  'rak-dao': 'RAK-DAO',
  cbb: 'CBB',
  cbuae: 'CBUAE',
  'cma-sa': 'CMA-SA',
  qfcra: 'QFC',
  'cma-om': 'CMA-OM',
  'cma-kw': 'CMA-KW',
  'cbe-eg': 'CBE',
  'bam-ma': 'BAM',
  'cbj-jo': 'CBJ',
  'bct-tn': 'BCT',
  'bdl-lb': 'BDL',
  'cbi-iq': 'CBI',
  'cbl-ly': 'CBL',
}

const ALERTS_STATE_KEY = 'zawda_alerts_state'

export function getUnreadAlertsCount(jurisdictions: string[]): number {
  const mapped = jurisdictions.map((j) => JURISDICTION_MAP[j]).filter(Boolean)
  let state: { readIds: string[]; dismissedIds: string[] } = { readIds: [], dismissedIds: [] }
  try {
    if (typeof localStorage !== 'undefined') {
      const stored = localStorage.getItem(ALERTS_STATE_KEY)
      if (stored) state = JSON.parse(stored)
    }
  } catch { /* ignore */ }
  return ALERTS.filter((a) => {
    if (state.dismissedIds.includes(a.id)) return false
    if (state.readIds.includes(a.id)) return false
    if (mapped.length > 0 && !mapped.includes(a.jurisdiction)) return false
    return a.isNew
  }).length
}

interface AlertsState {
  readIds: string[]
  dismissedIds: string[]
}

function loadAlertsState(): AlertsState {
  try {
    const stored = localStorage.getItem(ALERTS_STATE_KEY)
    if (stored) return JSON.parse(stored)
  } catch { /* ignore */ }
  return { readIds: [], dismissedIds: [] }
}

function saveAlertsState(state: AlertsState) {
  try { localStorage.setItem(ALERTS_STATE_KEY, JSON.stringify(state)) } catch { /* ignore */ }
}

export function AlertsView({ jurisdictions }: { jurisdictions?: string[] }) {
  // Build available jurisdiction options based on user's selected jurisdictions
  const relevantJurisdictions = jurisdictions
    ?.map((j) => JURISDICTION_MAP[j])
    .filter(Boolean) ?? []

  const [categoryFilter, setCategoryFilter] = useState('All')
  const [jurisdictionFilter, setJurisdictionFilter] = useState(relevantJurisdictions.length > 0 ? 'My Jurisdictions' : 'All Jurisdictions')
  const [alertsState, setAlertsState] = useState<AlertsState>({ readIds: [], dismissedIds: [] })
  const [loaded, setLoaded] = useState(false)

  // Load read/dismissed state from localStorage
  useEffect(() => {
    setAlertsState(loadAlertsState())
    setLoaded(true)
  }, [])

  const allJurisdictions = Array.from(new Set(ALERTS.map((a) => a.jurisdiction)))
  const jurisdictionOptions = relevantJurisdictions.length > 0
    ? ['My Jurisdictions', 'All Jurisdictions', ...relevantJurisdictions]
    : ['All Jurisdictions', ...allJurisdictions]

  // Filter alerts: exclude dismissed, apply category/jurisdiction filters
  const visibleAlerts = ALERTS.filter((a) => !alertsState.dismissedIds.includes(a.id))

  // If user has jurisdictions selected, default to showing only relevant alerts
  const filtered = visibleAlerts.filter((a) => {
    if (categoryFilter !== 'All' && a.category !== categoryFilter) return false
    if (jurisdictionFilter === 'All Jurisdictions') return true
    if (jurisdictionFilter === 'My Jurisdictions') {
      return relevantJurisdictions.includes(a.jurisdiction)
    }
    if (a.jurisdiction !== jurisdictionFilter) return false
    return true
  })

  const updateState = useCallback((updater: (prev: AlertsState) => AlertsState) => {
    setAlertsState((prev) => {
      const next = updater(prev)
      saveAlertsState(next)
      return next
    })
  }, [])

  function markAsRead(id: string) {
    updateState((prev) => ({
      ...prev,
      readIds: prev.readIds.includes(id) ? prev.readIds : [...prev.readIds, id],
    }))
  }

  function dismissAlert(id: string) {
    updateState((prev) => ({
      ...prev,
      dismissedIds: prev.dismissedIds.includes(id) ? prev.dismissedIds : [...prev.dismissedIds, id],
    }))
  }

  function restoreAll() {
    updateState(() => ({ readIds: [], dismissedIds: [] }))
  }

  const criticalCount = visibleAlerts.filter((a) => a.severity === 'critical' && (relevantJurisdictions.length > 0 ? relevantJurisdictions.includes(a.jurisdiction) : true)).length
  const unreadCount = filtered.filter((a) => !alertsState.readIds.includes(a.id)).length

  if (!loaded) return null

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-display font-bold text-text text-[length:var(--text-lg)]">Compliance Alerts</h1>
          <p className="text-text-muted text-[length:var(--text-sm)]">
            {relevantJurisdictions.length > 0
              ? `Showing alerts for ${relevantJurisdictions.join(', ')} — your selected jurisdictions`
              : 'Regulatory changes, enforcement actions, and filing deadlines across MENA'}
          </p>
        </div>
        <select
          value={jurisdictionFilter}
          onChange={(e) => setJurisdictionFilter(e.target.value)}
          className="px-4 py-2.5 rounded-xl border border-border bg-bg-primary text-text text-[length:var(--text-sm)] focus:outline-none focus:border-gold cursor-pointer"
          aria-label="Filter by jurisdiction"
        >
          {jurisdictionOptions.map((j) => (
            <option key={j} value={j}>{j}</option>
          ))}
        </select>
      </div>

      {/* Summary */}
      <div className="grid sm:grid-cols-4 gap-4">
        <div className="bg-bg-primary border border-border rounded-xl p-4">
          <p className="font-mono text-text-faint text-[length:var(--text-xs)] uppercase">Total Alerts</p>
          <p className="font-mono text-text font-bold text-[length:var(--text-lg)] mt-1">{filtered.length}</p>
        </div>
        <div className="bg-bg-primary border border-red-200 rounded-xl p-4">
          <p className="font-mono text-text-faint text-[length:var(--text-xs)] uppercase">Critical</p>
          <p className="font-mono text-red-600 font-bold text-[length:var(--text-lg)] mt-1">{criticalCount}</p>
        </div>
        <div className="bg-bg-primary border border-border rounded-xl p-4">
          <p className="font-mono text-text-faint text-[length:var(--text-xs)] uppercase">Unread</p>
          <p className="font-mono text-gold font-bold text-[length:var(--text-lg)] mt-1">{unreadCount}</p>
        </div>
        <div className="bg-bg-primary border border-border rounded-xl p-4">
          <p className="font-mono text-text-faint text-[length:var(--text-xs)] uppercase">Jurisdictions</p>
          <p className="font-mono text-text font-bold text-[length:var(--text-lg)] mt-1">{relevantJurisdictions.length}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-3">
        <div className="flex gap-2 flex-wrap">
          {CATEGORY_OPTIONS.map((cat) => (
            <button
              key={cat}
              onClick={() => setCategoryFilter(cat)}
              className={`px-3 py-1.5 rounded-lg text-[length:var(--text-xs)] font-medium cursor-pointer transition-colors ${
                categoryFilter === cat ? 'bg-gold text-white' : 'bg-bg-surface text-text-muted hover:text-text'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
        {alertsState.dismissedIds.length > 0 && (
          <button
            onClick={restoreAll}
            className="sm:ml-auto text-gold text-[length:var(--text-xs)] hover:underline cursor-pointer whitespace-nowrap"
          >
            Restore dismissed ({alertsState.dismissedIds.length})
          </button>
        )}
      </div>

      {/* Alert list */}
      <div className="space-y-3">
        {filtered.map((alert) => {
          const style = SEVERITY_STYLES[alert.severity]
          const isRead = alertsState.readIds.includes(alert.id)
          return (
            <div key={alert.id} className={`border-l-4 ${style.border} ${style.bg} rounded-xl p-5 ${isRead ? 'opacity-75' : ''}`}>
              <div className="flex items-start gap-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <span className={`px-2 py-0.5 rounded text-[length:var(--text-xs)] font-bold uppercase ${style.badge}`}>
                      {style.label}
                    </span>
                    <span className="font-mono text-text-faint text-[length:var(--text-xs)]">{alert.jurisdiction}</span>
                    <span className="text-text-faint text-[length:var(--text-xs)]">&middot;</span>
                    <span className="text-text-faint text-[length:var(--text-xs)]">{alert.category}</span>
                    <span className="text-text-faint text-[length:var(--text-xs)]">&middot;</span>
                    <span className="text-text-faint text-[length:var(--text-xs)]">{alert.date}</span>
                    {alert.isNew && !isRead && (
                      <span className="bg-gold text-white text-[length:var(--text-xs)] font-bold px-2 py-0.5 rounded-full">New</span>
                    )}
                    {isRead && (
                      <span className="text-text-faint text-[length:var(--text-xs)] italic">Read</span>
                    )}
                  </div>
                  <a
                    href={alert.sourceUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-text font-medium text-[length:var(--text-sm)] hover:text-gold transition-colors"
                    onClick={() => markAsRead(alert.id)}
                  >
                    {alert.title}
                    <span className="text-gold ml-1.5 text-[length:var(--text-xs)]">&#8599;</span>
                  </a>
                  <p className="text-text-muted text-[length:var(--text-xs)] mt-1.5 leading-relaxed">{alert.description}</p>
                </div>
                <div className="flex flex-col gap-1.5 shrink-0">
                  {!isRead && (
                    <button
                      onClick={() => markAsRead(alert.id)}
                      className="px-2.5 py-1 rounded-lg bg-bg-primary border border-border text-text-muted text-[length:var(--text-xs)] hover:text-text hover:border-gold transition-colors cursor-pointer"
                      title="Mark as read"
                    >
                      &#10003; Read
                    </button>
                  )}
                  <button
                    onClick={() => dismissAlert(alert.id)}
                    className="px-2.5 py-1 rounded-lg bg-bg-primary border border-border text-text-faint text-[length:var(--text-xs)] hover:text-red-500 hover:border-red-300 transition-colors cursor-pointer"
                    title="Dismiss alert"
                  >
                    &#10005; Dismiss
                  </button>
                </div>
              </div>
            </div>
          )
        })}
        {filtered.length === 0 && (
          <div className="text-center py-12 text-text-faint text-[length:var(--text-sm)]">
            No alerts match your filters.
            {alertsState.dismissedIds.length > 0 && (
              <button onClick={restoreAll} className="block mx-auto mt-2 text-gold hover:underline cursor-pointer">
                Restore dismissed alerts
              </button>
            )}
          </div>
        )}
      </div>

      {/* Subscription CTA */}
      <div className="bg-bg-primary border border-gold/30 rounded-2xl p-6 text-center">
        <p className="text-text font-display font-bold text-[length:var(--text-base)]">Get alerts before they become findings</p>
        <p className="text-text-muted text-[length:var(--text-sm)] mt-2">
          Intelligence subscribers receive same-day alerts when regulations change. Advisory subscribers get enforcement response guidance within 48 hours.
        </p>
        <button className="mt-4 px-6 py-2.5 bg-gold text-white rounded-xl text-[length:var(--text-sm)] font-medium hover:brightness-110 transition-all cursor-pointer">
          Upgrade to Intelligence
        </button>
      </div>
    </div>
  )
}
