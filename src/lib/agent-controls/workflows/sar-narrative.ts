import type { IntelligenceInputs } from '../types'
import type { Alert, Disposition, Severity } from './types'

const FIU_META: Record<Alert['fiu'], { authority: string; regime: string }> = {
  CBB: { authority: 'Bahrain FIU via goAML', regime: 'CBB Rulebook Vol. 6 (CRA Module) AML/CFT' },
  VARA: { authority: 'UAE FIU via goAML (Dubai / VARA-regulated)', regime: 'VARA Compliance & Risk Management Rulebook' },
  ADGM: { authority: 'UAE FIU via goAML (ADGM / FSRA-regulated)', regime: 'ADGM AML & Sanctions Rulebook' },
}

/**
 * Builds a DRAFT, FIU-specific SAR/STR (or escalation) narrative grounded ONLY
 * in the verified screening facts. It is a skeleton for MLRO review — never a
 * filed report, and it fabricates no typologies. The MENA/FIU structure is the
 * domain-expertise layer a generic tool does not have.
 *
 * PRODUCTION: for polished prose, pass these same verified facts to Claude as
 * grounding (do not let the model invent facts).
 */
export function buildSarDraft(
  alert: Alert,
  intel: IntelligenceInputs,
  disposition: Disposition,
  severity: Severity,
): string {
  const fiu = FIU_META[alert.fiu]
  const isSar = disposition === 'file-sar'
  const lines: string[] = [
    `DRAFT ${isSar ? 'SUSPICIOUS ACTIVITY / TRANSACTION REPORT' : 'INTERNAL ESCALATION MEMO'} — for MLRO review (NOT filed)`,
    `Reporting regime: ${fiu.regime}`,
    `Submission channel: ${fiu.authority}`,
    `Severity: ${severity}`,
    '',
    `Subject: ${alert.subject}`,
    alert.amountUsd ? `Amount in scope: $${alert.amountUsd.toLocaleString()}` : 'Amount in scope: n/a',
    `Counterparty jurisdiction: ${alert.counterpartyJurisdiction ?? 'n/a'}`,
    '',
    'Grounds for suspicion:',
  ]
  if (intel.sanctions) {
    lines.push(`- Sanctions match: ${intel.sanctions.source} — ${intel.sanctions.entity ?? 'listed entity'} (${intel.sanctions.program ?? 'n/a'}). Source: ${intel.sanctions.sourceUrl}`)
  }
  lines.push(`- Counterparty risk score: ${intel.risk.score}/100 (${intel.risk.band})${intel.risk.simulated ? ' [SIMULATED — replace with live KYT in production]' : ''}.`)
  lines.push('')
  lines.push(
    `Recommended action: ${isSar
      ? `File SAR/STR with ${alert.fiu} FIU within the regulatory deadline; place hold pending guidance.`
      : `Escalate to MLRO for enhanced due diligence before further activity.`}`,
  )
  lines.push('')
  lines.push('NOTE: Auto-generated DRAFT grounded in the screening facts above. An MLRO must review, complete, and approve before any filing.')
  return lines.join('\n')
}
