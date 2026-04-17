'use client'

import { useState } from 'react'

interface CalendarEvent {
  id: string
  title: string
  date: string
  jurisdiction: string
  category: 'filing' | 'deadline' | 'renewal' | 'audit' | 'regulatory'
  severity: 'critical' | 'high' | 'medium' | 'info'
  description: string
  daysUntil: number
}

const CATEGORY_LABELS: Record<string, { label: string; color: string; icon: string }> = {
  filing: { label: 'Filing', color: 'bg-blue-50 text-blue-700 border-blue-200', icon: '&#128196;' },
  deadline: { label: 'Deadline', color: 'bg-red-50 text-red-700 border-red-200', icon: '&#9200;' },
  renewal: { label: 'Renewal', color: 'bg-purple-50 text-purple-700 border-purple-200', icon: '&#128260;' },
  audit: { label: 'Audit', color: 'bg-orange-50 text-orange-700 border-orange-200', icon: '&#128269;' },
  regulatory: { label: 'Regulatory', color: 'bg-emerald-50 text-emerald-700 border-emerald-200', icon: '&#128220;' },
}

function getDaysUntil(dateStr: string): number {
  const target = new Date(dateStr)
  const now = new Date()
  now.setHours(0, 0, 0, 0)
  target.setHours(0, 0, 0, 0)
  return Math.ceil((target.getTime() - now.getTime()) / 86400000)
}

