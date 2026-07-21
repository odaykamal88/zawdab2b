'use client'

import { useState, useEffect } from 'react'

const STORAGE_KEY = 'alert-dismissed'

export function AlertBar() {
  const [dismissed, setDismissed] = useState(true)

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored !== 'true') setDismissed(false)
  }, [])

  function handleDismiss() {
    setDismissed(true)
    localStorage.setItem(STORAGE_KEY, 'true')
  }

  if (dismissed) return null

  return (
    <div
      role="alert"
      className="relative bg-gold text-white text-center px-4 py-2.5 text-[length:var(--text-sm)]"
    >
      <a href="#pain" className="hover:underline">
        {/* Source: vara.ae — Q4 2025 enforcement actions + FATF Travel Rule deadline */}
        VARA is actively enforcing against unlicensed firms — fines up to AED 600K each. The FATF Travel Rule has been in effect since March 2026.
      </a>
      <button
        onClick={handleDismiss}
        className="absolute right-3 top-1/2 -translate-y-1/2 text-white/80 hover:text-white p-1"
        aria-label="Dismiss alert"
      >
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M4 4l8 8M12 4l-8 8" />
        </svg>
      </button>
    </div>
  )
}
