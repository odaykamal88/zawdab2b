'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { useOnboarding } from '@/lib/onboarding-context'
import { UpgradeBanner, mapJurisdictionsToLabels } from './pro/UpgradeBanner'

type DocStatus = 'missing' | 'draft' | 'uploaded' | 'approved'

interface Document {
  id: string
  name: string
  category: string
  status: DocStatus
  requiredFor: string
  jurisdiction: string
  description: string
  dueDate?: string
}

/**
 * DEFENSE GUIDELINE: Principle 1 — Document requirements per jurisdiction and license
 * type must be served from a backend API. The regulatory knowledge graph (which docs
 * are required for which license step) is proprietary.
 *
 * Principle 2: Document review workflow feeds SAR generation and compliance case data.
 * Principle 6: Client document history creates switching costs — 6 months of uploaded
 * docs with audit trails makes migration to a competitor impractical.
 * File encryption (AES-256) must be handled server-side with managed keys.
 */
const VARA_DOCUMENTS: Document[] = [
  // Entity Setup
  { id: 'vara-trade-license', name: 'Trade License (Dubai)', category: 'Entity Setup', status: 'missing', requiredFor: 'VARA Step 1', jurisdiction: 'vara', description: 'Valid Dubai Department of Economy trade license with VASP-related activity codes.' },
  { id: 'vara-moa', name: 'Memorandum of Association', category: 'Entity Setup', status: 'missing', requiredFor: 'VARA Step 1', jurisdiction: 'vara', description: 'Notarized MOA showing company structure, authorized activities, and shareholder details.' },
  { id: 'vara-shareholder-register', name: 'Shareholder Register & UBO Declarations', category: 'Entity Setup', status: 'missing', requiredFor: 'VARA Step 1', jurisdiction: 'vara', description: 'Complete register with Ultimate Beneficial Owner declarations for all shareholders holding >10%.' },
  { id: 'vara-board-resolution', name: 'Board Resolution — VASP Application', category: 'Entity Setup', status: 'missing', requiredFor: 'VARA Step 1', jurisdiction: 'vara', description: 'Board resolution authorizing the VASP license application and naming the responsible officer.' },
  // Application
  { id: 'vara-business-plan', name: 'Business Plan (3-year projections)', category: 'Application', status: 'missing', requiredFor: 'VARA Step 2, 5', jurisdiction: 'vara', description: 'Detailed 3-year business plan including revenue model, market analysis, competitive landscape, and financial projections.' },
  { id: 'vara-tech-architecture', name: 'Technology Architecture Document', category: 'Application', status: 'missing', requiredFor: 'VARA Step 2', jurisdiction: 'vara', description: 'System architecture diagram, data flow, wallet infrastructure, and third-party integrations.' },
  // Compliance
  { id: 'vara-aml-policy', name: 'AML/CFT Policy Manual', category: 'Compliance', status: 'missing', requiredFor: 'VARA Step 4', jurisdiction: 'vara', description: 'Comprehensive AML/CFT manual covering risk assessment, CDD, EDD, screening, and transaction monitoring.', dueDate: 'Required before Step 4 review' },
  { id: 'vara-cdd-procedures', name: 'CDD/EDD Procedures', category: 'Compliance', status: 'missing', requiredFor: 'VARA Step 4', jurisdiction: 'vara', description: 'Customer Due Diligence and Enhanced Due Diligence procedures for onboarding, ongoing monitoring, and high-risk customers.' },
  { id: 'vara-txn-monitoring', name: 'Transaction Monitoring Rulebook', category: 'Compliance', status: 'missing', requiredFor: 'VARA Step 4', jurisdiction: 'vara', description: 'Rules and thresholds for automated transaction monitoring, including blockchain analytics integration.' },
  { id: 'vara-sar-procedures', name: 'SAR Filing Procedures', category: 'Compliance', status: 'missing', requiredFor: 'VARA Step 4', jurisdiction: 'vara', description: 'Suspicious Activity Report filing procedures including internal escalation, goAML submission, and record-keeping.' },
  { id: 'vara-travel-rule', name: 'Travel Rule Implementation Plan', category: 'Compliance', status: 'missing', requiredFor: 'VARA Step 4', jurisdiction: 'vara', description: 'IVMS 101 implementation plan with counterparty VASP integration details. In effect since March 2026.' },
  // Key Persons
  { id: 'vara-mlro-cv', name: 'MLRO CV & Qualifications', category: 'Key Persons', status: 'missing', requiredFor: 'VARA Step 3', jurisdiction: 'vara', description: 'CV showing AML/CFT qualifications, relevant certifications (CAMS, ICA), and UAE residency proof.' },
  { id: 'vara-co-cv', name: 'Compliance Officer CV & Qualifications', category: 'Key Persons', status: 'missing', requiredFor: 'VARA Step 3', jurisdiction: 'vara', description: 'Designated Compliance Officer CV with regulatory compliance experience and relevant certifications.' },
  { id: 'vara-background-checks', name: 'Police Clearance Certificates (All Directors)', category: 'Key Persons', status: 'missing', requiredFor: 'VARA Step 6', jurisdiction: 'vara', description: 'Police clearance from country of residence for all directors and key persons, not older than 3 months.' },
  // Technology
  { id: 'vara-cybersecurity', name: 'Cybersecurity Framework', category: 'Technology', status: 'missing', requiredFor: 'VARA Step 7', jurisdiction: 'vara', description: 'Information security policy, incident response plan, and alignment with ISO 27001 or NIST CSF.' },
  { id: 'vara-pentest', name: 'Penetration Test Report', category: 'Technology', status: 'missing', requiredFor: 'VARA Step 7', jurisdiction: 'vara', description: 'Third-party penetration test report not older than 6 months. Must cover web, API, and infrastructure.' },
  { id: 'vara-bcp', name: 'Business Continuity Plan', category: 'Technology', status: 'missing', requiredFor: 'VARA Step 7', jurisdiction: 'vara', description: 'BCP and disaster recovery plan with defined RTO/RPO, tested backup procedures, and escalation matrix.' },
  // Financial
  { id: 'vara-capital-proof', name: 'Bank Statements — Capital Adequacy', category: 'Financial', status: 'missing', requiredFor: 'VARA Step 8', jurisdiction: 'vara', description: 'Bank statements evidencing minimum capital held in a UAE-regulated bank. Must be current within 30 days.' },
  { id: 'vara-audited-financials', name: 'Audited Financial Statements', category: 'Financial', status: 'missing', requiredFor: 'VARA Step 8', jurisdiction: 'vara', description: 'Most recent audited financials prepared by a UAE-registered auditor. Required if entity has been operational >12 months.' },
  // Stablecoin-specific
  { id: 'vara-stablecoin-reserve', name: 'Reserve Composition & Attestation Report', category: 'Stablecoin', status: 'missing', requiredFor: 'Stablecoin License', jurisdiction: 'vara', description: 'Monthly independent attestation of 1:1 fiat reserves held in segregated UAE bank accounts. Only cash and short-term sovereign debt (UAE T-bills) are accepted. Crypto-collateralized reserves are prohibited.' },
  { id: 'vara-stablecoin-whitepaper', name: 'Stablecoin White Paper', category: 'Stablecoin', status: 'missing', requiredFor: 'Stablecoin License', jurisdiction: 'vara', description: 'Technical and legal white paper covering token mechanism, reserve management, redemption process, governance structure, and risk disclosures.' },
  { id: 'vara-cbuae-approval', name: 'CBUAE Pre-Approval (AED-pegged tokens)', category: 'Stablecoin', status: 'missing', requiredFor: 'Stablecoin License', jurisdiction: 'vara', description: 'Central Bank of the UAE pre-approval required for any AED-denominated payment token. Dual regulatory approval (VARA + CBUAE) is mandatory.' },
  { id: 'vara-stablecoin-redemption', name: 'Redemption & Wind-Down Plan', category: 'Stablecoin', status: 'missing', requiredFor: 'Stablecoin License', jurisdiction: 'vara', description: 'Detailed plan for on-demand par-value redemption and orderly wind-down in case of license revocation or voluntary cessation.' },
]