function buildEvents(jurisdictions: string[]): CalendarEvent[] {
  const allEvents: Omit<CalendarEvent, 'daysUntil'>[] = [
    // VARA events
    { id: 'vara-q1-returns', title: 'VARA Q1 2026 Compliance Returns', date: '2026-04-30', jurisdiction: 'VARA', category: 'filing', severity: 'high', description: 'Quarterly compliance returns due. Include transaction volumes, AML metrics, incident reports, and staffing changes.' },
    { id: 'vara-travel-rule', title: 'VARA Travel Rule Enforcement', date: '2026-03-31', jurisdiction: 'VARA', category: 'deadline', severity: 'critical', description: 'FATF Travel Rule enforcement begins. Non-compliant VASPs face license suspension. IVMS 101 solution must be implemented.' },
    { id: 'vara-annual-audit', title: 'VARA Annual External Audit Submission', date: '2026-06-30', jurisdiction: 'VARA', category: 'audit', severity: 'high', description: 'Annual external audit report due to VARA. Must include financial statements, AML effectiveness review, and technology security assessment.' },
    { id: 'vara-mlro-attestation', title: 'VARA MLRO Annual Attestation', date: '2026-05-15', jurisdiction: 'VARA', category: 'filing', severity: 'medium', description: 'Annual MLRO attestation confirming AML/CFT framework effectiveness, training completion, and SAR filing compliance.' },
    { id: 'vara-q2-returns', title: 'VARA Q2 2026 Compliance Returns', date: '2026-07-30', jurisdiction: 'VARA', category: 'filing', severity: 'high', description: 'Quarterly compliance returns for Q2. Same format as Q1 — transaction volumes, AML metrics, incident reports.' },
    { id: 'vara-stablecoin-reg', title: 'VARA Stablecoin License Applications Open', date: '2026-05-01', jurisdiction: 'VARA', category: 'regulatory', severity: 'medium', description: 'Formal applications for stablecoin issuance licenses under the new framework. AED 50M minimum capital required.' },

    // ADGM events
    { id: 'adgm-capital-review', title: 'ADGM Capital Adequacy Self-Assessment', date: '2026-04-15', jurisdiction: 'ADGM', category: 'filing', severity: 'critical', description: 'Submit capital adequacy self-assessment to FSRA. New requirements effective — no phase-in period.' },
    { id: 'adgm-frt-deadline', title: 'ADGM FRT Authorization Deadline', date: '2026-09-30', jurisdiction: 'ADGM', category: 'deadline', severity: 'high', description: 'Existing stablecoin operators must apply for Fiat-Referenced Token authorization within 6 months of rule publication.' },
    { id: 'adgm-annual-return', title: 'ADGM Annual Regulatory Return', date: '2026-03-31', jurisdiction: 'ADGM', category: 'filing', severity: 'high', description: 'Annual regulatory return covering financial year 2025. Include audited financials, compliance officer report, and client statistics.' },
    { id: 'adgm-license-renewal', title: 'ADGM License Annual Renewal', date: '2026-06-15', jurisdiction: 'ADGM', category: 'renewal', severity: 'high', description: 'Annual license renewal. Submit updated business plan, financial projections, and any material changes to operations.' },
    { id: 'adgm-pen-test', title: 'ADGM Annual Penetration Test Report', date: '2026-05-31', jurisdiction: 'ADGM', category: 'audit', severity: 'medium', description: 'Annual penetration testing report due to FSRA. Must be conducted by an independent, qualified security firm.' },

    // CBB events
    { id: 'cbb-sandbox-review', title: 'CBB Sandbox Cohort Review', date: '2026-06-01', jurisdiction: 'CBB', category: 'audit', severity: 'high', description: 'Periodic review of sandbox participants. Demonstrate progress toward full licensing. Underperforming participants may be exited.' },
    { id: 'cbb-aml-annual', title: 'CBB Annual AML/CFT Compliance Report', date: '2026-04-30', jurisdiction: 'CBB', category: 'filing', severity: 'high', description: 'Annual AML/CFT compliance report to CBB. Include SAR statistics, training records, risk assessment updates, and sanctions screening results.' },
    { id: 'cbb-capital-return', title: 'CBB Quarterly Capital Return', date: '2026-04-15', jurisdiction: 'CBB', category: 'filing', severity: 'medium', description: 'Quarterly capital adequacy return. Report current capital levels against minimum requirements.' },
    { id: 'cbb-license-renewal', title: 'CBB License Annual Renewal', date: '2026-07-01', jurisdiction: 'CBB', category: 'renewal', severity: 'high', description: 'Annual license renewal submission. Include updated governance documents and financial statements.' },

    // CBUAE events
    { id: 'cbuae-payment-token', title: 'CBUAE Payment Token Reserve Compliance', date: '2026-06-30', jurisdiction: 'CBUAE', category: 'deadline', severity: 'critical', description: 'AED-denominated payment tokens must maintain reserves exclusively in UAE-based banks. 90-day compliance window.' },

    // CMA-SA events
    { id: 'cma-sa-consultation', title: 'Saudi CMA Digital Asset Framework — Comment Period Closes', date: '2026-09-30', jurisdiction: 'CMA-SA', category: 'regulatory', severity: 'medium', description: 'Public comment period for draft digital asset regulatory framework. Submit feedback to influence final rules.' },

    // QFCRA events
    { id: 'qfc-custody-deadline', title: 'QFC Digital Asset Custody Standards Effective', date: '2026-07-01', jurisdiction: 'QFCRA', category: 'deadline', severity: 'medium', description: 'New custody and safeguarding standards take effect. Entities must appoint a qualified custodian or obtain a custody license.' },
  ]

  const jurisdictionMap: Record<string, string> = {
    vara: 'VARA', adgm: 'ADGM', cbb: 'CBB', 'rak-dao': 'RAK-DAO',
    'cma-sa': 'CMA-SA', qfcra: 'QFCRA', cbuae: 'CBUAE',
    'cma-om': 'CMA-OM', 'cma-kw': 'CMA-KW',
  }

  const userJurisdictions = jurisdictions.map(j => jurisdictionMap[j] ?? j.toUpperCase())

  return allEvents
    .filter(e => userJurisdictions.length === 0 || userJurisdictions.includes(e.jurisdiction))
    .map(e => ({ ...e, daysUntil: getDaysUntil(e.date) }))
    .sort((a, b) => a.daysUntil - b.daysUntil)
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

function getDaysLabel(days: number): { text: string; color: string } {
  if (days < 0) return { text: `${Math.abs(days)}d overdue`, color: 'text-red-600 bg-red-50' }
  if (days === 0) return { text: 'Today', color: 'text-red-600 bg-red-50' }
  if (days <= 7) return { text: `${days}d`, color: 'text-red-600 bg-red-50' }
  if (days <= 30) return { text: `${days}d`, color: 'text-orange-600 bg-orange-50' }
  if (days <= 90) return { text: `${days}d`, color: 'text-amber-600 bg-amber-50' }
  return { text: `${days}d`, color: 'text-emerald-600 bg-emerald-50' }
}

export function ComplianceCalendarView({ jurisdictions }: { jurisdictions?: string[] }) {
  const [filter, setFilter] = useState<string>('all')
  const [showPast, setShowPast] = useState(false)

  const events = buildEvents(jurisdictions ?? [])
  const upcoming = events.filter(e => e.daysUntil >= 0)
  const overdue = events.filter(e => e.daysUntil < 0)
  const displayEvents = showPast ? events : upcoming

  const filtered = filter === 'all'
    ? displayEvents
    : displayEvents.filter(e => e.category === filter)

  const urgentCount = upcoming.filter(e => e.daysUntil <= 14).length
  const thisMonthCount = upcoming.filter(e => e.daysUntil <= 30).length
  const criticalCount = upcoming.filter(e => e.severity === 'critical').length

  const categories = ['all', 'filing', 'deadline', 'renewal', 'audit', 'regulatory']

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display font-bold text-text text-[length:var(--text-lg)]">Compliance Calendar</h1>
        <p className="text-text-muted text-[length:var(--text-sm)]">
          Filing deadlines, regulatory events, and compliance milestones for your jurisdictions
        </p>
      </div>

      {/* Summary cards */}
      <div className="grid sm:grid-cols-4 gap-4">
        <div className="bg-bg-primary border border-red-200 rounded-xl p-4">
          <p className="font-mono text-text-faint text-[length:var(--text-xs)] uppercase">Urgent (14d)</p>
          <p className="font-mono text-red-600 font-bold text-[length:var(--text-lg)] mt-1">{urgentCount}</p>
        </div>
        <div className="bg-bg-primary border border-border rounded-xl p-4">
          <p className="font-mono text-text-faint text-[length:var(--text-xs)] uppercase">This Month</p>
          <p className="font-mono text-gold font-bold text-[length:var(--text-lg)] mt-1">{thisMonthCount}</p>
        </div>
        <div className="bg-bg-primary border border-border rounded-xl p-4">
          <p className="font-mono text-text-faint text-[length:var(--text-xs)] uppercase">Critical</p>
          <p className="font-mono text-alert font-bold text-[length:var(--text-lg)] mt-1">{criticalCount}</p>
        </div>
        <div className="bg-bg-primary border border-border rounded-xl p-4">
          <p className="font-mono text-text-faint text-[length:var(--text-xs)] uppercase">Total Upcoming</p>
          <p className="font-mono text-text font-bold text-[length:var(--text-lg)] mt-1">{upcoming.length}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
        <div className="flex gap-2 flex-wrap">
          {categories.map(cat => {
            const meta = cat === 'all' ? { label: 'All', color: '', icon: '' } : CATEGORY_LABELS[cat]
            return (
              <button
                key={cat}
                onClick={() => setFilter(cat)}
                className={`px-3 py-1.5 rounded-lg text-[length:var(--text-xs)] font-medium cursor-pointer transition-colors ${
                  filter === cat ? 'bg-gold text-white' : 'bg-bg-surface text-text-muted hover:text-text'
                }`}
              >
                {meta.label}
              </button>
            )
          })}
        </div>
        {overdue.length > 0 && (
          <button
            onClick={() => setShowPast(!showPast)}
            className="text-[length:var(--text-xs)] text-red-600 hover:underline cursor-pointer font-medium"
          >
            {showPast ? 'Hide overdue' : `Show ${overdue.length} overdue`}
          </button>
        )}
      </div>

      {/* Timeline */}
      <div className="space-y-3">
        {filtered.map(event => {
          const cat = CATEGORY_LABELS[event.category]
          const daysInfo = getDaysLabel(event.daysUntil)

          return (
            <div
              key={event.id}
              className={`bg-bg-primary border border-border rounded-xl p-5 ${event.daysUntil < 0 ? 'opacity-75' : ''}`}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                    <span
                      className={`text-[length:var(--text-xs)] px-2 py-0.5 rounded-full border font-medium ${cat.color}`}
                      dangerouslySetInnerHTML={{ __html: `${cat.icon} ${cat.label}` }}
                    />
                    <span className="font-mono text-text-faint text-[length:var(--text-xs)]">{event.jurisdiction}</span>
                    <span className="text-text-faint text-[length:var(--text-xs)]">&middot;</span>
                    <span className="text-text-faint text-[length:var(--text-xs)]">{formatDate(event.date)}</span>
                  </div>
                  <p className="text-text font-medium text-[length:var(--text-sm)]">{event.title}</p>
                  <p className="text-text-muted text-[length:var(--text-xs)] mt-1 leading-relaxed">{event.description}</p>
                </div>
                <div className="shrink-0 text-right">
                  <span className={`inline-block font-mono font-bold text-[length:var(--text-sm)] px-2.5 py-1 rounded-lg ${daysInfo.color}`}>
                    {daysInfo.text}
                  </span>
                </div>
              </div>
            </div>
          )
        })}

        {filtered.length === 0 && (
          <div className="text-center py-12 text-text-faint text-[length:var(--text-sm)]">
            No events match your filters.
          </div>
        )}
      </div>

      {/* Export / Bot CTA */}
      <div className="bg-bg-primary border border-gold/30 rounded-2xl p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <p className="text-text font-display font-bold text-[length:var(--text-sm)]">Never miss a deadline</p>
          <p className="text-text-muted text-[length:var(--text-xs)] mt-0.5">
            Connect the Telegram bot to receive reminders 7 days before each filing deadline.
          </p>
        </div>
        <a
          href={process.env.NEXT_PUBLIC_TELEGRAM_BOT_URL ?? 'https://t.me/ZawdaBot'}
          target="_blank"
          rel="noopener noreferrer"
          className="shrink-0 inline-flex items-center gap-2 px-5 py-2.5 bg-[#0088cc] text-white text-[length:var(--text-xs)] font-medium rounded-lg hover:brightness-110 transition-all"
        >
          <svg viewBox="0 0 24 24" width="16" height="16" fill="white">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.8c-.15 1.58-.8 5.42-1.13 7.19-.14.75-.42 1-.68 1.03-.58.05-1.02-.38-1.58-.75-.88-.58-1.38-.94-2.23-1.5-.99-.65-.35-1.01.22-1.59.15-.15 2.71-2.48 2.76-2.69a.2.2 0 00-.05-.18c-.06-.05-.14-.03-.21-.02-.09.02-1.49.95-4.22 2.79-.4.27-.76.41-1.08.4-.36-.01-1.04-.2-1.55-.37-.63-.2-1.12-.31-1.08-.66.02-.18.27-.36.74-.55 2.92-1.27 4.86-2.11 5.83-2.51 2.78-1.16 3.35-1.36 3.73-1.36.08 0 .27.02.39.12.1.08.13.19.14.27-.01.06.01.24 0 .38z" />
          </svg>
          Set Up Reminders
        </a>
      </div>
    </div>
  )
}
