import { AuditLog } from '../audit'
import type { RiskScoreProvider } from '../providers/risk-score'
import type { SanctionsProvider } from '../providers/sanctions'
import { defaultTriageDeps, runTriage, type TriageDeps } from './triage'
import type { Alert, CaseFile, TriageRecord } from './types'

export interface AnalystRunResult {
  cases: CaseFile[]
  summary: { total: number; dismissed: number; escalated: number; sarRecommended: number }
  auditValid: boolean
  auditEntries: number
}

/**
 * An agent that automates the compliance analyst's alert queue: for each alert
 * it enriches with intelligence, assesses a disposition, drafts an FIU-specific
 * report where needed, and records a tamper-evident audit entry.
 *
 * Seam for a real LLM agent: a Claude tool-use loop can drive the identical
 * steps by exposing `enrich`, `assess`, and `draftSar` as tools. Here the run is
 * deterministic and reproducible (no keys/network).
 */
export class ComplianceAnalystAgent {
  readonly audit = new AuditLog<TriageRecord>()
  private readonly deps: TriageDeps

  constructor(providers: { sanctions?: SanctionsProvider; risk?: RiskScoreProvider } = {}) {
    this.deps = defaultTriageDeps({ sanctions: providers.sanctions, risk: providers.risk, audit: this.audit })
  }

  run(alerts: Alert[]): AnalystRunResult {
    const cases = alerts.map((a) => runTriage(a, this.deps))
    return {
      cases,
      summary: {
        total: cases.length,
        dismissed: cases.filter((c) => c.disposition === 'dismiss').length,
        escalated: cases.filter((c) => c.disposition === 'escalate').length,
        sarRecommended: cases.filter((c) => c.disposition === 'file-sar').length,
      },
      auditValid: this.audit.verify(),
      auditEntries: this.audit.entries().length,
    }
  }
}
