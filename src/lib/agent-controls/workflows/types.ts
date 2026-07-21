import type { IntelligenceInputs } from '../types'

// Agentic compliance workflows — automate the analyst's alert queue.
// This complements the enforcement engine: enforcement gates transactions
// pre-signing; these workflows triage alerts and draft regulatory reports.

export type AlertKind = 'transaction' | 'address' | 'counterparty'
export type Disposition = 'dismiss' | 'escalate' | 'file-sar'
export type FIU = 'CBB' | 'VARA' | 'ADGM'
export type Severity = 'low' | 'medium' | 'high' | 'critical'

export interface Alert {
  id: string
  kind: AlertKind
  /** Address / counterparty under review. */
  subject: string
  amountUsd?: number
  counterpartyJurisdiction?: string
  /** Which regulator's regime the reporting entity sits under. */
  fiu: FIU
  note?: string
}

export interface WorkflowStep {
  step: string
  detail: string
}

export interface TriageRecord {
  kind: 'triage'
  alertId: string
  fiu: FIU
  disposition: Disposition
  severity: Severity
  sanctionsHit: boolean
  riskScore: number
}

export interface CaseFile {
  alertId: string
  subject: string
  fiu: FIU
  intelligence: IntelligenceInputs
  disposition: Disposition
  severity: Severity
  rationale: string
  steps: WorkflowStep[]
  /** Present when the case is escalated or recommended for SAR/STR. */
  sarDraft?: string
}
