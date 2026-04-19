'use client'

/**
 * User DSAR submission page.
 * UAE PDPL Art. 15 — data subjects may request access, rectification, erasure, etc.
 * Available at: /dashboard/privacy (protected by Clerk middleware)
 */

import { useState } from 'react'
import { useUser } from '@clerk/nextjs'
import { Button } from '@/components/ui/Button'

type DsarType = 'access' | 'rectification' | 'erasure' | 'restriction' | 'objection'

const DSAR_TYPES: { value: DsarType; label: string; description: string }[] = [
  {
    value: 'access',
    label: 'Data Access',
    description: 'Request a copy of the personal data we hold about you.',
  },
  {
    value: 'rectification',
    label: 'Data Rectification',
    description: 'Request correction of inaccurate or incomplete personal data.',
  },
  {
    value: 'erasure',
    label: 'Data Erasure',
    description: 'Request deletion of your personal data (right to be forgotten).',
  },
  {
    value: 'restriction',
    label: 'Restrict Processing',
    description: 'Request that we limit how we use your personal data.',
  },
  {
    value: 'objection',
    label: 'Object to Processing',
    description: 'Object to how we process your personal data.',
  },
]

interface SubmittedRequest {
  id: string
  type: DsarType
  status: string
  openedAt: string
  dueAt: string
}

export default function PrivacyPage() {
  const { user } = useUser()
  const [selectedType, setSelectedType] = useState<DsarType | ''>('')
  const [notes, setNotes] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState<SubmittedRequest | null>(null)
  const [error, setError] = useState('')
  const [existing, setExisting] = useState<SubmittedRequest[] | null>(null)
  const [loadingExisting, setLoadingExisting] = useState(false)

  const email = user?.emailAddresses?.[0]?.emailAddress ?? ''

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!selectedType) return
    setSubmitting(true)
    setError('')

    try {
      const res = await fetch('/api/dsar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: selectedType, notes: notes.trim() || undefined }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? 'Submission failed')
      setSubmitted(data.dsar)
      setSelectedType('')
      setNotes('')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
    } finally {
      setSubmitting(false)
    }
  }

  async function loadExisting() {
    setLoadingExisting(true)
    try {
      const res = await fetch('/api/dsar')
      const data = await res.json()
      if (res.ok) setExisting(data.requests)
    } finally {
      setLoadingExisting(false)
    }
  }

  return (
    <div className="min-h-screen bg-bg-primary">
      <main className="max-w-2xl mx-auto px-4 sm:px-6 py-12">
        <h1 className="font-display font-bold text-text text-[length:var(--text-2xl)] mb-2">
          Data &amp; Privacy
        </h1>
        <p className="text-text-muted text-[length:var(--text-sm)] mb-8">
          Under UAE Federal Decree-Law No. 45 of 2021 (PDPL) you have the right to access,
          correct, or delete your personal data. Requests are processed within 30 days.
        </p>

        {submitted ? (
          <div className="bg-bg-surface border border-border rounded-xl p-6 mb-8">
            <p className="font-mono text-gold font-bold text-[length:var(--text-base)] mb-1">
              Request received
            </p>
            <p className="text-text-muted text-[length:var(--text-sm)] mb-3">
              A confirmation has been sent to <strong>{email}</strong>.
            </p>
            <div className="space-y-1 text-[length:var(--text-xs)] font-mono text-text-faint">
              <p>Reference: {submitted.id}</p>
              <p>Type: {submitted.type}</p>
              <p>Due by: {new Date(submitted.dueAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
            </div>
            <Button
              variant="ghost"
              className="mt-4 text-[length:var(--text-sm)]"
              onClick={() => setSubmitted(null)}
            >
              Submit another request
            </Button>
          </div>
        ) : (
          <div className="bg-bg-surface border border-border rounded-xl p-6 mb-8">
            <h2 className="font-display font-bold text-text text-[length:var(--text-base)] mb-4">
              Submit a data request
            </h2>

            <form onSubmit={handleSubmit}>
              <p className="text-text-muted text-[length:var(--text-xs)] mb-3">
                Requesting as: <span className="text-text font-mono">{email}</span>
              </p>

              <div className="space-y-2 mb-5">
                {DSAR_TYPES.map((t) => (
                  <label
                    key={t.value}
                    className={`flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${
                      selectedType === t.value
                        ? 'border-gold bg-bg-primary'
                        : 'border-border hover:border-gold/40'
                    }`}
                  >
                    <input
                      type="radio"
                      name="dsarType"
                      value={t.value}
                      checked={selectedType === t.value}
                      onChange={() => setSelectedType(t.value)}
                      className="mt-0.5 accent-gold"
                    />
                    <div>
                      <p className="text-text text-[length:var(--text-sm)] font-medium">{t.label}</p>
                      <p className="text-text-muted text-[length:var(--text-xs)]">{t.description}</p>
                    </div>
                  </label>
                ))}
              </div>

              <label className="block mb-4">
                <span className="text-text text-[length:var(--text-sm)] font-medium block mb-1.5">
                  Additional details <span className="text-text-faint font-normal">(optional)</span>
                </span>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  maxLength={2000}
                  rows={3}
                  placeholder="Describe your request in more detail…"
                  className="w-full rounded-lg border border-border bg-bg-primary px-4 py-2.5 text-text placeholder:text-text-faint focus:outline-none focus:border-gold text-[length:var(--text-sm)] resize-none"
                />
              </label>

              {error && (
                <p className="text-alert text-[length:var(--text-xs)] mb-3">{error}</p>
              )}

              <Button
                type="submit"
                variant="primary"
                disabled={!selectedType || submitting}
                className="w-full text-[length:var(--text-sm)]"
              >
                {submitting ? 'Submitting…' : 'Submit request'}
              </Button>
            </form>
          </div>
        )}

        {/* View existing requests */}
        <div className="bg-bg-surface border border-border rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-display font-bold text-text text-[length:var(--text-base)]">
              Your previous requests
            </h2>
            <Button
              variant="ghost"
              className="text-[length:var(--text-xs)]"
              onClick={loadExisting}
            >
              {loadingExisting ? 'Loading…' : 'Load'}
            </Button>
          </div>

          {existing === null ? (
            <p className="text-text-muted text-[length:var(--text-sm)]">
              Click Load to view your request history.
            </p>
          ) : existing.length === 0 ? (
            <p className="text-text-muted text-[length:var(--text-sm)]">No requests submitted yet.</p>
          ) : (
            <div className="space-y-3">
              {existing.map((r) => (
                <div key={r.id} className="border-b border-border pb-3 last:border-0 last:pb-0">
                  <div className="flex items-center justify-between">
                    <span className="text-text text-[length:var(--text-sm)] font-medium capitalize">
                      {r.type.replace(/_/g, ' ')}
                    </span>
                    <span
                      className={`font-mono text-[length:var(--text-xs)] px-2 py-0.5 rounded-full ${
                        r.status === 'completed'
                          ? 'bg-emerald-500/10 text-emerald-600'
                          : r.status === 'rejected'
                          ? 'bg-red-500/10 text-red-600'
                          : 'bg-gold/10 text-gold'
                      }`}
                    >
                      {r.status}
                    </span>
                  </div>
                  <p className="text-text-faint text-[length:var(--text-xs)] font-mono mt-0.5">
                    Ref: {r.id.slice(0, 8).toUpperCase()} · Opened:{' '}
                    {new Date(r.openedAt).toLocaleDateString()} · Due:{' '}
                    {new Date(r.dueAt).toLocaleDateString()}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
