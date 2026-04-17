'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useOnboarding } from '@/lib/onboarding-context'
import { JURISDICTIONS } from '@/lib/licensing-data'
import { UpgradeBanner, mapJurisdictionsToLabels } from './UpgradeBanner'

type ReadinessStatus = 'pass' | 'partial' | 'missing'
type DocStatus = 'missing' | 'uploaded' | 'approved' | 'rejected'

interface Requirement {
  id: string
  name: string
  evidenceHint: string
  relatedDocs: string[]
  jurisdictions: string[]
}

interface Category {
  id: string
  title: string
  subtitle: string
  requirements: Requirement[]
}

interface VaultFileInfo {
  id: string
  docId: string
  filename: string
  mimeType: string
  size: number
  sha256: string
  uploadedAt: string
  encrypted: true
}

const REVIEW_UNLOCKED_PLANS = ['professional', 'navigator']
const DOC_STATUS_KEY = 'zawda_documents_statuses'
const EVIDENCE_PREFIX = 'audit-prep-'

const STATUS_CONFIG: Record<ReadinessStatus, { label: string; icon: string; badge: string; ring: string }> = {
  pass:    { label: 'Ready',        icon: '\u2713', badge: 'bg-emerald-50 text-emerald-700 border-emerald-200', ring: 'text-emerald-600' },
  partial: { label: 'In progress',  icon: '\u25D0', badge: 'bg-amber-50 text-amber-700 border-amber-200',       ring: 'text-amber-600' },
  missing: { label: 'Not started',  icon: '\u25CB', badge: 'bg-red-50 text-red-700 border-red-200',             ring: 'text-red-600' },
}

const DOC_DOT: Record<DocStatus, string> = {
  approved: 'bg-emerald-500',
  uploaded: 'bg-amber-500',
  rejected: 'bg-red-500',
  missing:  'bg-gray-300',
}

