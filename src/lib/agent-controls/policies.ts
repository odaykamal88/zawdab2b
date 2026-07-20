import type { AgentPolicy, IntelligenceInputs, PolicyResult, ProposedTransaction } from './types'

export interface PolicyContext {
  policy: AgentPolicy
  spentTodayUsd: number
}

export type Policy = (
  tx: ProposedTransaction,
  intel: IntelligenceInputs,
  ctx: PolicyContext,
) => PolicyResult | null

/** Hard block on any OFAC/sanctions match. */
export const sanctionsPolicy: Policy = (_tx, intel, ctx) => {
  if (!ctx.policy.blockOnSanctions || !intel.sanctions) return null
  return {
    policy: 'sanctions-screening',
    decision: 'block',
    severity: 'critical',
    reasonCode: 'OFAC_SDN_MATCH',
    reason: `Counterparty is on the ${intel.sanctions.source} — ${intel.sanctions.entity ?? 'listed entity'} (${intel.sanctions.program ?? 'n/a'}).`,
  }
}

/** Block or hold-for-review based on counterparty risk score. */
export const riskScorePolicy: Policy = (_tx, intel, ctx) => {
  const { score, simulated } = intel.risk
  const tag = simulated ? ' (simulated)' : ''
  if (score >= ctx.policy.blockRiskScore) {
    return {
      policy: 'risk-threshold',
      decision: 'block',
      severity: 'high',
      reasonCode: 'RISK_SCORE_BLOCK',
      reason: `Counterparty risk score ${score} ≥ block threshold ${ctx.policy.blockRiskScore}${tag}.`,
    }
  }
  if (score >= ctx.policy.reviewRiskScore) {
    return {
      policy: 'risk-threshold',
      decision: 'review',
      severity: 'medium',
      reasonCode: 'RISK_SCORE_REVIEW',
      reason: `Counterparty risk score ${score} ≥ review threshold ${ctx.policy.reviewRiskScore}${tag}.`,
    }
  }
  return null
}

/** Block transactions above the per-transaction limit. */
export const perTxLimitPolicy: Policy = (tx, _intel, ctx) => {
  if (tx.amountUsd <= ctx.policy.perTxLimitUsd) return null
  return {
    policy: 'per-tx-limit',
    decision: 'block',
    severity: 'high',
    reasonCode: 'PER_TX_LIMIT',
    reason: `Amount $${tx.amountUsd.toLocaleString()} exceeds per-transaction limit $${ctx.policy.perTxLimitUsd.toLocaleString()}.`,
  }
}

/** Block when the projected cumulative daily spend exceeds the limit. */
export const dailyLimitPolicy: Policy = (tx, _intel, ctx) => {
  const projected = ctx.spentTodayUsd + tx.amountUsd
  if (projected <= ctx.policy.dailyLimitUsd) return null
  return {
    policy: 'daily-limit',
    decision: 'block',
    severity: 'high',
    reasonCode: 'DAILY_LIMIT',
    reason: `Projected daily spend $${projected.toLocaleString()} exceeds daily limit $${ctx.policy.dailyLimitUsd.toLocaleString()}.`,
  }
}

/** Block counterparties outside the agent's licensed jurisdictions. */
export const jurisdictionPolicy: Policy = (tx, _intel, ctx) => {
  const j = tx.counterpartyJurisdiction
  if (!j || ctx.policy.allowedJurisdictions.includes(j)) return null
  return {
    policy: 'jurisdiction-allowlist',
    decision: 'block',
    severity: 'high',
    reasonCode: 'JURISDICTION_NOT_ALLOWED',
    reason: `Counterparty jurisdiction ${j} is outside the agent's licensed scope (${ctx.policy.allowedJurisdictions.join(', ')}).`,
  }
}

export const DEFAULT_POLICIES: Policy[] = [
  sanctionsPolicy,
  riskScorePolicy,
  perTxLimitPolicy,
  dailyLimitPolicy,
  jurisdictionPolicy,
]
