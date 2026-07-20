import { AuditLog } from './audit'
import { DEFAULT_POLICIES, type Policy, type PolicyContext } from './policies'
import { MockKytRiskProvider, type RiskScoreProvider } from './providers/risk-score'
import { OfacSanctionsProvider, type SanctionsProvider } from './providers/sanctions'
import type { AgentPolicy, Enforcement, IntelligenceInputs, PolicyDecision, ProposedTransaction, Verdict } from './types'

export interface EngineDeps {
  sanctions?: SanctionsProvider
  risk?: RiskScoreProvider
  policies?: Policy[]
}

function aggregate(decisions: PolicyDecision[]): PolicyDecision {
  if (decisions.includes('block')) return 'block'
  if (decisions.includes('review')) return 'review'
  return 'allow'
}

function enforcementFor(decision: PolicyDecision): Enforcement {
  if (decision === 'allow') return 'executed'
  if (decision === 'review') return 'held-for-review'
  return 'intercepted'
}

/**
 * The policy-enforcement engine. For each proposed transaction it gathers
 * intelligence (sanctions + risk), runs every policy, aggregates a decision,
 * updates cumulative spend only when a transaction is actually executed, and
 * appends a tamper-evident audit entry.
 */
export class PolicyEngine {
  private readonly sanctions: SanctionsProvider
  private readonly risk: RiskScoreProvider
  private readonly policies: Policy[]
  private readonly spentTodayUsd = new Map<string, number>()
  readonly audit = new AuditLog()

  constructor(
    private readonly policyFor: (agentId: string) => AgentPolicy,
    deps: EngineDeps = {},
  ) {
    this.sanctions = deps.sanctions ?? new OfacSanctionsProvider()
    this.risk = deps.risk ?? new MockKytRiskProvider()
    this.policies = deps.policies ?? DEFAULT_POLICIES
  }

  gatherIntelligence(tx: ProposedTransaction): IntelligenceInputs {
    return { sanctions: this.sanctions.screen(tx.to), risk: this.risk.assess(tx.to) }
  }

  evaluate(tx: ProposedTransaction): Verdict {
    const policy = this.policyFor(tx.agentId)
    const intel = this.gatherIntelligence(tx)
    const spentToday = this.spentTodayUsd.get(tx.agentId) ?? 0
    const ctx: PolicyContext = { policy, spentTodayUsd: spentToday }

    const results = this.policies
      .map((p) => p(tx, intel, ctx))
      .filter((r): r is NonNullable<typeof r> => r !== null)

    const decision = aggregate(results.map((r) => r.decision))
    const enforcement = enforcementFor(decision)

    if (enforcement === 'executed') {
      this.spentTodayUsd.set(tx.agentId, spentToday + tx.amountUsd)
    }

    const verdict: Verdict = {
      transactionId: tx.id,
      agentId: tx.agentId,
      decision,
      enforcement,
      results,
      intelligence: intel,
      evaluatedAt: new Date().toISOString(),
    }
    this.audit.append(verdict)
    return verdict
  }
}
