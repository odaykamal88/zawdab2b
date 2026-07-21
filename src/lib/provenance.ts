/**
 * Provenance layer — joins each jurisdiction profile to its authoritative
 * regulator source in the MENA source registry, so every profile carries a
 * real, verifiable link back to the regulator that publishes the rules.
 *
 * This deliberately does NOT invent per-figure citations. It attaches the
 * official regulator source (a real URL) and surfaces coverage gaps honestly
 * via jurisdictionProvenanceCoverage(), rather than fabricating a citation for
 * every capital/timeline number.
 */
import { JURISDICTION_PROFILES, type JurisdictionProfile } from './jurisdiction-intelligence'
import { REGULATORY_SOURCES, type RegulatorySource, type UpdateType } from './regulatory-sources'

export interface OfficialSource {
  regulator: string
  regulatorShort: string
  registryId: string
  urls: Partial<Record<UpdateType, string>>
}

export interface JurisdictionWithProvenance {
  profile: JurisdictionProfile
  provenance: OfficialSource | null
}

const SOURCE_BY_ID = new Map<string, RegulatorySource>(REGULATORY_SOURCES.map((s) => [s.id, s]))

// Known id aliases between the jurisdiction profiles and the source registry.
// Extend as gaps are found via jurisdictionProvenanceCoverage().
const SOURCE_ALIASES: Record<string, string> = {}

function sourceForProfile(profileId: string): RegulatorySource | undefined {
  return SOURCE_BY_ID.get(profileId) ?? SOURCE_BY_ID.get(SOURCE_ALIASES[profileId] ?? '')
}

function toOfficialSource(s: RegulatorySource): OfficialSource {
  const urls: Partial<Record<UpdateType, string>> = {}
  for (const f of s.feeds) if (!urls[f.type]) urls[f.type] = f.url
  return { regulator: s.regulator, regulatorShort: s.regulatorShort, registryId: s.id, urls }
}

export function getJurisdictionWithProvenance(id: string): JurisdictionWithProvenance | null {
  const profile = JURISDICTION_PROFILES[id]
  if (!profile) return null
  const s = sourceForProfile(id)
  return { profile, provenance: s ? toOfficialSource(s) : null }
}

export function listJurisdictionsWithProvenance(): JurisdictionWithProvenance[] {
  return Object.keys(JURISDICTION_PROFILES).map((id) => getJurisdictionWithProvenance(id)!)
}

export interface CoverageRow {
  id: string
  name: string
  status: string
  hasOfficialSource: boolean
  registryId?: string
}

export function jurisdictionProvenanceCoverage(): CoverageRow[] {
  return Object.values(JURISDICTION_PROFILES).map((p) => {
    const s = sourceForProfile(p.id)
    return { id: p.id, name: p.name, status: p.status, hasOfficialSource: !!s, registryId: s?.id }
  })
}

export const PROVENANCE_META = {
  note:
    'Jurisdiction profiles are joined to official regulator sources. The linked regulator pages are the authoritative source; per-figure (capital, timeline) citations are a documented follow-up, not fabricated.',
  registry: 'src/lib/regulatory-sources.ts',
}
