'use client'

import { BrandName } from '@/components/ui/BrandName'
import { BrandMark } from '@/components/ui/BrandMark'
import { SubscriptionBadge } from '@/components/ui/SubscriptionBadge'

export interface SidebarItem {
  id: string
  label: string
  icon: string
  badge?: number
  isPro?: boolean
}

const NAV_ITEMS: SidebarItem[] = [
  { id: 'overview', label: 'Overview', icon: '◻' },
  { id: 'calendar', label: 'Compliance Calendar', icon: '◆' },
  { id: 'licensing', label: 'Licensing Roadmap', icon: '◈' },
  { id: 'documents', label: 'Documents', icon: '◇' },
  { id: 'alerts', label: 'Compliance Alerts', icon: '◉' },
  { id: 'risks', label: 'Risk Advisory', icon: '⚠' },
  { id: 'settings', label: 'Settings', icon: '⚙' },
]

const PRO_ITEMS: SidebarItem[] = [
  { id: 'pro-enforcement', label: 'Enforcement Tracker', icon: '🔍', isPro: true },
  { id: 'pro-advisory', label: 'Advisory Sessions', icon: '💬', isPro: true },
  { id: 'pro-audit-prep', label: 'Audit Preparation', icon: '🛡', isPro: true },
]

const STAGE_LABELS: Record<string, string> = {
  'exploring': 'Exploring',
  'pre-application': 'Pre-Application',
  'application-in-progress': 'Application',
  'licensed': 'Licensed',
}

interface SidebarProps {
  activeNav: string
  onNavigate: (id: string) => void
  sidebarOpen: boolean
  onClose: () => void
  companyName?: string
  licensingStage?: string
  alertsBadge?: number
  entityStatus?: 'not-started' | 'in-progress' | 'established'
}

export function Sidebar({ activeNav, onNavigate, sidebarOpen, onClose, companyName, licensingStage, alertsBadge, entityStatus }: SidebarProps) {
  const initials = companyName
    ? companyName.split(' ').map((w) => w[0]).join('').slice(0, 2).toUpperCase()
    : 'Z'

  return (
    <>
      <aside
        className={`fixed lg:static inset-y-0 left-0 z-40 w-64 bg-bg-primary border-r border-border flex flex-col transition-transform duration-300 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        <div className="p-6 border-b border-border">
          <a href="/" className="flex items-center gap-2.5">
            <BrandMark size={28} className="text-gold shrink-0" />
            <BrandName className="font-display font-bold text-[length:var(--text-lg)] tracking-[0.08em] text-text uppercase" />
          </a>
          <p className="font-mono text-text-faint text-[length:var(--text-xs)] mt-1 ml-[38px]">Compliance Dashboard</p>
        </div>

        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {NAV_ITEMS.map((item) => {
            const badge = item.id === 'alerts' ? alertsBadge : item.badge
            const isCalendar = item.id === 'calendar'
            const calendarLocked = isCalendar && entityStatus !== 'established'
            return (
            <button
              key={item.id}
              onClick={() => { onNavigate(item.id); onClose() }}
              className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-[length:var(--text-sm)] transition-colors cursor-pointer ${
                activeNav === item.id
                  ? 'bg-gold-light text-text font-medium'
                  : calendarLocked
                  ? 'text-text-faint opacity-60 hover:bg-bg-surface hover:opacity-80'
                  : 'text-text-muted hover:bg-bg-surface hover:text-text'
              }`}
              title={calendarLocked ? 'Activates once entity status is Established' : undefined}
            >
              <span className="text-base">{item.icon}</span>
              <span className="flex-1 text-left">{item.label}</span>
              {calendarLocked ? (
                <span className="text-[length:var(--text-xs)]" aria-hidden="true">🔒</span>
              ) : badge ? (
                <span className="bg-alert text-white text-[length:var(--text-xs)] font-bold px-2 py-0.5 rounded-full">
                  {badge}
                </span>
              ) : null}
            </button>
            )
          })}

          {/* Pro Features Section */}
          <div className="pt-4 mt-4 border-t border-border">
            <p className="px-4 py-1.5 text-[length:var(--text-xs)] font-mono text-gold uppercase tracking-widest">
              Upgrade
            </p>
            {PRO_ITEMS.map((item) => (
              <button
                key={item.id}
                onClick={() => { onNavigate(item.id); onClose() }}
                className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-[length:var(--text-sm)] transition-colors cursor-pointer ${
                  activeNav === item.id
                    ? 'bg-gold-light text-text font-medium'
                    : 'text-text-faint hover:bg-bg-surface hover:text-text-muted'
                }`}
              >
                <span className="text-base">{item.icon}</span>
                <span className="flex-1 text-left">{item.label}</span>
                <span className="text-[length:var(--text-xs)] bg-gold/10 text-gold px-1.5 py-0.5 rounded font-medium">Upgrade</span>
              </button>
            ))}
          </div>

          {/* Upgrade Banner */}
          <div className="mt-4 mx-1 p-4 bg-gradient-to-br from-gold/10 to-gold/5 border border-gold/20 rounded-xl">
            <p className="text-text font-display font-bold text-[length:var(--text-xs)]">Upgrade Your Plan</p>
            <p className="text-text-muted text-[length:var(--text-xs)] mt-1 leading-relaxed">
              Enforcement tracking, document review, audit prep, and advisory sessions.
            </p>
            <a
              href="/checkout?plan=professional-799"
              className="inline-block mt-3 px-4 py-1.5 bg-gold text-white text-[length:var(--text-xs)] font-medium rounded-lg hover:brightness-110 transition-all"
            >
              Upgrade Now &rarr;
            </a>
          </div>
        </nav>

        <div className="p-4 border-t border-border space-y-2">
          <a
            href="/billing"
            className="flex items-center gap-2.5 px-4 py-2 rounded-xl text-text-muted hover:bg-bg-surface hover:text-text text-[length:var(--text-sm)] transition-colors"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <rect x="1" y="4" width="22" height="16" rx="2" ry="2" /><line x1="1" y1="10" x2="23" y2="10" />
            </svg>
            <span>Billing</span>
          </a>
          <a
            href="mailto:support@zawda.io"
            className="flex items-center gap-2.5 px-4 py-2 rounded-xl text-text-muted hover:bg-bg-surface hover:text-text text-[length:var(--text-sm)] transition-colors"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <circle cx="12" cy="12" r="10" /><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" /><circle cx="12" cy="17" r=".5" fill="currentColor" />
            </svg>
            <span>Get Support</span>
          </a>
          <div className="flex items-center gap-3 px-4 py-2">
            <div className="w-8 h-8 rounded-full bg-gold-light flex items-center justify-center shrink-0">
              <span className="text-gold font-bold text-[length:var(--text-xs)]">{initials}</span>
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-text text-[length:var(--text-sm)] font-medium truncate">{companyName || 'Your Company'}</p>
              <div className="mt-0.5">
                <SubscriptionBadge />
              </div>
            </div>
          </div>
        </div>
      </aside>

      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/20 z-30 lg:hidden" onClick={onClose} />
      )}
    </>
  )
}