const ADGM_DOCUMENTS: Document[] = [
  { id: 'adgm-reg-business-plan', name: 'Regulatory Business Plan', category: 'Application', status: 'missing', requiredFor: 'ADGM Step 1', jurisdiction: 'adgm', description: 'FSRA-format business plan with detailed activity descriptions, target market, and 3-year financial projections.' },
  { id: 'adgm-controllers', name: 'Controllers & Close Links Declaration', category: 'Entity Setup', status: 'missing', requiredFor: 'ADGM Step 1', jurisdiction: 'adgm', description: 'Declaration of all controllers, shareholders with >10% holding, and close links to other regulated entities.' },
  { id: 'adgm-compliance-manual', name: 'Compliance Arrangements Manual', category: 'Compliance', status: 'missing', requiredFor: 'ADGM Step 2', jurisdiction: 'adgm', description: 'Comprehensive compliance manual covering AML/CFT, market conduct, client money, and best execution.' },
  { id: 'adgm-risk-framework', name: 'Risk Management Framework', category: 'Compliance', status: 'missing', requiredFor: 'ADGM Step 2', jurisdiction: 'adgm', description: 'Enterprise risk management framework including operational, market, credit, and technology risk.' },
  { id: 'adgm-fit-proper', name: 'Fit & Proper Assessments (Key Persons)', category: 'Key Persons', status: 'missing', requiredFor: 'ADGM Step 3', jurisdiction: 'adgm', description: 'FSRA fit and proper assessment forms for all Approved Persons including SEO, Finance Officer, and MLRO.' },
  { id: 'adgm-tech-risk', name: 'Technology Risk Assessment', category: 'Technology', status: 'missing', requiredFor: 'ADGM Step 4', jurisdiction: 'adgm', description: 'Technology governance, cybersecurity controls, and third-party technology provider due diligence.' },
  { id: 'adgm-capital', name: 'Capital Resources Statement', category: 'Financial', status: 'missing', requiredFor: 'ADGM Step 5', jurisdiction: 'adgm', description: 'Statement of capital resources and expenditure-based capital requirement calculation per FSRA rules.' },
  { id: 'adgm-frt-application', name: 'FRT Issuer Application', category: 'Stablecoin', status: 'missing', requiredFor: 'FRT License', jurisdiction: 'adgm', description: 'Fiat-Referenced Token issuer application including reserve management framework, HQLA composition, stress testing methodology, and redemption guarantee mechanism.' },
  { id: 'adgm-frt-reserve', name: 'Reserve Management & HQLA Report', category: 'Stablecoin', status: 'missing', requiredFor: 'FRT License', jurisdiction: 'adgm', description: 'Reserve composition report showing High-Quality Liquid Assets held in ADGM-recognized banks. Real-time monitoring and quarterly stress testing required.' },
]

