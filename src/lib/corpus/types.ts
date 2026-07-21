// Regulatory corpus — a structured, API-accessible dataset (not AI summaries).
// Every item carries provenance and a verification status; nothing here is
// model-generated regulation. Unverified items are seeded from existing repo
// data and MUST be checked against the primary source before enterprise use.

export type Jurisdiction =
  | 'AE-VARA' // Dubai — Virtual Assets Regulatory Authority
  | 'AE-ADGM' // Abu Dhabi Global Market — FSRA
  | 'AE-DFSA' // DIFC — Dubai Financial Services Authority
  | 'AE-CBUAE' // Central Bank of the UAE
  | 'BH-CBB' // Central Bank of Bahrain
  | 'SA-CMA' // Saudi Capital Market Authority
  | 'SA-SAMA' // Saudi Central Bank
  | 'QA-QFCRA' // Qatar Financial Centre Regulatory Authority
  | 'INTL-FATF' // Financial Action Task Force

export type ItemType = 'regulation' | 'rulebook' | 'circular' | 'enforcement' | 'guidance' | 'consultation'

/** Verification status against the authoritative/primary source. */
export type Verification = 'primary-verified' | 'secondary' | 'needs-verification'

export interface Provenance {
  sourceName: string
  sourceUrl: string
  /** 'primary' = regulator's own publication; 'secondary' = reputable reporting. */
  sourceType: 'primary' | 'secondary'
  /** ISO date the fact was captured/confirmed in this corpus. */
  capturedAt: string
}

export interface ChangeRecord {
  date: string
  summary: string
  provenance?: Provenance
}

export interface CorpusItem {
  id: string
  jurisdiction: Jurisdiction
  regulator: string
  regulatorAr?: string
  type: ItemType
  /** Licence-type taxonomy keys this item applies to (see taxonomy.ts). */
  licenceTypes?: string[]
  titleEn: string
  titleAr?: string
  summaryEn: string
  /** Discrete obligations a licensee must satisfy. */
  obligations?: string[]
  /** Mappings to internal compliance controls (control ids/labels). */
  controlMappings?: string[]
  effectiveDate?: string
  deadline?: string
  // Enforcement-specific:
  entity?: string
  fineUsd?: number
  changeHistory?: ChangeRecord[]
  provenance: Provenance
  verification: Verification
}
