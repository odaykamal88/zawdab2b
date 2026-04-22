'use client'

import { useEffect, useState } from 'react'
import { getWeeklyTopRisk, getWeeklyAlertKey, type TopRisk } from '@/lib/top-risks'

/**
 * Minimally invasive scroll-triggered alert.
 * - Appears after user scrolls past the hero (~480px) so it never covers
 *   the first paint.
 * - Collapsed: small pulsing dot button in the bottom-left corner
 *   (bottom-right is reserved for the Calendly badge).
 * - Expanded: compact card with the week's top regulatory risk.
 * - Dismissing persists to localStorage for the current ISO week only,
 *   so it re-appears the following week with fresh content.
 */
export function FloatingAlert() {
  const [visible, setVisible] = useState(false)
  const [expanded, setExpanded] = useState(false)
  const [risk, setRisk] = useState<TopRisk | null>(null)

  useEffect(() => {
    const today = new Date()
    const dismissed = localStorage.getItem(getWeeklyAlertKey(today))
    if (dismissed === 'true') return

    setRisk(getWeeklyTopRisk(today))

    function onScroll() {
      if (window.scrollY > 480) setVisible(true)
    }

    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  function dismiss() {
    setVisible(false)
    setExpanded(false)
    localStorage.setItem(getWeeklyAlertKey(new Date()), 'true')
  }

  if (!visible || !risk) return null

  if (!expanded) {
    return (
      <button
        onClick={() => setExpanded(true)}
        className="fixed bottom-5 left-5 z-40 flex items-center gap-2 pl-3 pr-4 py-2 rounded-full bg-gold text-white shadow-lg hover:brightness-110 transition-all cursor-pointer group"
        aria-label="Show this week's top regulatory risk"
      >
        <span className="relative flex h-2.5 w-2.5 shrink-0">
          <span className="absolute inline-flex h-full w-full rounded-full bg-white/70 animate-ping" />
          <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-white" />
        </span>
        <span className="text-[length:var(--text-xs)] font-mono uppercase tracking-widest">
          Weekly Risk
        </span>
      </button>
    )
  }

  return (
    <div
      role="dialog"
      aria-label="This week's top regulatory risk"
      className="fixed bottom-5 left-5 z-40 w-[min(92vw,22rem)] bg-bg-surface border border-border rounded-2xl shadow-xl p-4 sm:p-5"
    >
      <div className="flex items-start justify-between gap-3 mb-2">
        <span className="font-mono text-gold uppercase tracking-widest text-[length:var(--text-xs)]">
          This Week&apos;s Top Risk
        </span>
        <button
          onClick={() => setExpanded(false)}
          className="text-text-muted hover:text-text -mt-1 -mr-1 p-1"
          aria-label="Collapse"
        >
          <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M3 8h10" />
          </svg>
        </button>
      </div>
      <p className="font-display font-bold text-text text-[length:var(--text-base)] leading-snug mb-1.5">
        {risk.headline}
      </p>
      <p className="text-text-muted text-[length:var(--text-xs)] leading-relaxed mb-3">
        {risk.body}
      </p>
      <p className="text-text-faint text-[length:var(--text-xs)] font-mono mb-4">
        Source:{' '}
        {risk.sourceUrl ? (
          <a href={risk.sourceUrl} target="_blank" rel="noopener noreferrer" className="underline hover:text-text-muted">
            {risk.source}
          </a>
        ) : (
          risk.source
        )}
      </p>
      <div className="flex items-center gap-2">
        <a
          href={risk.href}
          onClick={() => setExpanded(false)}
          className="flex-1 text-center px-3 py-2 rounded-xl bg-gold text-white text-[length:var(--text-xs)] font-medium hover:brightness-110 transition-all"
        >
          See how you&apos;re exposed &rarr;
        </a>
        <button
          onClick={dismiss}
          className="text-text-muted hover:text-text text-[length:var(--text-xs)] px-2 py-2"
        >
          Dismiss
        </button>
      </div>
    </div>
  )
}
