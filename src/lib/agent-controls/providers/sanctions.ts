import { OFAC_SDN_CRYPTO_SNAPSHOT } from '../data/ofac-sdn-crypto'
import type { SanctionsMatch } from '../types'

export interface SanctionsProvider {
  readonly name: string
  screen(address: string): SanctionsMatch | null
}

/**
 * Screens an address against a real OFAC SDN digital-currency snapshot.
 * A match is a hard, non-overridable block signal.
 */
export class OfacSanctionsProvider implements SanctionsProvider {
  readonly name = 'OFAC SDN (digital-currency addresses)'
  private readonly index: Map<string, { entity: string; program: string }>
  private readonly source: string
  private readonly sourceUrl: string

  constructor(snapshot = OFAC_SDN_CRYPTO_SNAPSHOT) {
    this.index = new Map(
      snapshot.entries.map((e) => [e.address.toLowerCase(), { entity: e.entity, program: e.program }]),
    )
    this.source = snapshot.source
    this.sourceUrl = snapshot.sourceUrl
  }

  screen(address: string): SanctionsMatch | null {
    const hit = this.index.get(address.trim().toLowerCase())
    if (!hit) return null
    return { listed: true, source: this.source, sourceUrl: this.sourceUrl, entity: hit.entity, program: hit.program }
  }

  // PRODUCTION: add refreshFromLiveSdn() to rebuild `index` from the live OFAC
  // feed on a schedule.
}
