// Agent Controls — core types for the programmatic policy-enforcement layer.
//
// This engine authorizes or BLOCKS a proposed agent transaction *before* it is
// signed, using external risk intelligence (sanctions + KYT-style risk) as an
// input. It holds no assets and moves no funds — it is a decision + audit layer.

export type Chain = 'ETH' | 'BTC' | 'TRON' | 'BASE' | 'SOL'

export type PolicyDecision = 'allow' | 'block' | 'review'
export type Severity = 'info' | 'low' | 'medium' | 'high' | 'critical'
export type Enforcement = 'executed' | 'intercepted' | 'held-for-review'

export interface ProposedTransaction {
  id: string
  agentId: string
  chain: Chain
  asset: string
  amount: number
  amountUsd: number
  from: string
  to: string
  memo?: string
  /** ISO country code of the counterparty, e.g. 'AE', 'BH', 'KP'. */
  counterpartyJurisdiction?: string
}

export interface SanctionsMatch {
  listed: true
  source: string
  sourceUrl: string
  entity?: string
  program?: string
}

export interface RiskAssessment {
  /** 0..100 — higher is riskier. */
  score: number
  band: 'low' | 'medium' | 'high' | 'severe'
  provider: string
  /** true when the score is simulated (never real screening). */
  simulated: boolean
  categories?: string[]
}

export interface IntelligenceInputs {
  sanctions: SanctionsMatch | null
  risk: RiskAssessment
}

export interface PolicyResult {
  policy: string
  decision: PolicyDecision
  severity: Severity
  reasonCode: string
  reason: string
}

/** The programmatic boundaries an operator sets for a given agent. */
export interface AgentPolicy {
  agentId: string
  perTxLimitUsd: number
  dailyLimitUsd: number
  allowedJurisdictions: string[]
  /** risk score >= this => hold for review */
  reviewRiskScore: number
  /** risk score >= this => block */
  blockRiskScore: number
  blockOnSanctions: boolean
}

export interface Verdict {
  transactionId: string
  agentId: string
  decision: PolicyDecision
  enforcement: Enforcement
  results: PolicyResult[]
  intelligence: IntelligenceInputs
  evaluatedAt: string
}
