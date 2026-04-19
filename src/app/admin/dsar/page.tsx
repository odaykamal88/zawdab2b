'use client'

/**
 * Admin DSAR management page — /admin/dsar
 * Shows all pending requests with PDPL 30-day SLA indicators.
 */

import { useState, useEffect, useCallback } from 'react'
import { BrandName } from '@/components/ui/BrandName'
import { Button } from '@/components/ui/Button'

interface DsarRow {
  id: string
  requester: string
  type: string
  status: string
  openedAt: string
  dueAt: string
  closedAt?: string
  notes?: string
  daysRemaining: number
  overdue: boolean
  atRisk: boolean
}

export default function AdminDsarPage() {
  const [requests, setRequests] = useState<DsarRow[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [updating, setUpdating] = useState<string | null>(null)

  const load = useCallback(async () => {
    try {
      setLoading(true)
      const res = await fetch('/api/admin/dsar')
      if (!res.ok) throw new Error('Failed to load')
      const data = await res.json()
      setRequests(data.requests)
    } catch {
      setError('Failed to load DSAR requests')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { void load() }, [load])

  async function updateStatus(id: string, status: string) {
    setUpdating(id)
    try {
      const res = await fetch(`/api/admin/dsar?id=${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      })
      if (!res.ok) throw new Error('Update failed')
      await load()
    } catch {
      setError('Failed to update request')
    } finally {
      setUpdating(null)
    }
  }

  const open = requests.filter((r) => r.status === 'open' || r.status === 'in_progress')
  const closed = requests.filter((r) => r.status === 'completed' || r.status === 'rejected')

  return (
    <div className="min-h-screen bg-bg-primary">
      <header className="border-b border-border px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <a href="/admin" className="text-text-muted text-[length:var(--text-sm)] hover:text-text transition-colors">
            ← Admin
          </a>
          <span className="text-border">·</span>
          <BrandName className="font-display font-bold text-[length:var(--text-lg)] text-text" />
          <span className="text-text-muted text-[length:var(--text-sm)]">DSAR Requests</span>
        </div>
        <Button variant="ghost" onClick={load} className="text-[length:var(--text-sm)]">
          Refresh
        </Button>
      </header>

      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
        {/* SLA note */}
        <div className="bg-bg-surface border border-border rounded-xl p-4 mb-6 text-[length:var(--text-xs)] text-text-muted">
          <strong className="text-text">UAE PDPL — 30-day response SLA.</strong>{' '}
          Requests must be acknowledged and actioned within 30 days of submission.{' '}
          <span className="text-amber-500 font-medium">⚠ At risk</span> = ≤5 days remaining.{' '}
          <span className="text-red-500 font-medium">● Overdue</span> = past due date.
        </div>

        {error && <p className="text-alert text-[length:var(--text-sm)] mb-4">{error}</p>}

        {loading ? (
          <p className="text-text-muted text-[length:var(--text-sm)]">Loading…</p>
        ) : (
          <>
            <h2 className="font-display font-bold text-text text-[length:var(--text-base)] mb-3">
              Open ({open.length})
            </h2>

            {open.length === 0 ? (
              <p className="text-text-muted text-[length:var(--text-sm)] mb-8">No open requests.</p>
            ) : (
              <div className="bg-bg-surface border border-border rounded-xl overflow-hidden mb-8">
                <table className="w-full text-[length:var(--text-sm)]">
                  <thead>
                    <tr className="border-b border-border text-left">
                      <th className="px-4 py-3 text-text-faint font-mono text-[length:var(--text-xs)] uppercase">Requester</th>
                      <th className="px-4 py-3 text-text-faint font-mono text-[length:var(--text-xs)] uppercase">Type</th>
                      <th className="px-4 py-3 text-text-faint font-mono text-[length:var(--text-xs)] uppercase">Status</th>
                      <th className="px-4 py-3 text-text-faint font-mono text-[length:var(--text-xs)] uppercase">Opened</th>
                      <th className="px-4 py-3 text-text-faint font-mono text-[length:var(--text-xs)] uppercase">Due</th>
                      <th className="px-4 py-3 text-text-faint font-mono text-[length:var(--text-xs)] uppercase">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {open.map((r) => (
                      <tr key={r.id} className="border-b border-border last:border-0">
                        <td className="px-4 py-3 text-text">{r.requester}</td>
                        <td className="px-4 py-3 text-text capitalize">{r.type}</td>
                        <td className="px-4 py-3">
                          <span className="font-mono text-[length:var(--text-xs)] px-2 py-0.5 rounded-full bg-gold/10 text-gold">
                            {r.status}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-text-muted">
                          {new Date(r.openedAt).toLocaleDateString()}
                        </td>
                        <td className="px-4 py-3">
                          <span
                            className={
                              r.overdue
                                ? 'text-red-500 font-medium'
                                : r.atRisk
                                ? 'text-amber-500 font-medium'
                                : 'text-text-muted'
                            }
                          >
                            {new Date(r.dueAt).toLocaleDateString()}
                            {r.overdue ? ' ●' : r.atRisk ? ' ⚠' : ''}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex gap-2">
                            {r.status === 'open' && (
                              <Button
                                variant="outline"
                                className="text-[length:var(--text-xs)] py-1"
                                disabled={updating === r.id}
                                onClick={() => updateStatus(r.id, 'in_progress')}
                              >
                                Start
                              </Button>
                            )}
                            <Button
                              variant="outline"
                              className="text-[length:var(--text-xs)] py-1"
                              disabled={updating === r.id}
                              onClick={() => updateStatus(r.id, 'completed')}
                            >
                              Complete
                            </Button>
                            <Button
                              variant="ghost"
                              className="text-[length:var(--text-xs)] py-1 text-text-muted"
                              disabled={updating === r.id}
                              onClick={() => updateStatus(r.id, 'rejected')}
                            >
                              Reject
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {closed.length > 0 && (
              <>
                <h2 className="font-display font-bold text-text text-[length:var(--text-base)] mb-3">
                  Closed ({closed.length})
                </h2>
                <div className="bg-bg-surface border border-border rounded-xl overflow-hidden">
                  <table className="w-full text-[length:var(--text-sm)]">
                    <thead>
                      <tr className="border-b border-border text-left">
                        <th className="px-4 py-3 text-text-faint font-mono text-[length:var(--text-xs)] uppercase">Requester</th>
                        <th className="px-4 py-3 text-text-faint font-mono text-[length:var(--text-xs)] uppercase">Type</th>
                        <th className="px-4 py-3 text-text-faint font-mono text-[length:var(--text-xs)] uppercase">Status</th>
                        <th className="px-4 py-3 text-text-faint font-mono text-[length:var(--text-xs)] uppercase">Closed</th>
                      </tr>
                    </thead>
                    <tbody>
                      {closed.map((r) => (
                        <tr key={r.id} className="border-b border-border last:border-0">
                          <td className="px-4 py-3 text-text">{r.requester}</td>
                          <td className="px-4 py-3 text-text capitalize">{r.type}</td>
                          <td className="px-4 py-3">
                            <span
                              className={`font-mono text-[length:var(--text-xs)] px-2 py-0.5 rounded-full ${
                                r.status === 'completed'
                                  ? 'bg-emerald-500/10 text-emerald-600'
                                  : 'bg-red-500/10 text-red-600'
                              }`}
                            >
                              {r.status}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-text-muted">
                            {r.closedAt ? new Date(r.closedAt).toLocaleDateString() : '—'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </>
            )}
          </>
        )}
      </main>
    </div>
  )
}
