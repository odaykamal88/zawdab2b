import type { RiskAssessment } from '../types'

export interface RiskScoreProvider {
  readonly name: string
  assess(address: string): RiskAssessment
}

function band(score: number): RiskAssessment['band'] {
  if (score >= 90) return 'severe'
  if (score >= 70) return 'high'
  if (score >= 40) return 'medium'
  return 'low'
}

/**
 * SIMULATED Chainalysis-KYT-style risk scoring for the PoC.
 *
 * Every result carries `simulated: true` so a score can never be mistaken for
 * real screening. Scores are deterministic (derived from the address) so the
 * demo is reproducible without randomness.
 *
 * PRODUCTION: replace with Chainalysis KYT (address / cluster risk API). Keep
 * the RiskAssessment shape identical and nothing downstream changes.
 */
export class MockKytRiskProvider implements RiskScoreProvider {
  readonly name = 'mock-kyt (simulated)'
  private readonly overrides: Map<string, number>

  constructor(overrides: Record<string, number> = {}) {
    this.overrides = new Map(Object.entries(overrides).map(([k, v]) => [k.toLowerCase(), v]))
  }

  assess(address: string): RiskAssessment {
    const key = address.trim().toLowerCase()
    const score = this.overrides.has(key) ? this.overrides.get(key)! : this.deterministicScore(key)
    return { score, band: band(score), provider: this.name, simulated: true }
  }

  private deterministicScore(key: string): number {
    let h = 0
    for (let i = 0; i < key.length; i++) h = (h * 31 + key.charCodeAt(i)) >>> 0
    return h % 55 // unknown addresses land "low/medium" unless explicitly overridden
  }
}
