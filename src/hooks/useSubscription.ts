'use client'

/**
 * useSubscription — fetches the current user's subscription from /api/subscription.
 *
 * Cached for the lifetime of the component tree. On 401 (unauthenticated)
 * it returns null gracefully rather than throwing.
 */

import { useState, useEffect } from 'react'
import type { SubscriptionRecord } from '@/lib/subscription'

export interface UseSubscriptionResult {
  subscription: SubscriptionRecord | null
  loading: boolean
  error: string | null
  /** Re-fetch (e.g. after an upgrade) */
  refetch: () => void
}

export function useSubscription(): UseSubscriptionResult {
  const [subscription, setSubscription] = useState<SubscriptionRecord | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [tick, setTick] = useState(0)

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    setError(null)

    fetch('/api/subscription')
      .then(async (res) => {
        if (res.status === 401) return { subscription: null }
        if (!res.ok) throw new Error(`HTTP ${res.status}`)
        return res.json() as Promise<{ subscription: SubscriptionRecord | null }>
      })
      .then((data) => {
        if (!cancelled) {
          setSubscription(data.subscription)
          setLoading(false)
        }
      })
      .catch((err: unknown) => {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : 'Failed to load subscription')
          setLoading(false)
        }
      })

    return () => { cancelled = true }
  }, [tick])

  return {
    subscription,
    loading,
    error,
    refetch: () => setTick((t) => t + 1),
  }
}
