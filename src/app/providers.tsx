'use client'

import { useEffect } from 'react'
import { OnboardingProvider } from '@/lib/onboarding-context'

/**
 * Fire a single `session_start` beacon per browser-tab session. The guard
 * uses sessionStorage so client-side navigations within the same tab do not
 * re-count, but a fresh tab or a returning visitor does.
 */
function useSessionBeacon() {
  useEffect(() => {
    try {
      if (sessionStorage.getItem('zawda:session_tracked') === 'true') return
      sessionStorage.setItem('zawda:session_tracked', 'true')
    } catch {
      // Private browsing / storage disabled — fall through and still beacon.
    }
    // Fire and forget; any analytics failure must not affect the UI.
    fetch('/api/analytics', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ event: 'session_start' }),
      keepalive: true,
    }).catch(() => {})
  }, [])
}

export function Providers({ children }: { children: React.ReactNode }) {
  useSessionBeacon()
  return <OnboardingProvider>{children}</OnboardingProvider>
}