const CATEGORIES: Category[] = [
  {
    id: 'governance',
    title: 'Governance',
    subtitle: 'Board oversight and accountability evidence',
    requirements: [
      { id: 'gov-board-expertise',   name: 'Board compliance expertise on record',        evidenceHint: 'Board CV pack or skills matrix',          relatedDocs: ['vara-board-resolution', 'adgm-controllers', 'cbb-governance'], jurisdictions: ['VARA', 'ADGM', 'CBB', 'CMA-SA', 'QFC'] },
      { id: 'gov-risk-committee',    name: 'Risk committee charter and minutes',          evidenceHint: 'Charter + two most recent minutes',       relatedDocs: ['adgm-risk-framework'], jurisdictions: ['VARA', 'ADGM', 'CBB', 'QFC'] },
      { id: 'gov-independent-audit', name: 'Independent audit function established',      evidenceHint: 'Engagement letter with external auditor', relatedDocs: ['vara-audited-financials', 'cbb-governance'], jurisdictions: ['VARA', 'ADGM', 'CBB', 'CMA-SA', 'QFC'] },
      { id: 'gov-conflicts-register',name: 'Conflicts of interest register maintained',   evidenceHint: 'Current register with signatures',        relatedDocs: [], jurisdictions: ['VARA', 'ADGM', 'CBB', 'CMA-SA', 'QFC'] },
    ],
  },
  {
    id: 'aml',
    title: 'AML / CFT',
    subtitle: 'Program design and operating effectiveness',
    requirements: [
      { id: 'aml-policy-current',    name: 'AML/CFT policy reviewed in last 12 months',   evidenceHint: 'Signed policy + board approval memo',     relatedDocs: ['vara-aml-policy', 'adgm-compliance-manual', 'cbb-aml-manual'], jurisdictions: ['VARA', 'ADGM', 'CBB', 'CMA-SA', 'QFC'] },
      { id: 'aml-mlro-appointed',    name: 'MLRO appointed and regulator-notified',       evidenceHint: 'Appointment letter + notification receipt',relatedDocs: ['vara-mlro-cv', 'adgm-fit-proper', 'cbb-key-persons'], jurisdictions: ['VARA', 'ADGM', 'CBB', 'CMA-SA', 'QFC'] },
      { id: 'aml-cdd-executed',      name: 'CDD/EDD applied to live customer base',       evidenceHint: 'Sample CDD files with audit trail',       relatedDocs: ['vara-cdd-procedures'], jurisdictions: ['VARA', 'ADGM', 'CBB', 'CMA-SA', 'QFC'] },
      { id: 'aml-txn-monitoring',    name: 'Transaction monitoring with tuned thresholds',evidenceHint: 'Rulebook + last quarter alert log',       relatedDocs: ['vara-txn-monitoring'], jurisdictions: ['VARA', 'ADGM', 'CBB', 'CMA-SA', 'QFC'] },
      { id: 'aml-sar-process',       name: 'SAR filing process tested end-to-end',        evidenceHint: 'Procedure + redacted filing example',     relatedDocs: ['vara-sar-procedures'], jurisdictions: ['VARA', 'ADGM', 'CBB', 'CMA-SA', 'QFC'] },
    ],
  },
  {
    id: 'travel',
    title: 'Travel Rule',
    subtitle: 'VASP-to-VASP data transmission readiness',
    requirements: [
      { id: 'travel-ivms-ready',        name: 'IVMS 101 transmission integrated',         evidenceHint: 'Vendor contract or integration attest',   relatedDocs: ['vara-travel-rule'], jurisdictions: ['VARA', 'ADGM', 'CBB'] },
      { id: 'travel-counterparty-dd',   name: 'Counterparty VASP due diligence procedure',evidenceHint: 'Procedure + counterparty register',       relatedDocs: ['vara-travel-rule'], jurisdictions: ['VARA', 'ADGM', 'CBB'] },
      { id: 'travel-threshold-logged',  name: 'Threshold monitoring (AED 3,500) logged',  evidenceHint: 'Last 30 days of threshold breach log',    relatedDocs: [], jurisdictions: ['VARA'] },
      { id: 'travel-retention',         name: 'Record retention policy covers travel data',evidenceHint: '5-year retention schedule excerpt',       relatedDocs: [], jurisdictions: ['VARA', 'ADGM', 'CBB'] },
    ],
  },
  {
    id: 'custody',
    title: 'Custody & Client Assets',
    subtitle: 'Segregation, reserves, and insurance evidence',
    requirements: [
      { id: 'custody-segregation',   name: 'Client asset segregation verified',           evidenceHint: 'Custodian letter or reconciliation',      relatedDocs: [], jurisdictions: ['VARA', 'ADGM', 'CBB', 'CMA-SA', 'QFC'] },
      { id: 'custody-cold-hot-split',name: 'Cold/hot wallet policy enforced',             evidenceHint: 'Policy + on-chain attestation',           relatedDocs: ['vara-tech-architecture'], jurisdictions: ['VARA', 'ADGM', 'CBB', 'CMA-SA', 'QFC'] },
      { id: 'custody-reserve-attest',name: 'Reserve attestation within last 30 days',     evidenceHint: 'Latest attestation report',               relatedDocs: ['vara-stablecoin-reserve', 'adgm-frt-reserve'], jurisdictions: ['VARA', 'ADGM'] },
      { id: 'custody-insurance',     name: 'Custody insurance in force',                  evidenceHint: 'Certificate of insurance',                relatedDocs: ['vara-capital-proof', 'adgm-capital', 'cbb-capital'], jurisdictions: ['VARA', 'ADGM', 'QFC'] },
    ],
  },
  {
    id: 'cma-sa',
    title: 'CMA-SA FinTech Lab',
    subtitle: 'Evidence specific to Saudi experimental permit',
    requirements: [
      { id: 'cmasa-permit-filed',     name: 'Experimental Permit application filed',     evidenceHint: 'Filing receipt or CMA reference number',  relatedDocs: [], jurisdictions: ['CMA-SA'] },
      { id: 'cmasa-cohort-agreement', name: 'Cohort participation agreement executed',   evidenceHint: 'Counter-signed agreement',                relatedDocs: [], jurisdictions: ['CMA-SA'] },
      { id: 'cmasa-disclosure-pack',  name: 'Consumer protection disclosure pack',       evidenceHint: 'Approved disclosure bundle',              relatedDocs: [], jurisdictions: ['CMA-SA'] },
    ],
  },
  {
    id: 'qfc',
    title: 'QFC Regulatory',
    subtitle: 'Controlled functions and Qatari disclosures',
    requirements: [
      { id: 'qfc-cf-register',       name: 'Controlled Functions register current',      evidenceHint: 'Register export with timestamps',         relatedDocs: [], jurisdictions: ['QFC'] },
      { id: 'qfc-individual-approvals',name:'Individual approval applications submitted',evidenceHint: 'Submission acknowledgements',             relatedDocs: [], jurisdictions: ['QFC'] },
      { id: 'qfc-qcb-disclosure',    name: 'Qatar Central Bank disclosure made',         evidenceHint: 'Disclosure cover letter + receipt',       relatedDocs: [], jurisdictions: ['QFC'] },
    ],
  },
]