const CBB_DOCUMENTS: Document[] = [
  { id: 'cbb-application-form', name: 'CBB License Application Form', category: 'Application', status: 'missing', requiredFor: 'CBB Step 1', jurisdiction: 'cbb', description: 'Official CBB crypto-asset service provider application form with all schedules completed.' },
  { id: 'cbb-aml-manual', name: 'AML/CFT Compliance Manual', category: 'Compliance', status: 'missing', requiredFor: 'CBB Step 2', jurisdiction: 'cbb', description: 'AML/CFT manual aligned with CBB Volume 6 requirements for crypto-asset service providers.' },
  { id: 'cbb-governance', name: 'Corporate Governance Framework', category: 'Compliance', status: 'missing', requiredFor: 'CBB Step 2', jurisdiction: 'cbb', description: 'Board composition, committee structure, internal audit, and compliance monitoring arrangements.' },
  { id: 'cbb-key-persons', name: 'Key Persons Documentation', category: 'Key Persons', status: 'missing', requiredFor: 'CBB Step 3', jurisdiction: 'cbb', description: 'CV, qualifications, police clearance, and CBB personal questionnaire for all approved persons.' },
  { id: 'cbb-capital', name: 'Capital Adequacy Evidence', category: 'Financial', status: 'missing', requiredFor: 'CBB Step 4', jurisdiction: 'cbb', description: 'Evidence of minimum paid-up capital per CBB category requirements held in a Bahrain-licensed bank.' },
]

export const ALL_DOCUMENTS = [...VARA_DOCUMENTS, ...ADGM_DOCUMENTS, ...CBB_DOCUMENTS]

// ---- Document Review (plan-gated) ----
// Expert-review layer on top of the vault. Subscribed plans see reviewer
// assignments, compliance scores, and line-level findings. Free/Starter plans
// see a locked teaser with upgrade CTA.
type ReviewStatus = 'reviewed' | 'in-review' | 'needs-revision' | 'pending'
interface ReviewEntry {
  name: string
  status: ReviewStatus
  score: number | null
  reviewer: string | null
  date: string | null
  issues: number | null
  jurisdiction: string // regulator label
}
const REVIEW_ENTRIES: ReviewEntry[] = [
  { name: 'AML/CFT Policy v3.2', status: 'reviewed', score: 92, reviewer: 'Sarah K.', date: '2026-04-07', issues: 1, jurisdiction: 'VARA' },
  { name: 'Business Plan — VARA Application', status: 'in-review', score: null, reviewer: 'Ahmed R.', date: '2026-04-10', issues: null, jurisdiction: 'VARA' },
  { name: 'KYC Procedures Manual', status: 'reviewed', score: 78, reviewer: 'Sarah K.', date: '2026-04-03', issues: 4, jurisdiction: 'ADGM' },
  { name: 'Governance Framework', status: 'needs-revision', score: 65, reviewer: 'Omar H.', date: '2026-04-01', issues: 7, jurisdiction: 'VARA' },
  { name: 'Risk Assessment Methodology', status: 'reviewed', score: 88, reviewer: 'Ahmed R.', date: '2026-03-28', issues: 2, jurisdiction: 'ADGM' },
  { name: 'Technology & Security Standards', status: 'pending', score: null, reviewer: null, date: null, issues: null, jurisdiction: 'CBB' },
  { name: 'Sandbox Cohort Application', status: 'in-review', score: null, reviewer: 'Omar H.', date: '2026-04-09', issues: null, jurisdiction: 'CBB' },
  { name: 'Digital Asset Prospectus Draft', status: 'needs-revision', score: 71, reviewer: 'Layla M.', date: '2026-04-05', issues: 5, jurisdiction: 'CMA-SA' },
  { name: 'Custody Operations Manual', status: 'reviewed', score: 85, reviewer: 'Khalid Q.', date: '2026-03-30', issues: 3, jurisdiction: 'QFC' },
]
const REVIEW_STATUS_STYLES: Record<ReviewStatus, { label: string; color: string }> = {
  'reviewed': { label: 'Reviewed', color: 'bg-emerald-50 text-emerald-700' },
  'in-review': { label: 'In Review', color: 'bg-blue-50 text-blue-700' },
  'needs-revision': { label: 'Needs Revision', color: 'bg-orange-50 text-orange-700' },
  'pending': { label: 'Pending Upload', color: 'bg-gray-100 text-gray-600' },
}
const REVIEW_UNLOCKED_PLANS = ['professional', 'navigator']

