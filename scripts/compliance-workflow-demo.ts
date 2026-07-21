// Agentic compliance workflow demo: an analyst agent automates an alert queue —
// enrich (real OFAC + simulated KYT) → assess disposition → draft an FIU-specific
// SAR/escalation → record a tamper-evident audit entry. Fully reproducible.
//
//   npx tsx scripts/compliance-workflow-demo.ts

import { ComplianceAnalystAgent } from '../src/lib/agent-controls/workflows/agent'
import { MockKytRiskProvider } from '../src/lib/agent-controls/providers/risk-score'
import { WF_ALERTS, WF_RISK_OVERRIDES } from '../src/lib/agent-controls/workflows/scenario'

const bar = (c = '─', n = 74) => c.repeat(n)

function main(): void {
  const agent = new ComplianceAnalystAgent({ risk: new MockKytRiskProvider(WF_RISK_OVERRIDES) })
  const result = agent.run(WF_ALERTS)

  console.log(bar('═'))
  console.log('ZAWDA COMPLIANCE ANALYST AGENT — automated alert triage (PoC)')
  console.log(bar('═'))

  for (const c of result.cases) {
    console.log(`\n${c.alertId}  [${c.fiu}]  subject ${c.subject.slice(0, 12)}…`)
    for (const s of c.steps) console.log(`   ${s.step.padEnd(10)} ${s.detail}`)
    console.log(`   → DISPOSITION: ${c.disposition.toUpperCase()} (${c.severity})`)
    if (c.sarDraft) {
      console.log('   ── draft ' + bar('─', 55))
      for (const line of c.sarDraft.split('\n')) console.log('   │ ' + line)
    }
  }

  const s = result.summary
  console.log('\n' + bar('═'))
  console.log(`SUMMARY: ${s.total} alerts · ${s.dismissed} dismissed · ${s.escalated} escalated · ${s.sarRecommended} SAR-recommended`)
  console.log(`AUDIT: ${result.auditEntries} tamper-evident entries · chain valid = ${result.auditValid}`)
  console.log(bar('═'))
}

main()