function slugify(s: string): string {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 64) || 'tenant'
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

function loadDocStatuses(): Record<string, DocStatus> {
  if (typeof window === 'undefined') return {}
  try {
    const raw = window.localStorage.getItem(DOC_STATUS_KEY)
    return raw ? JSON.parse(raw) : {}
  } catch {
    return {}
  }
}

interface Props { jurisdictions: string[] }

export function AuditPrepView({ jurisdictions }: Props) {
  const { data } = useOnboarding()
  const plan = (data.plan || 'starter').toLowerCase()
  const unlocked = REVIEW_UNLOCKED_PLANS.includes(plan)

  const tenantId = slugify(data.companyName || 'demo-tenant')
  const labels = mapJurisdictionsToLabels(jurisdictions)
  const selectedSlugs = jurisdictions

  const [evidence, setEvidence] = useState<Record<string, VaultFileInfo>>({})
  const [docStatuses, setDocStatuses] = useState<Record<string, DocStatus>>({})
  const [busyReq, setBusyReq] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const inputRefs = useRef<Record<string, HTMLInputElement | null>>({})

  const authHeaders = useCallback(
    () => ({ 'x-tenant-id': tenantId, 'x-plan': plan }),
    [tenantId, plan]
  )

  useEffect(() => {
    setDocStatuses(loadDocStatuses())
    const onStorage = (e: StorageEvent) => {
      if (e.key === DOC_STATUS_KEY) setDocStatuses(loadDocStatuses())
    }
    window.addEventListener('storage', onStorage)
    return () => window.removeEventListener('storage', onStorage)
  }, [])

  useEffect(() => {
    if (!unlocked) return
    let cancelled = false
    ;(async () => {
      try {
        const res = await fetch('/api/vault', { headers: authHeaders() })
        if (!res.ok) return
        const json = await res.json()
        const files: VaultFileInfo[] = Array.isArray(json?.files) ? json.files : []
        if (cancelled) return
        const latest: Record<string, VaultFileInfo> = {}
        for (const f of files) {
          if (!f.docId?.startsWith(EVIDENCE_PREFIX)) continue
          const reqId = f.docId.slice(EVIDENCE_PREFIX.length)
          const prev = latest[reqId]
          if (!prev || new Date(f.uploadedAt) > new Date(prev.uploadedAt)) latest[reqId] = f
        }
        setEvidence(latest)
      } catch {
        // silent — dashboard remains usable without vault
      }
    })()
    return () => { cancelled = true }
  }, [authHeaders, unlocked])

  const visibleCategories = useMemo(() => {
    const match = (reqJs: string[]) => labels.length === 0 || reqJs.some((l) => labels.includes(l))
    return CATEGORIES
      .map((c) => ({ ...c, requirements: c.requirements.filter((r) => match(r.jurisdictions)) }))
      .filter((c) => c.requirements.length > 0)
  }, [labels])

  const statusOf = useCallback((req: Requirement): ReadinessStatus => {
    if (evidence[req.id]) return 'pass'
    if (req.relatedDocs.length > 0) {
      const statuses = req.relatedDocs.map((d) => docStatuses[d] || 'missing')
      if (statuses.every((s) => s === 'approved')) return 'pass'
      if (statuses.some((s) => s === 'approved' || s === 'uploaded')) return 'partial'
    }
    return 'missing'
  }, [evidence, docStatuses])

  const totals = useMemo(() => {
    let pass = 0, partial = 0, missing = 0, total = 0
    for (const c of visibleCategories) {
      for (const r of c.requirements) {
        total++
        const s = statusOf(r)
        if (s === 'pass') pass++
        else if (s === 'partial') partial++
        else missing++
      }
    }
    const readiness = total === 0 ? 0 : Math.round((pass / total) * 100)
    return { pass, partial, missing, total, readiness }
  }, [visibleCategories, statusOf])

  const criticalRisks = useMemo(() => {
    return JURISDICTIONS
      .filter((j) => selectedSlugs.includes(j.id))
      .flatMap((j) => j.hiddenRisks
        .filter((r) => r.severity === 'critical')
        .map((r) => ({ ...r, regulator: j.regulator, flag: j.flag }))
      )
  }, [selectedSlugs])

  const uploadEvidence = useCallback(async (reqId: string, file: File) => {
    if (!unlocked) return
    setError(null)
    setBusyReq(reqId)
    try {
      const docId = EVIDENCE_PREFIX + reqId
      const existing = evidence[reqId]
      if (existing) {
        await fetch(`/api/vault?id=${encodeURIComponent(existing.id)}`, {
          method: 'DELETE',
          headers: authHeaders(),
        })
      }
      const fd = new FormData()
      fd.append('file', file)
      fd.append('docId', docId)
      const res = await fetch('/api/vault', {
        method: 'POST',
        headers: authHeaders(),
        body: fd,
      })
      if (!res.ok) {
        const msg = await res.text().catch(() => 'Upload failed')
        throw new Error(msg || 'Upload failed')
      }
      const info: VaultFileInfo = await res.json()
      setEvidence((prev) => ({ ...prev, [reqId]: info }))
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Upload failed')
    } finally {
      setBusyReq(null)
    }
  }, [authHeaders, evidence, unlocked])

  const removeEvidence = useCallback(async (reqId: string) => {
    const info = evidence[reqId]
    if (!info) return
    setBusyReq(reqId)
    setError(null)
    try {
      const res = await fetch(`/api/vault?id=${encodeURIComponent(info.id)}`, {
        method: 'DELETE',
        headers: authHeaders(),
      })
      if (!res.ok) throw new Error('Delete failed')
      setEvidence((prev) => {
        const next = { ...prev }
        delete next[reqId]
        return next
      })
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Delete failed')
    } finally {
      setBusyReq(null)
    }
  }, [authHeaders, evidence])

  // SVG geometry
  const R = 26
  const C = 2 * Math.PI * R
  const offset = C - (totals.readiness / 100) * C

  return (
    <div className="space-y-6">
      <div>
        <div className="inline-block px-2.5 py-1 bg-gold/10 text-gold text-[length:var(--text-xs)] font-bold uppercase rounded mb-3">
          {unlocked ? 'Pro' : 'Preview'}
        </div>
        <h1 className="font-display font-bold text-text text-[length:var(--text-lg)]">Audit Preparation</h1>
        <p className="text-text-muted text-[length:var(--text-sm)] mt-1 max-w-2xl">
          Evidence of controls &mdash; distinct from the Documents tab, which tracks filings. Readiness is synthesized
          from approved filings plus evidence you attach here.
        </p>
      </div>

      {!unlocked && <UpgradeBanner title="Audit Preparation" />}

      <div className="bg-bg-primary border border-border rounded-2xl p-5 sm:p-6">
        <p className="font-mono text-text-faint uppercase tracking-widest text-[length:var(--text-xs)] mb-3">How readiness is measured</p>
        <p className="text-text-muted text-[length:var(--text-sm)] leading-relaxed">
          A requirement is <span className="text-text font-medium">Ready</span> when either the feeder filings in your
          Document Vault are all approved, or you have attached on-site evidence here (training logs, minutes,
          attestations). It is <span className="text-text font-medium">In progress</span> while feeder filings are
          partially approved, and <span className="text-text font-medium">Not started</span> otherwise.
        </p>
      </div>

      <div className="bg-bg-primary border border-border rounded-2xl p-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
          <div className="relative w-28 h-28 shrink-0">
            <svg viewBox="0 0 72 72" className="w-full h-full">
              <g transform="rotate(-90 36 36)">
                <circle cx="36" cy="36" r={R} fill="none" stroke="var(--border)" strokeWidth="6" />
                <circle cx="36" cy="36" r={R} fill="none" stroke="var(--gold)" strokeWidth="6" strokeLinecap="round"
                  strokeDasharray={C} strokeDashoffset={offset} />
              </g>
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="font-mono text-gold font-bold text-[length:var(--text-xl)] leading-none">{totals.readiness}%</span>
              <span className="font-mono text-text-faint text-[length:var(--text-xs)] mt-1">Ready</span>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-5 flex-1 w-full">
            <div>
              <p className="font-mono text-emerald-600 font-bold text-[length:var(--text-lg)]">{totals.pass}</p>
              <p className="text-text-faint text-[length:var(--text-xs)]">Ready</p>
            </div>
            <div>
              <p className="font-mono text-amber-600 font-bold text-[length:var(--text-lg)]">{totals.partial}</p>
              <p className="text-text-faint text-[length:var(--text-xs)]">In progress</p>
            </div>
            <div>
              <p className="font-mono text-red-600 font-bold text-[length:var(--text-lg)]">{totals.missing}</p>
              <p className="text-text-faint text-[length:var(--text-xs)]">Not started</p>
            </div>
          </div>
        </div>
      </div>

      {criticalRisks.length > 0 && (
        <div className="bg-bg-primary border border-red-200 rounded-2xl p-6">
          <div className="flex items-center gap-2 mb-4">
            <span className="text-red-600" aria-hidden="true">&#9888;</span>
            <h2 className="font-display font-bold text-text text-[length:var(--text-base)]">Regulator hot buttons</h2>
          </div>
          <p className="text-text-muted text-[length:var(--text-sm)] mb-4">
            Issues the regulators across your selected jurisdictions are actively examining. Treat each as an assumed
            question before the on-site visit.
          </p>
          <ul className="space-y-3">
            {criticalRisks.map((r, i) => (
              <li key={`${r.regulator}-${i}`} className="flex items-start gap-3">
                <span className="text-[length:var(--text-base)] shrink-0" aria-hidden="true">{r.flag}</span>
                <div className="min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-text font-medium text-[length:var(--text-sm)]">{r.title}</span>
                    <span className="font-mono text-red-700 bg-red-50 border border-red-200 rounded px-1.5 py-0.5 text-[length:var(--text-xs)] uppercase">{r.regulator}</span>
                  </div>
                  <p className="text-text-muted text-[length:var(--text-xs)] mt-1 leading-relaxed">{r.description}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-red-700 text-[length:var(--text-sm)]">
          {error}
        </div>
      )}

      {visibleCategories.map((cat) => (
        <div key={cat.id} className="bg-bg-primary border border-border rounded-2xl p-6">
          <div className="mb-5">
            <h2 className="font-display font-bold text-text text-[length:var(--text-base)]">{cat.title}</h2>
            <p className="text-text-faint text-[length:var(--text-xs)] mt-1">{cat.subtitle}</p>
          </div>
          <ul className="divide-y divide-border">
            {cat.requirements.map((req) => {
              const status = statusOf(req)
              const cfg = STATUS_CONFIG[status]
              const attached = evidence[req.id]
              const isBusy = busyReq === req.id
              return (
                <li key={req.id} className="py-4 first:pt-0 last:pb-0">
                  <div className="flex flex-col sm:flex-row sm:items-start gap-4">
                    <div className="flex items-start gap-3 flex-1 min-w-0">
                      <span className={`${cfg.ring} text-[length:var(--text-base)] mt-0.5 shrink-0`} aria-hidden="true">{cfg.icon}</span>
                      <div className="min-w-0">
                        <p className="text-text font-medium text-[length:var(--text-sm)]">{req.name}</p>
                        <p className="text-text-faint text-[length:var(--text-xs)] mt-0.5">{req.evidenceHint}</p>
                        {req.relatedDocs.length > 0 && (
                          <div className="mt-2 flex items-center gap-2 flex-wrap">
                            <span className="font-mono text-text-faint text-[length:var(--text-xs)] uppercase tracking-widest">Feeds from Vault</span>
                            {req.relatedDocs.map((docId) => {
                              const ds = (docStatuses[docId] || 'missing') as DocStatus
                              return (
                                <span key={docId} className="inline-flex items-center gap-1.5 text-[length:var(--text-xs)] text-text-muted bg-bg-surface rounded-full px-2 py-0.5" title={`${docId}: ${ds}`}>
                                  <span className={`w-1.5 h-1.5 rounded-full ${DOC_DOT[ds]}`} />
                                  <span className="font-mono">{docId}</span>
                                </span>
                              )
                            })}
                          </div>
                        )}
                        {attached && (
                          <div className="mt-2 text-text-muted text-[length:var(--text-xs)]">
                            <span className="font-mono">{attached.filename}</span>
                            <span className="mx-1.5">&middot;</span>
                            <span>{formatFileSize(attached.size)}</span>
                            <span className="mx-1.5">&middot;</span>
                            <span>Encrypted at rest</span>
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <span className={`text-[length:var(--text-xs)] px-2 py-0.5 rounded-full border font-medium ${cfg.badge}`}>
                        {cfg.label}
                      </span>
                      {unlocked ? (
                        <>
                          <input
                            ref={(el) => { inputRefs.current[req.id] = el }}
                            type="file"
                            className="hidden"
                            onChange={(e) => {
                              const f = e.target.files?.[0]
                              if (f) uploadEvidence(req.id, f)
                              e.target.value = ''
                            }}
                          />
                          <button
                            type="button"
                            disabled={isBusy}
                            onClick={() => inputRefs.current[req.id]?.click()}
                            className="px-3 py-1.5 bg-bg-surface border border-border rounded-lg text-text text-[length:var(--text-xs)] font-medium hover:bg-bg-primary transition-colors disabled:opacity-50"
                          >
                            {isBusy ? 'Working\u2026' : attached ? 'Replace' : 'Attach evidence'}
                          </button>
                          {attached && (
                            <button
                              type="button"
                              disabled={isBusy}
                              onClick={() => removeEvidence(req.id)}
                              className="px-3 py-1.5 text-text-muted text-[length:var(--text-xs)] hover:text-red-600 transition-colors disabled:opacity-50"
                            >
                              Remove
                            </button>
                          )}
                        </>
                      ) : (
                        <span className="font-mono text-text-faint text-[length:var(--text-xs)]">Upload on Pro</span>
                      )}
                    </div>
                  </div>
                </li>
              )
            })}
          </ul>
        </div>
      ))}

      {visibleCategories.length === 0 && (
        <div className="bg-bg-primary border border-border rounded-2xl p-6 text-text-muted text-[length:var(--text-sm)]">
          No requirements match your selected jurisdictions yet. Add jurisdictions in onboarding to populate this view.
        </div>
      )}
    </div>
  )
}
