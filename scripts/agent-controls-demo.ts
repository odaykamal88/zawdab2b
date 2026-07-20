// Runnable PoC: an AI agent proposes transactions; the policy engine authorizes
// or intercepts each one BEFORE signing, using a real OFAC sanctions list and a
// (clearly simulated) KYT-style risk score.
//
//   npx tsx scripts/agent-controls-demo.ts
//
// No API keys or network required — fully reproducible.

import { PolicyEngine } from '../src/lib/agent-controls/engine'
import { OfacSanctionsProvider } from '../src/lib/agent-controls/providers/sanctions'
import { MockKytRiskProvider } from '../src/lib/agent-controls/providers/risk-score'
import { ScriptedAgent } from '../src/lib/agent-controls/agent'
import { DEMO_AGENT_ID, DEMO_POLICY, DEMO_TRANSACTIONS, RISK_OVERRIDES } from '../src/lib/agent-controls/scenario'
import type { Verdict } from '../src/lib/agent-controls/types'

const MARK: Record<Verdict['enforcement'], string> = {
  executed: 'EXECUTED ✓',
  intercepted: 'INTERCEPTED ⛔',
  'held-for-review': 'HELD FOR REVIEW ⚠',
}

function line(char = '─', n = 72): string {
  return char.repeat(n)
}

function printVerdict(v: Verdict, memo: string, amountUsd: number): void {
  console.log(line())
  console.log(`${v.transactionId}  $${amountUsd.toLocaleString().padStart(7)}   ${memo}`)
  const s = v.intelligence.sanctions
  console.log(
    `   intel: sanctions=${s ? `MATCH (${s.entity})` : 'clear'}  ` +
      `risk=${v.intelligence.risk.score}/${v.intelligence.risk.band}` +
      `${v.intelligence.risk.simulated ? ' (sim)' : ''}`,
  )
  console.log(`   → ${MARK[v.enforcement]}   [decision: ${v.decision}]`)
  for (const r of v.results) {
    console.log(`      • ${r.policy} (${r.reasonCode}): ${r.reason}`)
  }
}

function main(): void {
  const engine = new PolicyEngine(() => DEMO_POLICY, {
    sanctions: new OfacSanctionsProvider(),
    risk: new MockKytRiskProvider(RISK_OVERRIDES),
  })
  const agent = new ScriptedAgent(DEMO_AGENT_ID, DEMO_TRANSACTIONS)

  console.log(line('═'))
  console.log('ZAWDA AGENT CONTROLS — programmatic transaction enforcement (PoC)')
  console.log(`agent: ${DEMO_AGENT_ID}   policy: ≤$${DEMO_POLICY.perTxLimitUsd.toLocaleString()}/tx, ` +
    `≤$${DEMO_POLICY.dailyLimitUsd.toLocaleString()}/day, jurisdictions ${DEMO_POLICY.allowedJurisdictions.join('/')}`)
  console.log(line('═'))

  let executed = 0
  let intercepted = 0
  let review = 0

  let tx = agent.next()
  while (tx) {
    const v = engine.evaluate(tx)
    printVerdict(v, tx.memo ?? '', tx.amountUsd)
    if (v.enforcement === 'executed') executed++
    else if (v.enforcement === 'intercepted') intercepted++
    else review++
    tx = agent.next()
  }

  console.log(line('═'))
  console.log(`SUMMARY: ${executed} executed · ${intercepted} intercepted · ${review} held for review`)
  console.log(`AUDIT: ${engine.audit.entries().length} tamper-evident entries · chain valid = ${engine.audit.verify()}`)
  console.log(line('═'))
}

main()
