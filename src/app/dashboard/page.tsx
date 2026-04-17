'use client'

import { useState, useEffect } from 'react'

import { useOnboarding, type OnboardingData } from '@/lib/onboarding-context'
import { Sidebar } from '@/components/dashboard/Sidebar'
import { OverviewView } from '@/components/dashboard/OverviewView'
import { LicensingView } from '@/components/dashboard/LicensingView'
import { DocumentsView } from '@/components/dashboard/DocumentsView'
import { AlertsView, getUnreadAlertsCount } from '@/components/dashboard/AlertsView'
import { RiskAdvisoryView } from '@/components/dashboard/RiskAdvisoryView'
import { ComplianceCalendarView } from '@/components/dashboard/ComplianceCalendarView'
import { EnforcementTrackerView } from '@/components/dashboard/pro/EnforcementTrackerView'
import { AdvisorySessionsView } from '@/components/dashboard/pro/AdvisorySessionsView'
import { AuditPrepView } from '@/components/dashboard/pro/AuditPrepView'
import { GenericUpgradeView } from '@/components/dashboard/pro/UpgradeBanner'

export default function DashboardPage() {
  const { data, isComplete, isLoaded } = useOnboarding()
  const [activeNav, setActiveNav] = useState('overview')
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [alertsBadge, setAlertsBadge] = useState<number>(0)

  useEffect(() => {
    if (!isLoaded || !data) return
    const juris = [data.primaryJurisdiction, ...(data.additionalJurisdictions ?? [])].filter(Boolean) as string[]
    setAlertsBadge(getUnreadAlertsCount(juris))
  }, [isLoaded, data, activeNav])

  // Wait for localStorage to load before making routing decisions
  if (!isLoaded) return null

  // Redirect to onboarding if not completed
  if (!isComplete) {
    if (typeof window !== 'undefined') {
      window.location.href = '/onboarding'
    }
    return null
  }

  function renderView() {
    switch (activeNav) {
      case 'overview':
        return <OverviewView onNavigate={setActiveNav} />
      case 'calendar':
        if (data.entityStatus !== 'established') {
          return <CalendarLockedView onGoToSettings={() => setActiveNav('settings')} />
        }
        return <ComplianceCalendarView jurisdictions={[data.primaryJurisdiction, ...data.additionalJurisdictions].filter(Boolean)} />
      case 'licensing':
        return <LicensingView defaultJurisdiction={data.primaryJurisdiction} />
      case 'documents':
        return <DocumentsView jurisdictions={[data.primaryJurisdiction, ...data.additionalJurisdictions].filter(Boolean)} />
      case 'alerts':
        return <AlertsView jurisdictions={[data.primaryJurisdiction, ...data.additionalJurisdictions].filter(Boolean)} />
      case 'risks':
        return <RiskAdvisoryView jurisdictions={[data.primaryJurisdiction, ...data.additionalJurisdictions].filter(Boolean)} />
      case 'settings':
        return <SettingsView />
      default:
        if (activeNav.startsWith('pro-')) return <ProUpgradeView feature={activeNav} jurisdictions={[data.primaryJurisdiction, ...data.additionalJurisdictions].filter(Boolean)} />
        return <OverviewView onNavigate={setActiveNav} />
    }
  }

  return (
    <div className="min-h-screen bg-bg-surface flex">
      <button
        onClick={() => setSidebarOpen(!sidebarOpen)}
        className="lg:hidden fixed top-4 left-4 z-50 w-10 h-10 rounded-xl bg-bg-primary border border-border flex items-center justify-center shadow-sm cursor-pointer"
        aria-label="Toggle sidebar"
      >
        <span className="text-text text-lg">{sidebarOpen ? '✕' : '☰'}</span>
      </button>

      <Sidebar
        activeNav={activeNav}
        onNavigate={setActiveNav}
        sidebarOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        companyName={data.companyName}
        licensingStage={data.licensingStage}
        alertsBadge={alertsBadge}
        entityStatus={data.entityStatus}
      />

      <main className="flex-1 min-w-0 px-6 lg:px-10 py-8 lg:py-10">
        <div className="max-w-5xl mx-auto lg:pl-0 pl-8">
          {renderView()}
        </div>
      </main>
    </div>
  )
}

