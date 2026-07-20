import type { AgentPolicy, ProposedTransaction } from './types'

// Build a valid-length (0x + 40 hex) synthetic address from a short tag.
const addr = (tag: string): string => '0x' + tag.toLowerCase().replace(/[^0-9a-f]/g, '').padStart(40, '0')

export const DEMO_AGENT_ID = 'agent-treasury-01'

// The agent acts for a Bahrain (CBB) licensed entity: it may pay GCC
// counterparties, up to $25k per transaction and $50k/day, clean addresses only.
export const DEMO_POLICY: AgentPolicy = {
  agentId: DEMO_AGENT_ID,
  perTxLimitUsd: 25_000,
  dailyLimitUsd: 50_000,
  allowedJurisdictions: ['BH', 'AE', 'SA', 'QA', 'KW', 'OM'],
  reviewRiskScore: 70,
  blockRiskScore: 90,
  blockOnSanctions: true,
}

// A REAL OFAC-sanctioned address (Lazarus / Ronin) drives the sanctions block.
const OFAC_SANCTIONED = '0x098B716B8Aaf21512996dC57EB0615e2383E2f96'

// Two addresses whose (simulated) risk scores are forced, to demonstrate the
// review band and the block band deterministically.
export const MED_RISK_ADDRESS = addr('med17risk')
export const HIGH_RISK_ADDRESS = addr('high96risk')
export const RISK_OVERRIDES: Record<string, number> = {
  [MED_RISK_ADDRESS]: 78,
  [HIGH_RISK_ADDRESS]: 96,
}

const FROM = addr('a11ce')

export const DEMO_TRANSACTIONS: ProposedTransaction[] = [
  { id: 'tx-1', agentId: DEMO_AGENT_ID, chain: 'ETH', asset: 'USDC', amount: 8_000, amountUsd: 8_000, from: FROM, to: addr('b0b1'), counterpartyJurisdiction: 'AE', memo: 'Vendor invoice — licensed UAE supplier' },
  { id: 'tx-2', agentId: DEMO_AGENT_ID, chain: 'ETH', asset: 'USDC', amount: 5_000, amountUsd: 5_000, from: FROM, to: OFAC_SANCTIONED, counterpartyJurisdiction: 'AE', memo: 'Unknown counterparty' },
  { id: 'tx-3', agentId: DEMO_AGENT_ID, chain: 'ETH', asset: 'USDC', amount: 9_000, amountUsd: 9_000, from: FROM, to: MED_RISK_ADDRESS, counterpartyJurisdiction: 'BH', memo: 'Elevated-risk cluster' },
  { id: 'tx-4', agentId: DEMO_AGENT_ID, chain: 'ETH', asset: 'USDC', amount: 40_000, amountUsd: 40_000, from: FROM, to: addr('c0ffee'), counterpartyJurisdiction: 'SA', memo: 'Large settlement' },
  { id: 'tx-5', agentId: DEMO_AGENT_ID, chain: 'ETH', asset: 'USDC', amount: 6_000, amountUsd: 6_000, from: FROM, to: addr('d00d'), counterpartyJurisdiction: 'KP', memo: 'Counterparty in unlicensed jurisdiction' },
  { id: 'tx-6', agentId: DEMO_AGENT_ID, chain: 'ETH', asset: 'USDC', amount: 7_000, amountUsd: 7_000, from: FROM, to: HIGH_RISK_ADDRESS, counterpartyJurisdiction: 'AE', memo: 'Severe-risk cluster' },
]