const STATUS_CONFIG: Record<DocStatus, { label: string; bg: string; text: string; ring: string; description: string }> = {
  missing: { label: 'Missing', bg: 'bg-red-50', text: 'text-red-600', ring: 'ring-red-200', description: 'Not yet uploaded — required for application' },
  draft: { label: 'Draft', bg: 'bg-amber-50', text: 'text-amber-600', ring: 'ring-amber-200', description: 'Uploaded but flagged as draft — needs review' },
  uploaded: { label: 'Uploaded', bg: 'bg-blue-50', text: 'text-blue-600', ring: 'ring-blue-200', description: 'Encrypted and stored — pending team review' },
  approved: { label: 'Approved', bg: 'bg-emerald-50', text: 'text-emerald-600', ring: 'ring-emerald-200', description: 'Reviewed and approved — ready for submission' },
}

const DOC_STATUS_KEY = 'zawda_documents_statuses'

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

function loadStatuses(): Record<string, DocStatus> {
  try {
    const stored = localStorage.getItem(DOC_STATUS_KEY)
    if (stored) return JSON.parse(stored)
  } catch { /* ignore */ }
  return {}
}

function saveStatuses(s: Record<string, DocStatus>) {
  try { localStorage.setItem(DOC_STATUS_KEY, JSON.stringify(s)) } catch { /* ignore */ }
}

function slugify(s: string): string {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 64) || 'tenant'
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

interface DocumentsViewProps {
  jurisdictions: string[]
}

