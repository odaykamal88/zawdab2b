import { CORPUS } from './data'
import { JURISDICTIONS, LICENCE_TYPES } from './taxonomy'
import type { CorpusItem, ItemType, Jurisdiction, Verification } from './types'

export interface CorpusQuery {
  jurisdiction?: Jurisdiction
  type?: ItemType
  licenceType?: string
  /** Items whose effectiveDate is >= this ISO date (string compare, YYYY[-MM[-DD]]). */
  since?: string
  verification?: Verification
}

export function queryCorpus(q: CorpusQuery = {}): CorpusItem[] {
  return CORPUS.filter((item) => {
    if (q.jurisdiction && item.jurisdiction !== q.jurisdiction) return false
    if (q.type && item.type !== q.type) return false
    if (q.licenceType && !(item.licenceTypes ?? []).includes(q.licenceType)) return false
    if (q.verification && item.verification !== q.verification) return false
    if (q.since && (item.effectiveDate ?? '') < q.since) return false
    return true
  })
}

export function getCorpusItem(id: string): CorpusItem | undefined {
  return CORPUS.find((i) => i.id === id)
}

export interface CorpusCoverage {
  total: number
  byVerification: Record<Verification, number>
  byJurisdiction: Record<string, number>
  byType: Record<string, number>
  arabicNormalized: number
  withProvenance: number
  jurisdictionsCovered: number
  jurisdictionsInTaxonomy: number
}

export function corpusCoverage(): CorpusCoverage {
  const byVerification: Record<Verification, number> = { 'primary-verified': 0, secondary: 0, 'needs-verification': 0 }
  const byJurisdiction: Record<string, number> = {}
  const byType: Record<string, number> = {}
  let arabicNormalized = 0
  let withProvenance = 0
  for (const i of CORPUS) {
    byVerification[i.verification]++
    byJurisdiction[i.jurisdiction] = (byJurisdiction[i.jurisdiction] ?? 0) + 1
    byType[i.type] = (byType[i.type] ?? 0) + 1
    if (i.titleAr || i.regulatorAr) arabicNormalized++
    if (i.provenance?.sourceUrl) withProvenance++
  }
  return {
    total: CORPUS.length,
    byVerification,
    byJurisdiction,
    byType,
    arabicNormalized,
    withProvenance,
    jurisdictionsCovered: Object.keys(byJurisdiction).length,
    jurisdictionsInTaxonomy: JURISDICTIONS.length,
  }
}

export { CORPUS } from './data'
export { JURISDICTIONS, LICENCE_TYPES } from './taxonomy'
export type { CorpusItem, ItemType, Jurisdiction, Verification, Provenance, ChangeRecord } from './types'
