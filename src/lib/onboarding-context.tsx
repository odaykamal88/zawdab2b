'use client'

import { createContext, useContext, useState, useCallback, useEffect, useMemo, useRef, type ReactNode } from 'react'

export interface OnboardingData {
  companyName: string
  companyWebsite: string
  workEmail: string
  phoneNumber: string
  emailVerified: boolean
  mfaEnabled: boolean
  entityStatus: 'not-started' | 'in-progress' | 'established'
  teamSize: '1-5' | '6-20' | '21-50' | '50+'
  licensingStage: 'exploring' | 'pre-application' | 'application-in-progress' | 'licensed'
  primaryJurisdiction: string
  additionalJurisdictions: string[]
  targetActivities: string[]
  complianceInterests: string[]
  role: string
  completedAt?: string
  plan?: string
  /** The license recommended by the engine */
  recommendedLicense?: string
  /** The license the user confirmed or selected */
  selectedLicense?: string
  /** The jurisdiction recommended (for redirect cases) */
  recommendedJurisdiction?: string
}

const DEFAULT_DATA: OnboardingData = {
  companyName: '',
  companyWebsite: '',
  workEmail: '',
  phoneNumber: '',
  emailVerified: false,
  mfaEnabled: false,
  entityStatus: 'not-started',
  teamSize: '1-5',
  licensingStage: 'exploring',
  primaryJurisdiction: '',
  additionalJurisdictions: [],
  targetActivities: [],
  complianceInterests: [],
  role: '',
}

const STORAGE_VERSION = 2
const STORAGE_KEY = 'zawda_onboarding_v2'

interface OnboardingContextValue {
  data: OnboardingData
  update: (partial: Partial<OnboardingData>) => void
  complete: () => void
  isComplete: boolean
  isLoaded: boolean
  reset: () => void
}

const OnboardingContext = createContext<OnboardingContextValue | null>(null)

export function OnboardingProvider({ children }: { children: ReactNode }) {
  const [data, setData] = useState<OnboardingData>(DEFAULT_DATA)
  const [isLoaded, setIsLoaded] = useState(false)
  const didLoad = useRef(false)

  // Load from localStorage once on mount
  useEffect(() => {
    if (didLoad.current) return
    didLoad.current = true
    try {
      // Clean up old storage key
      localStorage.removeItem('zawda_onboarding')
      const stored = localStorage.getItem(STORAGE_KEY)
      if (stored) {
        const parsed = JSON.parse(stored)
        setData({ ...DEFAULT_DATA, ...parsed })
      }
    } catch { /* ignore */ }
    setIsLoaded(true)
  }, [])

  const persist = useCallback((next: OnboardingData) => {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(next)) } catch { /* ignore */ }
  }, [])

  const update = useCallback((partial: Partial<OnboardingData>) => {
    setData((prev) => {
      const next = { ...prev, ...partial }
      persist(next)
      return next
    })
  }, [persist])

  const complete = useCallback(() => {
    setData((prev) => {
      const next = { ...prev, completedAt: new Date().toISOString() }
      persist(next)
      return next
    })
  }, [persist])

  const reset = useCallback(() => {
    setData(DEFAULT_DATA)
    try { localStorage.removeItem(STORAGE_KEY) } catch { /* ignore */ }
  }, [])

  const value = useMemo<OnboardingContextValue>(() => ({
    data, update, complete, reset, isLoaded,
    isComplete: !!data.completedAt,
  }), [data, update, complete, reset, isLoaded])

  return (
    <OnboardingContext.Provider value={value}>
      {children}
    </OnboardingContext.Provider>
  )
}

export function useOnboarding() {
  const ctx = useContext(OnboardingContext)
  if (!ctx) throw new Error('useOnboarding must be used within OnboardingProvider')
  return ctx
}