export function DocumentsView({ jurisdictions: jurisdictionsProp }: DocumentsViewProps) {
  const { data } = useOnboarding()
  const tenantId = slugify(data.companyName || 'demo-tenant')
  const plan = data.plan || 'starter'
  const [filter, setFilter] = useState<string>('all')
  const [statuses, setStatuses] = useState<Record<string, DocStatus>>({})
  const [files, setFiles] = useState<Record<string, VaultFileInfo>>({})
  const [loaded, setLoaded] = useState(false)
  const [uploadingId, setUploadingId] = useState<string | null>(null)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const pendingDocRef = useRef<string | null>(null)

  const authHeaders = useCallback(() => ({
    'x-tenant-id': tenantId,
    'x-plan': plan,
  }), [tenantId, plan])

  useEffect(() => {
    setStatuses(loadStatuses())
    let cancelled = false
    ;(async () => {
      try {
        const res = await fetch('/api/vault', { headers: authHeaders() })
        if (!res.ok) throw new Error('fetch failed')
        const json = await res.json()
        if (cancelled) return
        const map: Record<string, VaultFileInfo> = {}
        for (const rec of json.records as VaultFileInfo[]) {
          // Keep the most recent record per docId
          const existing = map[rec.docId]
          if (!existing || new Date(rec.uploadedAt) > new Date(existing.uploadedAt)) {
            map[rec.docId] = rec
          }
        }
        setFiles(map)
      } catch {
        /* show empty */
      } finally {
        if (!cancelled) setLoaded(true)
      }
    })()
    return () => { cancelled = true }
  }, [authHeaders])

  // Filter documents by jurisdiction
  const jurisdictions = jurisdictionsProp.length > 0 ? jurisdictionsProp : ['vara', 'adgm', 'cbb']

  const documents = ALL_DOCUMENTS.filter((d) => jurisdictions.includes(d.jurisdiction))

  const getStatus = useCallback((docId: string, defaultStatus: DocStatus): DocStatus => {
    return statuses[docId] ?? defaultStatus
  }, [statuses])

  const categories = [...new Set(documents.map((d) => d.category))]
  const filtered = filter === 'all' ? documents : documents.filter((d) => d.category === filter)

  const missingCount = documents.filter((d) => getStatus(d.id, d.status) === 'missing').length
  const draftCount = documents.filter((d) => getStatus(d.id, d.status) === 'draft').length
  const uploadedCount = documents.filter((d) => ['uploaded', 'approved'].includes(getStatus(d.id, d.status))).length
  const approvedCount = documents.filter((d) => getStatus(d.id, d.status) === 'approved').length

  function triggerUpload(docId: string) {
    pendingDocRef.current = docId
    fileInputRef.current?.click()
  }

  async function handleFileSelected(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    const docId = pendingDocRef.current
    e.target.value = ''
    if (!file || !docId) return

    setUploadingId(docId)
    setErrorMsg(null)
    try {
      // If replacing an existing file, delete the old record first.
      const existing = files[docId]
      if (existing) {
        await fetch(`/api/vault/${existing.id}`, { method: 'DELETE', headers: authHeaders() }).catch(() => {})
      }

      const form = new FormData()
      form.append('file', file)
      form.append('docId', docId)
      const res = await fetch('/api/vault', { method: 'POST', headers: authHeaders(), body: form })
      const json = await res.json()
      if (!res.ok) {
        setErrorMsg(json.error || 'Upload failed')
        return
      }
      const record = json.record as VaultFileInfo
      setFiles((prev) => ({ ...prev, [docId]: record }))
      const nextStatuses = { ...statuses, [docId]: 'uploaded' as DocStatus }
      setStatuses(nextStatuses)
      saveStatuses(nextStatuses)
    } catch {
      setErrorMsg('Upload failed — check your connection.')
    } finally {
      setUploadingId(null)
      pendingDocRef.current = null
    }
  }

  async function handleDelete(docId: string) {
    const existing = files[docId]
    if (!existing) return
    try {
      await fetch(`/api/vault/${existing.id}`, { method: 'DELETE', headers: authHeaders() })
    } catch { /* ignore */ }
    setFiles((prev) => {
      const next = { ...prev }
      delete next[docId]
      return next
    })
    const nextStatuses = { ...statuses, [docId]: 'missing' as DocStatus }
    setStatuses(nextStatuses)
    saveStatuses(nextStatuses)
  }

  function downloadUrl(id: string): string {
    return `/api/vault/${id}`
  }

  async function handleDownload(docId: string) {
    const existing = files[docId]
    if (!existing) return
    try {
      const res = await fetch(downloadUrl(existing.id), { headers: authHeaders() })
      if (!res.ok) { setErrorMsg('Download failed'); return }
      const blob = await res.blob()
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = existing.filename
      document.body.appendChild(a)
      a.click()
      a.remove()
      URL.revokeObjectURL(url)
    } catch {
      setErrorMsg('Download failed')
    }
  }

  function setStatus(docId: string, status: DocStatus) {
    const next = { ...statuses, [docId]: status }
    setStatuses(next)
    saveStatuses(next)
  }

  if (!loaded) return null

  return (
    <div className="space-y-6">
      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        className="hidden"
        accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.csv,.json,.xml"
        onChange={handleFileSelected}
      />

      <div>
        <h1 className="font-display font-bold text-text text-[length:var(--text-lg)]">Document Vault</h1>
        <p className="text-text-muted text-[length:var(--text-sm)]">
          Upload, encrypt, and track every document required for your license application.
          All files are <strong className="text-text">AES-256 encrypted at rest</strong>.
        </p>
      </div>

      {errorMsg && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-3 flex items-start justify-between gap-3">
          <p className="text-red-700 text-[length:var(--text-xs)] leading-relaxed">{errorMsg}</p>
          <button
            onClick={() => setErrorMsg(null)}
            className="text-red-600 text-[length:var(--text-xs)] font-medium hover:text-red-800 cursor-pointer shrink-0"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Summary */}
      <div className="grid sm:grid-cols-5 gap-3">
        <div className="bg-bg-primary border border-border rounded-xl p-4">
          <p className="font-mono text-text-faint text-[length:var(--text-xs)] uppercase">Total</p>
          <p className="font-mono text-text font-bold text-[length:var(--text-lg)] mt-1">{documents.length}</p>
        </div>
        <div className="bg-bg-primary border border-red-200 rounded-xl p-4">
          <p className="font-mono text-text-faint text-[length:var(--text-xs)] uppercase">Missing</p>
          <p className="font-mono text-red-600 font-bold text-[length:var(--text-lg)] mt-1">{missingCount}</p>
        </div>
        <div className="bg-bg-primary border border-amber-200 rounded-xl p-4">
          <p className="font-mono text-text-faint text-[length:var(--text-xs)] uppercase">Draft</p>
          <p className="font-mono text-amber-600 font-bold text-[length:var(--text-lg)] mt-1">{draftCount}</p>
        </div>
        <div className="bg-bg-primary border border-blue-200 rounded-xl p-4">
          <p className="font-mono text-text-faint text-[length:var(--text-xs)] uppercase">Uploaded</p>
          <p className="font-mono text-blue-600 font-bold text-[length:var(--text-lg)] mt-1">{uploadedCount}</p>
        </div>
        <div className="bg-bg-primary border border-emerald-200 rounded-xl p-4">
          <p className="font-mono text-text-faint text-[length:var(--text-xs)] uppercase">Approved</p>
          <p className="font-mono text-emerald-600 font-bold text-[length:var(--text-lg)] mt-1">{approvedCount}</p>
        </div>
      </div>

      {/* Progress bar */}
      <div>
        <div className="flex items-center justify-between mb-1.5">
          <p className="text-text text-[length:var(--text-sm)] font-medium">Application readiness</p>
          <p className="font-mono text-gold font-bold text-[length:var(--text-sm)]">{documents.length > 0 ? Math.round(((uploadedCount + approvedCount) / documents.length) * 100) : 0}%</p>
        </div>
        <div className="h-2 bg-bg-surface-2 rounded-full overflow-hidden">
          <div className="h-full bg-gold rounded-full transition-all duration-500" style={{ width: `${documents.length > 0 ? ((uploadedCount + approvedCount) / documents.length) * 100 : 0}%` }} />
        </div>
      </div>

      {/* Filter */}
      <div className="flex gap-2 flex-wrap">
        <button onClick={() => setFilter('all')} className={`px-3 py-1.5 rounded-lg text-[length:var(--text-xs)] font-medium cursor-pointer transition-colors ${filter === 'all' ? 'bg-gold text-white' : 'bg-bg-surface text-text-muted hover:text-text'}`}>
          All ({documents.length})
        </button>
        {categories.map((cat) => {
          const count = documents.filter((d) => d.category === cat).length
          return (
            <button key={cat} onClick={() => setFilter(cat)} className={`px-3 py-1.5 rounded-lg text-[length:var(--text-xs)] font-medium cursor-pointer transition-colors ${filter === cat ? 'bg-gold text-white' : 'bg-bg-surface text-text-muted hover:text-text'}`}>
              {cat} ({count})
            </button>
          )
        })}
      </div>

      {/* Status legend */}
      <div className="flex gap-4 flex-wrap">
        {(Object.entries(STATUS_CONFIG) as [DocStatus, typeof STATUS_CONFIG[DocStatus]][]).map(([key, config]) => (
          <div key={key} className="flex items-center gap-1.5">
            <span className={`w-2.5 h-2.5 rounded-full ${config.bg} ring-1 ${config.ring}`} />
            <span className="text-text-faint text-[length:var(--text-xs)]">{config.label}</span>
          </div>
        ))}
      </div>

      {/* Document list */}
      <div className="space-y-2">
        {filtered.map((doc) => {
          const status = getStatus(doc.id, doc.status)
          const style = STATUS_CONFIG[status]
          const fileInfo = files[doc.id]
          const isExpanded = expandedId === doc.id
          const isUploading = uploadingId === doc.id

          return (
            <div key={doc.id} className={`bg-bg-primary border rounded-xl overflow-hidden transition-all ${isExpanded ? 'border-gold' : 'border-border'}`}>
              {/* Main row */}
              <div className="p-4 flex items-center gap-4">
                <button
                  onClick={() => setExpandedId(isExpanded ? null : doc.id)}
                  className="flex-1 min-w-0 text-left cursor-pointer"
                >
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="text-text font-medium text-[length:var(--text-sm)]">{doc.name}</h3>
                    {doc.dueDate && <span className="text-red-500 text-[length:var(--text-xs)] font-bold">{doc.dueDate}</span>}
                  </div>
                  <p className="text-text-faint text-[length:var(--text-xs)] mt-0.5">
                    {doc.requiredFor}
                    {fileInfo && (
                      <span className="ml-2">
                        &middot; {fileInfo.filename} ({formatFileSize(fileInfo.size)})
                        {fileInfo.encrypted && <span className="text-emerald-600 ml-1">&#128274; Encrypted</span>}
                      </span>
                    )}
                  </p>
                </button>

                {/* Status badge */}
                <span className={`px-2.5 py-1 rounded-full text-[length:var(--text-xs)] font-medium shrink-0 ${style.bg} ${style.text}`}>
                  {style.label}
                </span>

                {/* Action button */}
                {isUploading ? (
                  <span className="px-3 py-1.5 rounded-lg bg-gold/10 text-gold text-[length:var(--text-xs)] font-medium shrink-0 animate-pulse">
                    Encrypting...
                  </span>
                ) : status === 'missing' || status === 'draft' ? (
                  <button
                    onClick={() => triggerUpload(doc.id)}
                    className="px-3 py-1.5 rounded-lg bg-gold text-white text-[length:var(--text-xs)] font-medium hover:brightness-110 transition-all cursor-pointer shrink-0"
                  >
                    Upload
                  </button>
                ) : (
                  <button
                    onClick={() => triggerUpload(doc.id)}
                    className="px-3 py-1.5 rounded-lg bg-bg-surface text-text-muted text-[length:var(--text-xs)] font-medium hover:text-text transition-all cursor-pointer shrink-0"
                  >
                    Replace
                  </button>
                )}
              </div>

              {/* Expanded details */}
              {isExpanded && (
                <div className="px-4 pb-4 pt-0 border-t border-border">
                  <p className="text-text-muted text-[length:var(--text-xs)] leading-relaxed mt-3 mb-3">
                    {doc.description}
                  </p>

                  {/* Status controls */}
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-text-faint text-[length:var(--text-xs)] mr-1">Set status:</span>
                    {(['missing', 'draft', 'uploaded', 'approved'] as DocStatus[]).map((s) => (
                      <button
                        key={s}
                        onClick={() => setStatus(doc.id, s)}
                        className={`px-2.5 py-1 rounded-lg text-[length:var(--text-xs)] font-medium cursor-pointer transition-all ${
                          status === s
                            ? `${STATUS_CONFIG[s].bg} ${STATUS_CONFIG[s].text} ring-1 ${STATUS_CONFIG[s].ring}`
                            : 'bg-bg-surface text-text-faint hover:text-text-muted'
                        }`}
                      >
                        {STATUS_CONFIG[s].label}
                      </button>
                    ))}
                  </div>

                  {/* File info */}
                  {fileInfo && (
                    <div className="mt-3 bg-bg-surface rounded-lg p-3 flex items-center gap-3">
                      <span className="text-emerald-600 text-[length:var(--text-base)]">&#128274;</span>
                      <div className="flex-1 min-w-0">
                        <p className="text-text text-[length:var(--text-xs)] font-medium truncate">{fileInfo.filename}</p>
                        <p className="text-text-faint text-[length:var(--text-xs)]">
                          {formatFileSize(fileInfo.size)} &middot; Encrypted AES-256 &middot; Uploaded {new Date(fileInfo.uploadedAt).toLocaleDateString()}
                        </p>
                        <p className="text-text-faint text-[length:var(--text-xs)] font-mono truncate">
                          SHA-256: {fileInfo.sha256.slice(0, 16)}…
                        </p>
                      </div>
                      <button
                        onClick={() => handleDownload(doc.id)}
                        className="px-2.5 py-1 rounded-lg bg-bg-primary border border-border text-text-muted text-[length:var(--text-xs)] font-medium hover:text-text cursor-pointer shrink-0"
                      >
                        Download
                      </button>
                      <button
                        onClick={() => handleDelete(doc.id)}
                        className="px-2.5 py-1 rounded-lg bg-red-50 text-red-600 text-[length:var(--text-xs)] font-medium hover:bg-red-100 cursor-pointer shrink-0"
                      >
                        Delete
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* Security note */}
      <div className="bg-bg-surface border border-border rounded-2xl p-5">
        <div className="flex items-start gap-3">
          <span className="text-[length:var(--text-base)] mt-0.5">&#128274;</span>
          <div>
            <p className="text-text font-medium text-[length:var(--text-sm)]">Enterprise-grade document security</p>
            <p className="text-text-faint text-[length:var(--text-xs)] mt-1 leading-relaxed">
              All documents are <strong className="text-text">encrypted at rest using AES-256</strong> and <strong className="text-text">encrypted in transit via TLS 1.3</strong>.
              Data residency: UAE/EU servers. Compliant with UAE PDPL and GDPR.
              Documents are only accessible to your team — never shared with third parties without explicit authorization.
            </p>
          </div>
        </div>
      </div>

      {/* Document Review (plan-gated) */}
      <DocumentReviewSection plan={plan} jurisdictions={jurisdictions} />
    </div>
  )
}

function DocumentReviewSection({ plan, jurisdictions }: { plan: string; jurisdictions: string[] }) {
  const unlocked = REVIEW_UNLOCKED_PLANS.includes(plan.toLowerCase())
  const labels = mapJurisdictionsToLabels(jurisdictions)
  const entries = labels.length > 0 ? REVIEW_ENTRIES.filter((d) => labels.includes(d.jurisdiction)) : REVIEW_ENTRIES
  const reviewed = entries.filter((d) => d.status === 'reviewed')
  const avgScore = reviewed.length > 0 ? Math.round(reviewed.reduce((s, d) => s + (d.score ?? 0), 0) / reviewed.length) : 0
  const totalIssues = entries.reduce((s, d) => s + (d.issues ?? 0), 0)

  return (
    <div className="pt-2 space-y-4">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <p className="font-mono text-gold uppercase tracking-widest text-[length:var(--text-xs)] mb-1">
            {unlocked ? 'Active' : 'Professional & Navigator'}
          </p>
          <h2 className="font-display font-bold text-text text-[length:var(--text-base)]">Document Review</h2>
          <p className="text-text-muted text-[length:var(--text-xs)] mt-1 max-w-2xl leading-relaxed">
            Expert review of your compliance documents before submission. Line-level findings, jurisdiction-specific
            scoring, and revision tracking performed by Zawda&apos;s in-house advisors.
          </p>
        </div>
        {!unlocked && (
          <span className="shrink-0 px-2.5 py-1 bg-gold/10 text-gold text-[length:var(--text-xs)] font-bold uppercase rounded">Locked</span>
        )}
      </div>

      {!unlocked && <UpgradeBanner title="Document Review" />}

      <div className={unlocked ? '' : 'relative'}>
        {!unlocked && (
          <div className="absolute inset-0 bg-bg-primary/40 backdrop-blur-[1px] rounded-2xl pointer-events-none z-10" aria-hidden="true" />
        )}

        {/* Summary */}
        <div className="grid grid-cols-3 gap-3 mb-4">
          <div className="bg-bg-primary border border-border rounded-xl p-4 text-center">
            <p className="font-mono text-emerald-600 font-bold text-[length:var(--text-xl)]">{reviewed.length}</p>
            <p className="text-text-faint text-[length:var(--text-xs)]">Documents reviewed</p>
          </div>
          <div className="bg-bg-primary border border-border rounded-xl p-4 text-center">
            <p className="font-mono text-gold font-bold text-[length:var(--text-xl)]">{avgScore}%</p>
            <p className="text-text-faint text-[length:var(--text-xs)]">Average compliance score</p>
          </div>
          <div className="bg-bg-primary border border-border rounded-xl p-4 text-center">
            <p className="font-mono text-orange-600 font-bold text-[length:var(--text-xl)]">{totalIssues}</p>
            <p className="text-text-faint text-[length:var(--text-xs)]">Issues identified</p>
          </div>
        </div>

        {/* Document list */}
        <div className="bg-bg-primary border border-border rounded-2xl p-6 mb-4">
          <h3 className="font-display font-bold text-text text-[length:var(--text-sm)] mb-4">Under Review</h3>
          {entries.length === 0 ? (
            <p className="text-text-muted text-[length:var(--text-xs)]">No documents on file for your selected jurisdictions.</p>
          ) : (
            <div className="space-y-2">
              {entries.map((doc) => {
                const st = REVIEW_STATUS_STYLES[doc.status]
                return (
                  <div key={doc.name} className="flex items-center justify-between py-2.5 border-b border-border last:border-0 gap-4">
                    <div className="min-w-0 flex-1">
                      <p className="text-text font-medium text-[length:var(--text-sm)] truncate">{doc.name}</p>
                      <div className="flex items-center gap-2 mt-1 flex-wrap">
                        <span className={`text-[length:var(--text-xs)] px-2 py-0.5 rounded-full font-medium ${st.color}`}>{st.label}</span>
                        <span className="font-mono text-text-faint text-[length:var(--text-xs)]">{doc.jurisdiction}</span>
                        {doc.reviewer && <span className="text-text-faint text-[length:var(--text-xs)]">by {doc.reviewer}</span>}
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      {doc.score !== null ? (
                        <p className={`font-mono font-bold text-[length:var(--text-sm)] ${doc.score >= 85 ? 'text-emerald-600' : doc.score >= 70 ? 'text-amber-600' : 'text-orange-600'}`}>
                          {doc.score}%
                        </p>
                      ) : (
                        <p className="text-text-faint text-[length:var(--text-xs)]">&#8212;</p>
                      )}
                      {doc.issues !== null && (
                        <p className="text-text-faint text-[length:var(--text-xs)]">{doc.issues} issue{doc.issues !== 1 ? 's' : ''}</p>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* Sample review detail */}
        <div className="bg-bg-primary border border-border rounded-2xl p-6">
          <h3 className="font-display font-bold text-text text-[length:var(--text-sm)]">Sample review: Governance Framework</h3>
          <p className="text-text-faint text-[length:var(--text-xs)] mb-4">Reviewed by Omar H. on 2026-04-01</p>
          <div className="space-y-2">
            {[
              { section: '2.1 Board Composition', issue: 'VARA requires at least one board member with demonstrable compliance expertise. Current composition does not meet this.', priority: 'High' },
              { section: '3.4 Conflict of Interest', issue: 'Policy references "best efforts" disclosure — regulators require mandatory disclosure with documented process.', priority: 'Medium' },
              { section: '5.2 Outsourcing', issue: 'Missing material outsourcing register as required under VARA Compliance Rulebook Section 4.3.', priority: 'High' },
            ].map((item, i) => (
              <div key={i} className="bg-bg-surface rounded-lg p-3">
                <div className="flex items-center gap-2 mb-1 flex-wrap">
                  <span className={`text-[length:var(--text-xs)] px-1.5 py-0.5 rounded font-medium ${item.priority === 'High' ? 'bg-red-50 text-red-700' : 'bg-amber-50 text-amber-700'}`}>{item.priority}</span>
                  <span className="text-text font-medium text-[length:var(--text-xs)]">{item.section}</span>
                </div>
                <p className="text-text-muted text-[length:var(--text-xs)] leading-relaxed">{item.issue}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
