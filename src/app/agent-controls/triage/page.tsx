import Link from 'next/link'
import { BrandName } from '@/components/ui/BrandName'
import {
  ComplianceAnalystAgent,
  MockKytRiskProvider,
  WF_ALERTS,
  WF_RISK_OVERRIDES,
  type CaseFile,
} from '@/lib/agent-controls'

export const dynamic = 'force-dynamic'

export const metadata = {
  title: 'Compliance Analyst Agent — triage PoC | Zawda',
  description:
    'An agent that automates the compliance analyst alert queue: enrich, assess, draft an FIU-specific SAR, and record a tamper-evident audit entry.',
}

const BADGE: Record<CaseFile['disposition'], { label: string; cls: string }> = {
  dismiss: { label: 'Dismiss', cls: 'bg-green-50 text-green-700 border-green-200' },
  escalate: { label: 'Escalate', cls: 'bg-amber-50 text-amber-700 border-amber-200' },
  'file-sar': { label: 'File SAR', cls: 'bg-red-50 text-red-700 border-red-200' },
}

export default function TriagePage() {
  const agent = new ComplianceAnalystAgent({ risk: new MockKytRiskProvider(WF_RISK_OVERRIDES) })
  const { cases, summary, auditValid, auditEntries } = agent.run(WF_ALERTS)

  return (
    <div className="min-h-screen bg-bg-primary">
      <nav className="border-b border-border py-4">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <svg width="24" height="24" viewBox="0 0 32 32" fill="none" aria-hidden="true">
              <path d="M4 24L10 8L16 20L22 6L28 24" stroke="var(--gold)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <BrandName className="font-display text-base font-bold text-text" />
          </Link>
          <Link href="/agent-controls" className="text-text-muted hover:text-text text-[length:var(--text-sm)] transition-colors">
            &#8592; Agent Controls
          </Link>
        </div>
      </nav>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-12 sm:py-16">
        <div className="inline-block px-2.5 py-1 bg-gold/10 text-gold text-[length:var(--text-xs)] font-bold uppercase rounded mb-3">
          Proof of concept
        </div>
        <h1 className="font-display font-bold text-text tracking-tight text-[length:var(--text-xl)] mb-3">Compliance Analyst Agent</h1>
        <p className="text-text-muted text-[length:var(--text-sm)] max-w-2xl leading-relaxed">
          An agent that <strong className="text-text">automates the analyst&apos;s alert queue</strong>: for each alert it enriches with
          intelligence (real OFAC screening + KYT-style risk), assesses a disposition, drafts an <strong className="text-text">FIU-specific
          SAR/escalation</strong> where needed, and records a tamper-evident audit entry. Trusted data + MENA regulatory domain + working code.
        </p>

        <div className="grid grid-cols-3 gap-4 mt-8">
          <Stat value={summary.dismissed} label="Dismissed" cls="text-green-600" />
          <Stat value={summary.escalated} label="Escalated" cls="text-amber-600" />
          <Stat value={summary.sarRecommended} label="SAR recommended" cls="text-red-600" />
        </div>

        <div className="mt-6 space-y-4">
          {cases.map((c) => {
            const badge = BADGE[c.disposition]
            return (
              <div key={c.alertId} className="bg-bg-surface border border-border rounded-2xl p-5">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-mono text-text font-bold text-[length:var(--text-sm)]">{c.alertId}</span>
                      <span className="text-[length:var(--text-xs)] px-2 py-0.5 rounded-full border border-border text-text-muted">{c.fiu}</span>
                      <span className="font-mono text-text-faint text-[length:var(--text-xs)]">{c.subject.slice(0, 14)}…</span>
                    </div>
                    <p className="text-text-muted text-[length:var(--text-xs)]">{c.rationale}</p>
                  </div>
                  <span className={`shrink-0 text-[length:var(--text-xs)] px-2.5 py-1 rounded-full border font-medium ${badge.cls}`}>{badge.label}</span>
                </div>

                <ol className="mt-3 border-t border-border pt-3 space-y-1">
                  {c.steps.map((s, i) => (
                    <li key={i} className="text-text-muted text-[length:var(--text-xs)] flex gap-2">
                      <span className="font-mono text-gold shrink-0 w-16">{s.step}</span>
                      <span>{s.detail}</span>
                    </li>
                  ))}
                </ol>

                {c.sarDraft && (
                  <pre className="mt-3 bg-bg-primary border border-border rounded-xl p-3 text-[length:var(--text-xs)] text-text-muted font-mono whitespace-pre-wrap overflow-x-auto">{c.sarDraft}</pre>
                )}
              </div>
            )
          })}
        </div>

        <div className="mt-6 bg-bg-surface border border-border rounded-2xl p-5 text-[length:var(--text-sm)]">
          <p className="text-text">
            <strong>Audit trail:</strong> {auditEntries} tamper-evident, hash-chained entries · chain integrity ={' '}
            <span className={auditValid ? 'text-green-600' : 'text-red-600'}>{String(auditValid)}</span>
          </p>
          <p className="text-text-faint text-[length:var(--text-xs)] mt-2 leading-relaxed">
            Sanctions use a real OFAC SDN snapshot; risk scores are <strong>simulated</strong> and labelled (a live KYT provider drops into
            the same interface). SAR drafts are grounded only in the screening facts and must be reviewed by an MLRO before any filing.
          </p>
        </div>
      </main>
    </div>
  )
}

function Stat({ value, label, cls }: { value: number; label: string; cls: string }) {
  return (
    <div className="bg-bg-surface border border-border rounded-xl p-4 text-center">
      <p className={`font-mono font-bold text-[length:var(--text-xl)] ${cls}`}>{value}</p>
      <p className="text-text-faint text-[length:var(--text-xs)]">{label}</p>
    </div>
  )
}
