'use client'

import { useState, useEffect, useCallback } from 'react'
import { BrandName } from '@/components/ui/BrandName'
import { Button } from '@/components/ui/Button'

interface Subscriber {
  email: string
  subscribedAt: string
  source: string
}

interface AnalyticsData {
  pageViews: Record<string, number>
  assessmentsStarted: number
  assessmentsCompleted: number
  registrations: number
  sessions: number
}

interface DashboardData {
  analytics: AnalyticsData
  subscribers: { total: number; list: Subscriber[] }
  telegram: { subscribers: number; configured: boolean }
}

export default function AdminDashboard() {
  const [data, setData] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [authenticated, setAuthenticated] = useState(false)
  const [password, setPassword] = useState('')

  const fetchData = useCallback(async () => {
    try {
      setLoading(true)
      const res = await fetch('/api/analytics')
      if (!res.ok) throw new Error('Failed to load')
      const json = await res.json()
      setData(json)
    } catch {
      setError('Failed to load dashboard data')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    if (authenticated) fetchData()
  }, [authenticated, fetchData])

  function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    // Simple client-side gate — not a security boundary, just keeps casual visitors out.
    // For production, replace with proper auth.
    const adminPass = process.env.NEXT_PUBLIC_ADMIN_PASSWORD ?? 'zawda-admin-2026'
    if (password === adminPass) {
      setAuthenticated(true)
    } else {
      setError('Incorrect password')
    }
  }

  if (!authenticated) {
    return (
      <div className="min-h-screen bg-bg-primary flex items-center justify-center px-4">
        <div className="bg-bg-surface border border-border rounded-2xl p-8 max-w-sm w-full">
          <BrandName className="font-display font-bold text-[length:var(--text-lg)] text-text block mb-1" />
          <p className="text-text-muted text-[length:var(--text-sm)] mb-6">Admin Dashboard</p>
          <form onSubmit={handleLogin}>
            <label htmlFor="admin-pass" className="block text-text text-[length:var(--text-sm)] font-medium mb-2">
              Password
            </label>
            <input
              id="admin-pass"
              type="password"
              value={password}
              onChange={(e) => { setPassword(e.target.value); setError('') }}
              className="w-full rounded-lg border border-border bg-bg-primary px-4 py-2.5 text-text placeholder:text-text-faint focus:outline-none focus:border-gold text-[length:var(--text-sm)]"
              placeholder="Enter admin password"
            />
            {error && <p className="text-alert text-[length:var(--text-xs)] mt-2">{error}</p>}
            <Button type="submit" variant="primary" className="w-full mt-4 text-[length:var(--text-sm)]">
              Access Dashboard
            </Button>
          </form>
        </div>
      </div>
    )
  }

  const totalPageViews = data ? Object.values(data.analytics.pageViews).reduce((s, v) => s + v, 0) : 0

  return (
    <div className="min-h-screen bg-bg-primary">
      <header className="border-b border-border px-6 py-4 flex items-center justify-between">
        <div>
          <BrandName className="font-display font-bold text-[length:var(--text-lg)] text-text" />
          <span className="text-text-muted text-[length:var(--text-sm)] ml-2">Admin</span>
        </div>
        <Button variant="ghost" onClick={fetchData} className="text-[length:var(--text-sm)]">
          Refresh
        </Button>
      </header>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
        {loading ? (
          <p className="text-text-muted text-[length:var(--text-sm)]">Loading...</p>
        ) : error ? (
          <p className="text-alert text-[length:var(--text-sm)]">{error}</p>
        ) : data ? (
          <>
            {/* Metric cards */}
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
              <div className="bg-bg-surface border border-border rounded-xl p-5">
                <p className="font-mono text-text-faint text-[length:var(--text-xs)] uppercase">Sessions</p>
                <p className="font-mono text-gold font-bold text-[length:var(--text-xl)] mt-1">{data.analytics.sessions}</p>
                <p className="text-text-faint text-[length:var(--text-xs)] mt-1">unique website visits</p>
              </div>
              <div className="bg-bg-surface border border-border rounded-xl p-5">
                <p className="font-mono text-text-faint text-[length:var(--text-xs)] uppercase">Page Views</p>
                <p className="font-mono text-gold font-bold text-[length:var(--text-xl)] mt-1">{totalPageViews}</p>
                <p className="text-text-faint text-[length:var(--text-xs)] mt-1">across all routes</p>
              </div>
              <div className="bg-bg-surface border border-border rounded-xl p-5">
                <p className="font-mono text-text-faint text-[length:var(--text-xs)] uppercase">Email Subscribers</p>
                <p className="font-mono text-gold font-bold text-[length:var(--text-xl)] mt-1">{data.subscribers.total}</p>
                <p className="text-text-faint text-[length:var(--text-xs)] mt-1">weekly brief signups</p>
              </div>
              <div className="bg-bg-surface border border-border rounded-xl p-5">
                <p className="font-mono text-text-faint text-[length:var(--text-xs)] uppercase">Telegram Subscribers</p>
                <p className="font-mono text-gold font-bold text-[length:var(--text-xl)] mt-1">{data.telegram.subscribers}</p>
                <p className="text-text-faint text-[length:var(--text-xs)] mt-1">bot subscribers</p>
              </div>
              <div className="bg-bg-surface border border-border rounded-xl p-5">
                <p className="font-mono text-text-faint text-[length:var(--text-xs)] uppercase">Assessments</p>
                <p className="font-mono text-gold font-bold text-[length:var(--text-xl)] mt-1">
                  {data.analytics.assessmentsCompleted}
                  <span className="text-text-faint font-normal text-[length:var(--text-sm)]"> / {data.analytics.assessmentsStarted}</span>
                </p>
                <p className="text-text-faint text-[length:var(--text-xs)] mt-1">completed / started</p>
              </div>
              <div className="bg-bg-surface border border-border rounded-xl p-5">
                <p className="font-mono text-text-faint text-[length:var(--text-xs)] uppercase">Bot Status</p>
                <div className="flex items-center gap-2 mt-1">
                  <span
                    className={`inline-block w-2.5 h-2.5 rounded-full ${data.telegram.configured ? 'bg-emerald-500' : 'bg-red-500'}`}
                    aria-hidden="true"
                  />
                  <p className={`font-mono font-bold text-[length:var(--text-base)] ${data.telegram.configured ? 'text-emerald-600' : 'text-red-600'}`}>
                    {data.telegram.configured ? 'Live' : 'Not configured'}
                  </p>
                </div>
                <p className="text-text-faint text-[length:var(--text-xs)] mt-1">
                  {data.telegram.configured ? 'TELEGRAM_BOT_TOKEN set' : 'Set TELEGRAM_BOT_TOKEN env'}
                </p>
              </div>
            </div>

            {/* Page views breakdown */}
            {Object.keys(data.analytics.pageViews).length > 0 && (
              <div className="bg-bg-surface border border-border rounded-xl p-6 mb-8">
                <h2 className="font-display font-bold text-text text-[length:var(--text-base)] mb-4">Page Views</h2>
                <div className="space-y-2">
                  {Object.entries(data.analytics.pageViews)
                    .sort(([, a], [, b]) => b - a)
                    .map(([page, count]) => (
                      <div key={page} className="flex items-center justify-between py-1.5 border-b border-border last:border-0">
                        <span className="font-mono text-text text-[length:var(--text-sm)]">{page}</span>
                        <span className="font-mono text-text-muted text-[length:var(--text-sm)]">{count}</span>
                      </div>
                    ))}
                </div>
              </div>
            )}

            {/* Subscribers list */}
            <div className="bg-bg-surface border border-border rounded-xl p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-display font-bold text-text text-[length:var(--text-base)]">
                  Weekly Brief Subscribers ({data.subscribers.total})
                </h2>
                {data.subscribers.total > 0 && (
                  <Button
                    variant="outline"
                    className="text-[length:var(--text-xs)]"
                    onClick={() => {
                      const csv = ['email,subscribed_at,source', ...data.subscribers.list.map(
                        (s) => `${s.email},${s.subscribedAt},${s.source}`
                      )].join('\n')
                      const blob = new Blob([csv], { type: 'text/csv' })
                      const url = URL.createObjectURL(blob)
                      const a = document.createElement('a')
                      a.href = url
                      a.download = `zawda-subscribers-${new Date().toISOString().slice(0, 10)}.csv`
                      a.click()
                      URL.revokeObjectURL(url)
                    }}
                  >
                    Export CSV
                  </Button>
                )}
              </div>
              {data.subscribers.total === 0 ? (
                <p className="text-text-muted text-[length:var(--text-sm)]">No subscribers yet.</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-[length:var(--text-sm)]">
                    <thead>
                      <tr className="text-left border-b border-border">
                        <th className="pb-2 text-text-faint font-mono text-[length:var(--text-xs)] uppercase">Email</th>
                        <th className="pb-2 text-text-faint font-mono text-[length:var(--text-xs)] uppercase">Date</th>
                        <th className="pb-2 text-text-faint font-mono text-[length:var(--text-xs)] uppercase">Source</th>
                      </tr>
                    </thead>
                    <tbody>
                      {data.subscribers.list.map((sub) => (
                        <tr key={sub.email} className="border-b border-border last:border-0">
                          <td className="py-2.5 text-text">{sub.email}</td>
                          <td className="py-2.5 text-text-muted">{new Date(sub.subscribedAt).toLocaleDateString()}</td>
                          <td className="py-2.5 text-text-muted">{sub.source}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </>
        ) : null}
      </main>
    </div>
  )
}
