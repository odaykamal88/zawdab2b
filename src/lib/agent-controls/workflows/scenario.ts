import type { Alert } from './types'

const addr = (tag: string): string => '0x' + tag.toLowerCase().replace(/[^0-9a-f]/g, '').padStart(40, '0')

// Real OFAC-sanctioned address (Lazarus/Ronin) drives the mandatory-SAR path.
const OFAC_SANCTIONED = '0x098B716B8Aaf21512996dC57EB0615e2383E2f96'
export const WF_HIGH_RISK = addr('h1gh95')
export const WF_MED_RISK = addr('med76')
export const WF_RISK_OVERRIDES: Record<string, number> = { [WF_HIGH_RISK]: 95, [WF_MED_RISK]: 76 }

export const WF_ALERTS: Alert[] = [
  { id: 'AL-1001', kind: 'counterparty', subject: addr('c1ean'), amountUsd: 12_000, counterpartyJurisdiction: 'AE', fiu: 'VARA', note: 'Inbound from new counterparty' },
  { id: 'AL-1002', kind: 'transaction', subject: OFAC_SANCTIONED, amountUsd: 5_000, counterpartyJurisdiction: 'AE', fiu: 'CBB', note: 'Outbound payment flagged' },
  { id: 'AL-1003', kind: 'address', subject: WF_HIGH_RISK, amountUsd: 30_000, counterpartyJurisdiction: 'BH', fiu: 'CBB', note: 'Cluster exposure alert' },
  { id: 'AL-1004', kind: 'counterparty', subject: WF_MED_RISK, amountUsd: 8_000, counterpartyJurisdiction: 'AE', fiu: 'ADGM', note: 'Elevated exposure' },
]
