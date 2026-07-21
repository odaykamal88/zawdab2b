// Agent Controls — public surface.
export { PolicyEngine, type EngineDeps } from './engine'
export { AuditLog, type AuditEntry } from './audit'
export { ScriptedAgent, type AgentClient } from './agent'
export { OfacSanctionsProvider, type SanctionsProvider } from './providers/sanctions'
export { MockKytRiskProvider, type RiskScoreProvider } from './providers/risk-score'
export { DEFAULT_POLICIES, type Policy } from './policies'
export * from './types'
export {
  DEMO_AGENT_ID,
  DEMO_POLICY,
  DEMO_TRANSACTIONS,
  RISK_OVERRIDES,
  HIGH_RISK_ADDRESS,
  MED_RISK_ADDRESS,
} from './scenario'

// Agentic compliance workflows (alert triage → SAR draft → audit).
export { ComplianceAnalystAgent, type AnalystRunResult } from './workflows/agent'
export { runTriage, defaultTriageDeps, type TriageDeps } from './workflows/triage'
export { buildSarDraft } from './workflows/sar-narrative'
export { WF_ALERTS, WF_RISK_OVERRIDES } from './workflows/scenario'
export type { Alert, AlertKind, CaseFile, Disposition, FIU, WorkflowStep, TriageRecord } from './workflows/types'
