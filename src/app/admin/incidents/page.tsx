'use client'

/**
 * Admin incident management page — /admin/incidents
 * Shows open incidents with 72-hour SLA notification tracker (SLA §6.5).
 */

import { useState, useEffect, useCallback } from 'react'
import { BrandName } from '@/components/ui/BrandName'
import { Button } from '@/components/ui/Button'

interface IncidentRow {
  id: string
  title: string
  description: string
  severity: string
  status: string
  flaggedAt: string
  notifiedAt?: string
  resolvedAt?: string
  affectedUserCount?: number
  notes?: string
  hoursElapsed: number
  notificationDeadline: string
  slaBreached: boolean
}

export default function AdminIncidentsPage() {
  const [incidents, setIncidents] = useState<IncidentRow[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [notifyId, setNotifyId] = useState<string | null>(null)
  const [notifyEmails, setNotifyEmails] = useState('')
  const [notifyNotes, setNotifyNotes] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [form, setForm] = useState({
    title: '',
    description: '',
    severity: 'high' as string,
    notes: '',
  })

  const load = useCallback(async () => {
    try {
      setLoading(true)
      const res = await fetch('/api/admin/incidents')
      if (!res.ok) throw new Error('Failed to load')
      const data = await res.json()
      setIncidents(data.incidents)
    } catch {
      setError('Failed to load incidents')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { void load() }, [load])

  async function flagIncident() {
    setSubmitting(true)
    setError('')
    try {
      const res = await fetch('/api/admin/incidents', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? 'Failed')
      setShowForm(false)
      setForm({ title: '', description: '', severity: 'high', notes: '' })
      await load()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to flag incident')
    } finally {
      setSubmitting(false)
    }
  }

  async function sendNotifications(id: string) {
    setSubmitting(true)
    setError('')
    const emails = notifyEmails.split(/[\s,]+/).map((e) => e.trim()).filter(Boolean)
    try {
      const res = await fetch(`/api/admin/incidents?id=${id}&action=notify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ emails, notes: notifyNotes.trim() || undefined }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? 'Failed')
      setNotifyId(null)
      setNotifyEmails('')
      setNotifyNotes('')
      await load()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to send notifications')
    } finally {
      setSubmitting(false)
    }
  }

  async function updateStatus(id: string, status: string) {
    try {
      await fetch(`/api/admin/incidents?id=${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      })
      await load()
    } catch {
      setError('Failed to update')
    }
  }

  const open = incidents.filter((i) => i.status !== 'resolved')
  const resolved = incidents.filter((i) => i.status === 'resolved')

  return (
    <div className="min-h-screen bg-bg-primary">
      <header className="border-b border-border px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <a href="/admin" className="text-text-muted text-[length:var(--text-sm)] hover:text-text transition-colors">
            ← Admin
          </a>
          <span className="text-border">·</span>
          <BrandName className="font-display font-bold text-[length:var(--text-lg)] text-text" />
          <span className="text-text-muted text-[length:var(--text-sm)]">Incidents</span>
        </div>
        <div className="flex gap-2">
          <Button variant="ghost" onClick={load} className="text-[length:var(--text-sm)]">Refresh</Button>
          <Button variant="primary" onClick={() => setShowForm(true)} className="text-[length:var(--text-sm)]">
            Flag Incident
          </Button>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
        <div className="bg-bg-surface border border-border rounded-xl p-4 mb-6 text-[length:var(--text-xs)] text-text-muted">
          <strong className="text-text">SLA §6.5 — 72-hour notification window.</strong>{' '}
          Affected users must be notified within 72 hours of a confirmed breach.{' '}
          <span className="text-red-500 font-medium">● SLA BREACHED</span> = unnotified past 72 h.
        </div>

        {error && <p className="text-alert text-[length:var(--text-sm)] mb-4">{error}</p>}

        {/* Flag incident form */}
        {showForm && (
          <div className="bg-bg-surface border border-gold/40 rounded-xl p-6 mb-6">
            <h3 className="font-display font-bold text-text text-[length:var(--text-base)] mb-4">Flag New Incident</h3>
            <div className="space-y-3">
              <input
                placeholder="Title *"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                className="w-full rounded-lg border border-border bg-bg-primary px-4 py-2.5 text-text placeholder:text-text-faint focus:outline-none focus:border-gold text-[length:var(--text-sm)]"
              />
              <textarea
                placeholder="Description *"
                rows={3}
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                className="w-full rounded-lg border border-border bg-bg-primary px-4 py-2.5 text-text placeholder:text-text-faint focus:outline-none focus:border-gold text-[length:var(--text-sm)] resize-none"
              />
              <select
                value={form.severity}
                onChange={(e) => setForm({ ...form, severity: e.target.value })}
                className="w-full rounded-lg border border-border bg-bg-primary px-4 py-2.5 text-text focus:outline-none focus:border-gold text-[length:var(--text-sm)]"
              >
                <option value="critical">Critical</option>
                <option value="high">High</option>
                <option value="medium">Medium</option>
                <option value="low">Low</option>
              </select>
              <textarea
                placeholder="Notes (optional)"
                rows={2}
                value={form.notes}
                onChange={(e) => setForm({ ...form, notes: e.target.value })}
                className="w-full rounded-lg border border-border bg-bg-primary px-4 py-2.5 text-text placeholder:text-text-faint focus:outline-none focus:border-gold text-[length:var(--text-sm)] resize-none"
              />
            </div>
            <div className="flex gap-2 mt-4">
              <Button variant="primary" disabled={submitting} onClick={flagIncident} className="text-[length:var(--text-sm)]">
                {submitting ? 'Flagging…' : 'Flag Incident'}
              </Button>
              <Button variant="ghost" onClick={() => setShowForm(false)} className="text-[length:var(--text-sm)]">Cancel</Button>
            </div>
          </div>
        )}

        {/* Notify users form */}
        {notifyId && (
          <div className="bg-bg-surface border border-gold/40 rounded-xl p-6 mb-6">
            <h3 className="font-display font-bold text-text text-[length:var(--text-base)] mb-4">Notify Affected Users</h3>
            <textarea
              placeholder="Email addresses (comma or newline separated) *"
              rows={3}
              value={notifyEmails}
              onChange={(e) => setNotifyEmails(e.target.value)}
              className="w-full rounded-lg border border-border bg-bg-primary px-4 py-2.5 text-text placeholder:text-text-faint focus:outline-none focus:border-gold text-[length:var(--text-sm)] resize-none mb-3"
            />
            <textarea
              placeholder="Additional message to users (optional)"
              rows={2}
              value={notifyNotes}
              onChange={(e) => setNotifyNotes(e.target.value)}
              className="w-full rounded-lg border border-border bg-bg-primary px-4 py-2.5 text-text placeholder:text-text-faint focus:outline-none focus:border-gold text-[length:var(--text-sm)] resize-none"
            />
            <div className="flex gap-2 mt-4">
              <Button variant="primary" disabled={submitting} onClick={() => sendNotifications(notifyId)} className="text-[length:var(--text-sm)]">
                {submitting ? 'Sending…' : 'Send Notifications'}
              </Button>
              <Button variant="ghost" onClick={() => { setNotifyId(null); setNotifyEmails('') }} className="text-[length:var(--text-sm)]">Cancel</Button>
            </div>
          </div>
        )}

        {loading ? (
          <p className="text-text-muted text-[length:var(--text-sm)]">Loading…</p>
        ) : (
          <>
            <h2 className="font-display font-bold text-text text-[length:var(--text-base)] mb-3">
              Open ({open.length})
            </h2>

            {open.length === 0 ? (
              <p className="text-text-muted text-[length:var(--text-sm)] mb-8">No open incidents.</p>
            ) : (
              <div className="space-y-3 mb-8">
                {open.map((i) => {
                  const hoursLeft = 72 - i.hoursElapsed
                  return (
                    <div key={i.id} className={`bg-bg-surface border rounded-xl p-5 ${i.slaBreached ? 'border-red-500/50' : 'border-border'}`}>
                      <div className="flex items-start justify-between gap-4 mb-2">
                        <div>
                          <span className={`inline-block font-mono text-[length:var(--text-xs)] px-2 py-0.5 rounded-full mr-2 ${
                            i.severity === 'critical' ? 'bg-red-500/10 text-red-500' :
                            i.severity === 'high' ? 'bg-amber-500/10 text-amber-500' :
                            'bg-border text-text-muted'
                          }`}>
                            {i.severity}
                          </span>
                          <span className="font-mono text-[length:var(--text-xs)] px-2 py-0.5 rounded-full bg-gold/10 text-gold">
                            {i.status}
                          </span>
                          {i.slaBreached && (
                            <span className="ml-2 font-mono text-[length:var(--text-xs)] text-red-500 font-bold">● SLA BREACHED</span>
                          )}
                        </div>
                        <span className="text-text-faint text-[length:var(--text-xs)] font-mono shrink-0">
                          {i.hoursElapsed.toFixed(1)}h elapsed
                          {!i.slaBreached && ` · ${hoursLeft.toFixed(0)}h remaining`}
                        </span>
                      </div>
                      <p className="text-text font-medium text-[length:var(--text-sm)] mb-1">{i.title}</p>
                      <p className="text-text-muted text-[length:var(--text-xs)] mb-3">{i.description}</p>
                      <div className="flex gap-2 flex-wrap">
                        <Button
                          variant="outline"
                          className="text-[length:var(--text-xs)] py-1"
                          onClick={() => setNotifyId(i.id)}
                        >
                          Notify Users
                        </Button>
                        {i.status !== 'investigating' && (
                          <Button
                            variant="ghost"
                            className="text-[length:var(--text-xs)] py-1"
                            onClick={() => updateStatus(i.id, 'investigating')}
                          >
                            Mark Investigating
                          </Button>
                        )}
                        <Button
                          variant="ghost"
                          className="text-[length:var(--text-xs)] py-1 text-text-muted"
                          onClick={() => updateStatus(i.id, 'resolved')}
                        >
                          Resolve
                        </Button>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}

            {resolved.length > 0 && (
              <>
                <h2 className="font-display font-bold text-text text-[length:var(--text-base)] mb-3">
                  Resolved ({resolved.length})
                </h2>
                <div className="bg-bg-surface border border-border rounded-xl overflow-hidden">
                  <table className="w-full text-[length:var(--text-sm)]">
                    <thead>
                      <tr className="border-b border-border text-left">
                        <th className="px-4 py-3 text-text-faint font-mono text-[length:var(--text-xs)] uppercase">Title</th>
                        <th className="px-4 py-3 text-text-faint font-mono text-[length:var(--text-xs)] uppercase">Severity</th>
                        <th className="px-4 py-3 text-text-faint font-mono text-[length:var(--text-xs)] uppercase">Flagged</th>
                        <th className="px-4 py-3 text-text-faint font-mono text-[length:var(--text-xs)] uppercase">Resolved</th>
                        <th className="px-4 py-3 text-text-faint font-mono text-[length:var(--text-xs)] uppercase">Users notified</th>
                      </tr>
                    </thead>
                    <tbody>
                      {resolved.map((i) => (
                        <tr key={i.id} className="border-b border-border last:border-0">
                          <td className="px-4 py-3 text-text">{i.title}</td>
                          <td className="px-4 py-3 text-text-muted capitalize">{i.severity}</td>
                          <td className="px-4 py-3 text-text-muted">{new Date(i.flaggedAt).toLocaleDateString()}</td>
                          <td className="px-4 py-3 text-text-muted">{i.resolvedAt ? new Date(i.resolvedAt).toLocaleDateString() : '—'}</td>
                          <td className="px-4 py-3 text-text-muted">{i.affectedUserCount ?? 0}</td>
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
