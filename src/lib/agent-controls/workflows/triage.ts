import type { AuditLog } from '../audit'
import { MockKytRiskProvider, type RiskScoreProvider } from '../providers/risk-score'
import { OfacSanctionsProvider, type SanctionsProvider } from '../providers/sanctions'
import type { IntelligenceInputs } from '../types'
import { buildSarDraft } from './sar-narrative'
import type { Alert, CaseFile, Disposition, Severity, TriageRecord, WorkflowStep } from './types'

export interface TriageDeps {
  sanctions: SanctionsProvider
  risk: RiskScoreProvider
  audit?: AuditLog
}

function decide(intel: IntelligenceInputs): { disposition: Disposition; severity: Severity; rationale: string } {
  if (intel.sanctions) {
    return {
      disposition: 'file-sar',
      severity: 'critical',
      rationale: `Counterparty on ${intel.sanctions.source} (${intel.sanctions.entity ?? 'listed entity'}). Mandatory report + hold.`,
    }
  }
  const s = intel.risk.score
  const tag = intel.risk.simulated ? ' (simulated)' : ''
  if (s >= 90) return { disposition: 'file-sar', severity: 'high', rationale: `Severe counterparty risk ${s}/100${tag}. Recommend SAR.` }
  if (s >= 70) return { disposition: 'escalate', severity: 'medium', rationale: `Elevated risk ${s}/100${tag}. Escalate to MLRO.` }
  return { disposition: 'dismiss', severity: 'low', rationale: `No sanctions hit; risk ${s}/100${tag} within tolerance. Dismiss with record.` }
}

/**
 * The triage workflow: intake → enrich → assess → (draft SAR) → record.
 * Each step is captured so the automated run is fully auditable — the agent
 * shows its work.
 */
export function runTriage(alert: Alert, deps: TriageDeps): CaseFile {
  const steps: WorkflowStep[] = []
  steps.push({ step: 'intake', detail: `Alert ${alert.id} (${alert.kind}) on ${alert.subject} — ${alert.fiu} regime.` })

  const intel: IntelligenceInputs = { sanctions: deps.sanctions.screen(alert.subject), risk: deps.risk.assess(alert.subject) }
  steps.push({
    step: 'enrich',
    detail: `Screened: sanctions=${intel.sanctions ? 'MATCH' : 'clear'}, risk=${intel.risk.score}/100 (${intel.risk.band}${intel.risk.simulated ? ', sim' : ''}).`,
  })

  const { disposition, severity, rationale } = decide(intel)
  steps.push({ step: 'assess', detail: `Disposition=${disposition} (${severity}). ${rationale}` })

  let sarDraft: string | undefined
  if (disposition !== 'dismiss') {
    sarDraft = buildSarDraft(alert, intel, disposition, severity)
    steps.push({ step: 'draft-sar', detail: `Drafted ${alert.fiu} ${disposition === 'file-sar' ? 'SAR/STR' : 'escalation'} narrative for MLRO review.` })
  }

  if (deps.audit) {
    const record: TriageRecord = {
      kind: 'triage',
      alertId: alert.id,
      fiu: alert.fiu,
      disposition,
      severity,
      sanctionsHit: !!intel.sanctions,
      riskScore: intel.risk.score,
    }
    deps.audit.append(record)
    steps.push({ step: 'record', detail: `Appended tamper-evident audit entry (#${deps.audit.entries().length}).` })
  }

  return { alertId: alert.id, subject: alert.subject, fiu: alert.fiu, intelligence: intel, disposition, severity, rationale, steps, sarDraft }
}

export function defaultTriageDeps(overrides: Partial<TriageDeps> = {}): TriageDeps {
  return {
    sanctions: overrides.sanctions ?? new OfacSanctionsProvider(),
    risk: overrides.risk ?? new MockKytRiskProvider(),
    audit: overrides.audit,
  }
}