function SettingsView() {
  const { data, update } = useOnboarding()
  const [editing, setEditing] = useState<string | null>(null)
  const [editValues, setEditValues] = useState<Record<string, string>>({})
  const [notifications, setNotifications] = useState({
    enforcementActions: true,
    filingDeadlines: true,
    regulatoryChanges: true,
    weeklyBrief: true,
    monthlyReport: false,
  })

  // Load notification prefs from localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem('zawda_notification_prefs')
      if (stored) setNotifications(JSON.parse(stored))
    } catch { /* ignore */ }
  }, [])

  function saveNotifications(next: typeof notifications) {
    setNotifications(next)
    try { localStorage.setItem('zawda_notification_prefs', JSON.stringify(next)) } catch { /* ignore */ }
  }

  function startEdit(field: string, currentValue: string) {
    setEditing(field)
    setEditValues((prev) => ({ ...prev, [field]: currentValue }))
  }

  function saveEdit(field: string) {
    const value = editValues[field]?.trim()
    if (!value) { setEditing(null); return }
    if (field === 'companyName') update({ companyName: value })
    else if (field === 'companyWebsite') update({ companyWebsite: value })
    else if (field === 'role') update({ role: value })
    else if (field === 'teamSize') update({ teamSize: value as OnboardingData['teamSize'] })
    setEditing(null)
  }

  const ENTITY_OPTIONS = [
    { value: 'not-started', label: 'Not Started' },
    { value: 'in-progress', label: 'In Progress' },
    { value: 'established', label: 'Established' },
  ]

  const STAGE_OPTIONS = [
    { value: 'exploring', label: 'Exploring' },
    { value: 'pre-application', label: 'Pre-Application' },
    { value: 'application-in-progress', label: 'Application In Progress' },
    { value: 'licensed', label: 'Licensed' },
  ]

  function EditableField({ label, field, value }: { label: string; field: string; value: string }) {
    const isEditing = editing === field
    return (
      <div>
        <p className="text-text-faint text-[length:var(--text-xs)] uppercase mb-1">{label}</p>
        {isEditing ? (
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={editValues[field] ?? value}
              onChange={(e) => setEditValues((prev) => ({ ...prev, [field]: e.target.value }))}
              onKeyDown={(e) => e.key === 'Enter' && saveEdit(field)}
              className="flex-1 px-3 py-1.5 rounded-lg border border-gold bg-bg-primary text-text text-[length:var(--text-sm)] focus:outline-none"
              autoFocus
            />
            <button onClick={() => saveEdit(field)} className="text-gold text-[length:var(--text-xs)] font-medium cursor-pointer">Save</button>
            <button onClick={() => setEditing(null)} className="text-text-faint text-[length:var(--text-xs)] cursor-pointer">Cancel</button>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <p className="text-text text-[length:var(--text-sm)]">{value || '—'}</p>
            <button onClick={() => startEdit(field, value)} className="text-gold text-[length:var(--text-xs)] hover:underline cursor-pointer">Edit</button>
          </div>
        )}
      </div>
    )
  }

  function NotificationToggle({ label, description, checked, onChange }: { label: string; description: string; checked: boolean; onChange: (v: boolean) => void }) {
    return (
      <div className="flex items-start justify-between gap-4 py-3 border-b border-border last:border-0">
        <div>
          <p className="text-text text-[length:var(--text-sm)] font-medium">{label}</p>
          <p className="text-text-faint text-[length:var(--text-xs)] mt-0.5">{description}</p>
        </div>
        <button
          onClick={() => onChange(!checked)}
          className={`relative w-10 h-5 rounded-full transition-colors shrink-0 cursor-pointer ${checked ? 'bg-gold' : 'bg-border'}`}
          role="switch"
          aria-checked={checked}
        >
          <span className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white transition-transform shadow-sm ${checked ? 'translate-x-5' : ''}`} />
        </button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display font-bold text-text text-[length:var(--text-lg)]">Settings</h1>
        <p className="text-text-muted text-[length:var(--text-sm)]">Manage your account, jurisdictions, and notification preferences</p>
      </div>

      <div className="bg-bg-primary border border-border rounded-2xl p-6">
        <h2 className="font-display font-bold text-text text-[length:var(--text-base)] mb-4">Company Profile</h2>
        <div className="grid sm:grid-cols-2 gap-4">
          <EditableField label="Company" field="companyName" value={data.companyName} />
          <EditableField label="Website" field="companyWebsite" value={data.companyWebsite} />
          <div>
            <p className="text-text-faint text-[length:var(--text-xs)] uppercase mb-1">Entity Status</p>
            <select
              value={data.entityStatus}
              onChange={(e) => update({ entityStatus: e.target.value as OnboardingData['entityStatus'] })}
              className="px-3 py-1.5 rounded-lg border border-border bg-bg-primary text-text text-[length:var(--text-sm)] focus:outline-none focus:border-gold cursor-pointer"
            >
              {ENTITY_OPTIONS.map((opt) => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
            </select>
          </div>
          <EditableField label="Team Size" field="teamSize" value={data.teamSize} />
          <EditableField label="Your Role" field="role" value={data.role} />
          <div>
            <p className="text-text-faint text-[length:var(--text-xs)] uppercase mb-1">Work Email</p>
            <p className="text-text text-[length:var(--text-sm)]">{data.workEmail || '—'}</p>
          </div>
        </div>
      </div>

      <div className="bg-bg-primary border border-border rounded-2xl p-6">
        <h2 className="font-display font-bold text-text text-[length:var(--text-base)] mb-4">Licensing</h2>
        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <p className="text-text-faint text-[length:var(--text-xs)] uppercase mb-1">Stage</p>
            <select
              value={data.licensingStage}
              onChange={(e) => update({ licensingStage: e.target.value as OnboardingData['licensingStage'] })}
              className="px-3 py-1.5 rounded-lg border border-border bg-bg-primary text-text text-[length:var(--text-sm)] focus:outline-none focus:border-gold cursor-pointer"
            >
              {STAGE_OPTIONS.map((opt) => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
            </select>
          </div>
          <div>
            <p className="text-text-faint text-[length:var(--text-xs)] uppercase mb-1">Primary Jurisdiction</p>
            <p className="text-text text-[length:var(--text-sm)]">{data.primaryJurisdiction || '—'}</p>
          </div>
          {data.selectedLicense && (
            <div>
              <p className="text-text-faint text-[length:var(--text-xs)] uppercase mb-1">Selected License</p>
              <p className="text-text text-[length:var(--text-sm)] font-medium">{data.selectedLicense}</p>
            </div>
          )}
          <div className="sm:col-span-2">
            <p className="text-text-faint text-[length:var(--text-xs)] uppercase mb-1">Target Activities</p>
            <p className="text-text text-[length:var(--text-sm)]">{data.targetActivities.join(', ') || '—'}</p>
            <a href="/onboarding" className="text-gold text-[length:var(--text-xs)] hover:underline mt-1 inline-block">Edit activities in onboarding →</a>
          </div>
        </div>
      </div>

      {/* Telegram Bot */}
      <div className="bg-bg-primary border border-border rounded-2xl p-6">
        <h2 className="font-display font-bold text-text text-[length:var(--text-base)] mb-2">Regulatory Alert Bot</h2>
        <p className="text-text-muted text-[length:var(--text-xs)] mb-4">
          Get enforcement actions, regulatory changes, and deadline updates via Telegram — max 1-2 messages per week.
        </p>
        <div className="bg-bg-surface rounded-xl p-4 mb-4">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-xl bg-[#0088cc]/10 flex items-center justify-center shrink-0">
              <svg viewBox="0 0 24 24" width="20" height="20" fill="#0088cc">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.8c-.15 1.58-.8 5.42-1.13 7.19-.14.75-.42 1-.68 1.03-.58.05-1.02-.38-1.58-.75-.88-.58-1.38-.94-2.23-1.5-.99-.65-.35-1.01.22-1.59.15-.15 2.71-2.48 2.76-2.69a.2.2 0 00-.05-.18c-.06-.05-.14-.03-.21-.02-.09.02-1.49.95-4.22 2.79-.4.27-.76.41-1.08.4-.36-.01-1.04-.2-1.55-.37-.63-.2-1.12-.31-1.08-.66.02-.18.27-.36.74-.55 2.92-1.27 4.86-2.11 5.83-2.51 2.78-1.16 3.35-1.36 3.73-1.36.08 0 .27.02.39.12.1.08.13.19.14.27-.01.06.01.24 0 .38z" />
              </svg>
            </div>
            <div>
              <p className="text-text font-medium text-[length:var(--text-sm)]">Zawda Regulatory Bot</p>
              <p className="text-text-faint text-[length:var(--text-xs)]">Telegram</p>
            </div>
          </div>
          <a
            href={process.env.NEXT_PUBLIC_TELEGRAM_BOT_URL ?? 'https://t.me/ZawdaBot'}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-4 py-2 bg-[#0088cc] text-white text-[length:var(--text-xs)] font-medium rounded-lg hover:brightness-110 transition-all"
          >
            Connect on Telegram &#8594;
          </a>
          <p className="text-text-faint text-[length:var(--text-xs)] mt-3 leading-relaxed">
            Once connected, use <span className="font-mono">/jurisdictions</span> to set your tracked regions and <span className="font-mono">/frequency</span> to choose weekly, twice-weekly, or critical-only alerts.
          </p>
        </div>

        <p className="font-mono text-text-faint text-[length:var(--text-xs)] uppercase mb-2">What the bot tracks</p>
        <div className="grid grid-cols-2 gap-2 text-[length:var(--text-xs)]">
          <div className="flex items-center gap-2 text-text-muted"><span className="w-2 h-2 rounded-full bg-red-500 shrink-0" />Enforcement actions &#38; fines</div>
          <div className="flex items-center gap-2 text-text-muted"><span className="w-2 h-2 rounded-full bg-orange-500 shrink-0" />Regulatory framework changes</div>
          <div className="flex items-center gap-2 text-text-muted"><span className="w-2 h-2 rounded-full bg-amber-500 shrink-0" />Compliance deadline updates</div>
          <div className="flex items-center gap-2 text-text-muted"><span className="w-2 h-2 rounded-full bg-blue-500 shrink-0" />Consultation papers</div>
          <div className="flex items-center gap-2 text-text-muted"><span className="w-2 h-2 rounded-full bg-yellow-500 shrink-0" />New licenses granted</div>
          <div className="flex items-center gap-2 text-text-muted"><span className="w-2 h-2 rounded-full bg-red-700 shrink-0" />Sanctions list updates</div>
        </div>
      </div>

      {/* Notification Preferences */}
      <div className="bg-bg-primary border border-border rounded-2xl p-6">
        <h2 className="font-display font-bold text-text text-[length:var(--text-base)] mb-4">Notification Preferences</h2>
        <NotificationToggle
          label="Enforcement Actions"
          description="Immediate notification when enforcement actions are published in your jurisdictions"
          checked={notifications.enforcementActions}
          onChange={(v) => saveNotifications({ ...notifications, enforcementActions: v })}
        />
        <NotificationToggle
          label="Filing Deadlines"
          description="Reminders for upcoming filing and reporting deadlines"
          checked={notifications.filingDeadlines}
          onChange={(v) => saveNotifications({ ...notifications, filingDeadlines: v })}
        />
        <NotificationToggle
          label="Regulatory Changes"
          description="Alerts when regulatory frameworks are updated in your jurisdictions"
          checked={notifications.regulatoryChanges}
          onChange={(v) => saveNotifications({ ...notifications, regulatoryChanges: v })}
        />
        <NotificationToggle
          label="Weekly Digest (Email)"
          description="Curated weekly summary of regulatory developments delivered to your inbox every Monday"
          checked={notifications.weeklyBrief}
          onChange={(v) => saveNotifications({ ...notifications, weeklyBrief: v })}
        />
        <NotificationToggle
          label="Monthly Compliance Report"
          description="Comprehensive monthly compliance status report for your team"
          checked={notifications.monthlyReport}
          onChange={(v) => saveNotifications({ ...notifications, monthlyReport: v })}
        />
      </div>

      <div className="text-center">
        <a href="/onboarding" className="text-gold text-[length:var(--text-sm)] hover:underline">
          Re-run onboarding setup →
        </a>
      </div>
    </div>
  )
}

function CalendarLockedView({ onGoToSettings }: { onGoToSettings: () => void }) {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display font-bold text-text text-[length:var(--text-lg)]">Compliance Calendar</h1>
        <p className="text-text-muted text-[length:var(--text-sm)]">Filing deadlines, audits, and regulatory returns — tracked to the day</p>
      </div>

      <div className="relative overflow-hidden bg-gradient-to-br from-gold/5 via-bg-primary to-gold/5 border border-gold/20 rounded-2xl p-10 text-center">
        <div className="absolute inset-0 opacity-[0.04] pointer-events-none" aria-hidden="true"
          style={{ backgroundImage: 'radial-gradient(circle at 30% 20%, var(--gold) 0%, transparent 40%), radial-gradient(circle at 70% 80%, var(--gold) 0%, transparent 40%)' }} />
        <div className="relative">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gold/10 border border-gold/20 mb-5">
            <span className="text-gold text-[length:var(--text-xl)]">◆</span>
          </div>
          <p className="font-mono text-gold uppercase tracking-widest text-[length:var(--text-xs)] mb-3">Activates on Establishment</p>
          <h2 className="font-display font-bold text-text text-[length:var(--text-lg)] mb-3 max-w-lg mx-auto">
            Your compliance calendar begins the day your entity is established.
          </h2>
          <p className="text-text-muted text-[length:var(--text-sm)] max-w-xl mx-auto leading-relaxed mb-6">
            Filing deadlines, audit windows, and regulatory returns are anchored to your legal entity&apos;s formation date.
            Once your entity is established, this calendar unlocks with every deadline pre-populated for your jurisdictions.
          </p>
          <button
            onClick={onGoToSettings}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-gold text-white text-[length:var(--text-sm)] font-medium rounded-xl hover:brightness-110 transition-all cursor-pointer"
          >
            Update Entity Status in Settings &rarr;
          </button>
        </div>
      </div>

      <div className="grid sm:grid-cols-3 gap-4">
        {[
          { label: 'Filing deadlines', desc: 'Quarterly and annual returns, pre-populated per regulator' },
          { label: 'Audit windows', desc: 'Advance alerts on regulator audit cycles in your jurisdictions' },
          { label: 'Renewal cycles', desc: 'License renewal timing, capital attestation, MLRO reports' },
        ].map((f) => (
          <div key={f.label} className="bg-bg-primary border border-border rounded-xl p-5 opacity-70">
            <p className="font-mono text-text-faint text-[length:var(--text-xs)] uppercase mb-2">🔒 Locked</p>
            <p className="text-text font-medium text-[length:var(--text-sm)]">{f.label}</p>
            <p className="text-text-muted text-[length:var(--text-xs)] mt-1 leading-relaxed">{f.desc}</p>
          </div>
        ))}
      </div>
    </div>
  )
}

function ProUpgradeView({ feature, jurisdictions }: { feature: string; jurisdictions: string[] }) {
  switch (feature) {
    case 'pro-enforcement': return <EnforcementTrackerView jurisdictions={jurisdictions} />
    case 'pro-advisory': return <AdvisorySessionsView jurisdictions={jurisdictions} />
    case 'pro-audit-prep': return <AuditPrepView jurisdictions={jurisdictions} />
    default: return <GenericUpgradeView />
  }
}
