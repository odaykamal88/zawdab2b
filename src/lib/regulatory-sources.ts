/**
 * Comprehensive MENA regulatory source registry.
 * Each source has a jurisdiction, regulator, URL patterns to crawl,
 * and the types of updates it publishes.
 */

export interface RegulatorySource {
  id: string
  jurisdiction: string
  jurisdictionCode: string
  regulator: string
  regulatorShort: string
  /** Flag emoji */
  flag: string
  /** Base URLs to crawl for updates */
  feeds: { url: string; type: UpdateType }[]
  /** Enforcement fine currency */
  currency: string
  /** Max fine amount for severity scoring */
  maxFine: string
}

export type UpdateType =
  | 'enforcement'      // Fines, cease-and-desist, license revocations
  | 'regulation'       // New rules, framework changes, amendments
  | 'consultation'     // Public consultation papers, draft rules
  | 'guidance'         // Guidance notes, circulars, FAQs
  | 'deadline'         // Filing deadlines, compliance deadlines
  | 'licensing'        // New licenses granted, license changes
  | 'sanction'         // Sanctions list updates, designations

export type Severity = 'critical' | 'high' | 'medium' | 'low'

export interface RegulatoryUpdate {
  id: string
  sourceId: string
  jurisdiction: string
  jurisdictionCode: string
  regulator: string
  type: UpdateType
  severity: Severity
  title: string
  summary: string
  url: string
  date: string
  /** Entity involved (for enforcement) */
  entity?: string
  /** Fine amount (for enforcement) */
  fineAmount?: string
  /** Deadline date (for deadline type) */
  deadlineDate?: string
  /** Whether this was already dispatched */
  dispatched: boolean
  /** When the regulator originally published this update (falls back to date if not parsed) */
  publishedAt?: string
  /** When Zawda dispatched this to subscribers — used for SLA §3.1 tracking */
  dispatchedAt?: string
}

export const UPDATE_TYPE_LABELS: Record<UpdateType, string> = {
  enforcement: 'Enforcement Action',
  regulation: 'Regulatory Update',
  consultation: 'Consultation Paper',
  guidance: 'Guidance Note',
  deadline: 'Compliance Deadline',
  licensing: 'Licensing Update',
  sanction: 'Sanctions Update',
}

export const UPDATE_TYPE_ICONS: Record<UpdateType, string> = {
  enforcement: '\u{1F534}',   // 🔴
  regulation: '\u{1F7E0}',    // 🟠
  consultation: '\u{1F535}',  // 🔵
  guidance: '\u{1F7E2}',      // 🟢
  deadline: '\u{26A0}\u{FE0F}', // ⚠️
  licensing: '\u{1F7E1}',     // 🟡
  sanction: '\u{1F6D1}',      // 🛑
}

/**
 * Severity scoring rules:
 * - critical: enforcement with significant fines, license revocations, new mandatory deadlines
 * - high: new regulations, framework amendments, major guidance changes
 * - medium: consultation papers, licensing updates, routine guidance
 * - low: minor circulars, FAQ updates, general announcements
 *
 * Only "critical" updates break the weekly digest rhythm.
 * Everything else is batched into the weekly summary.
 */
export function scoreSeverity(type: UpdateType, fineAmount?: number): Severity {
  if (type === 'enforcement') {
    if (fineAmount && fineAmount > 100000) return 'critical'
    return 'high'
  }
  if (type === 'deadline') return 'critical'
  if (type === 'regulation') return 'high'
  if (type === 'sanction') return 'high'
  if (type === 'consultation') return 'medium'
  if (type === 'licensing') return 'medium'
  return 'low'
}

export const REGULATORY_SOURCES: RegulatorySource[] = [
  // UAE — VARA (Dubai)
  {
    id: 'vara',
    jurisdiction: 'Dubai (VARA)',
    jurisdictionCode: 'VARA',
    regulator: 'Virtual Assets Regulatory Authority',
    regulatorShort: 'VARA',
    flag: '\u{1F1E6}\u{1F1EA}',
    currency: 'AED',
    maxFine: 'AED 10,000,000',
    feeds: [
      { url: 'https://www.vara.ae/en/news/', type: 'enforcement' },
      { url: 'https://www.vara.ae/en/regulations/', type: 'regulation' },
      { url: 'https://www.vara.ae/en/guidance/', type: 'guidance' },
    ],
  },
  // UAE — ADGM / FSRA (Abu Dhabi)
  {
    id: 'adgm',
    jurisdiction: 'Abu Dhabi (ADGM)',
    jurisdictionCode: 'ADGM',
    regulator: 'Financial Services Regulatory Authority',
    regulatorShort: 'FSRA',
    flag: '\u{1F1E6}\u{1F1EA}',
    currency: 'USD',
    maxFine: '$25,000,000',
    feeds: [
      { url: 'https://www.adgm.com/media/announcements', type: 'enforcement' },
      { url: 'https://www.adgm.com/media/announcements', type: 'regulation' },
      { url: 'https://en.adgm.thomsonreuters.com/rulebook', type: 'guidance' },
    ],
  },
  // UAE — CBUAE (Central Bank)
  {
    id: 'cbuae',
    jurisdiction: 'UAE (Central Bank)',
    jurisdictionCode: 'CBUAE',
    regulator: 'Central Bank of the UAE',
    regulatorShort: 'CBUAE',
    flag: '\u{1F1E6}\u{1F1EA}',
    currency: 'AED',
    maxFine: 'AED 5,000,000',
    feeds: [
      { url: 'https://www.centralbank.ae/en/news/', type: 'regulation' },
      { url: 'https://www.centralbank.ae/en/regulatory-framework/', type: 'guidance' },
    ],
  },
  // UAE — DFSA (DIFC)
  {
    id: 'dfsa',
    jurisdiction: 'DIFC (DFSA)',
    jurisdictionCode: 'DFSA',
    regulator: 'Dubai Financial Services Authority',
    regulatorShort: 'DFSA',
    flag: '\u{1F1E6}\u{1F1EA}',
    currency: 'USD',
    maxFine: '$25,000,000',
    feeds: [
      { url: 'https://www.dfsa.ae/news', type: 'enforcement' },
      { url: 'https://www.dfsa.ae/regulatory-framework', type: 'regulation' },
      { url: 'https://www.dfsa.ae/consultation-papers', type: 'consultation' },
    ],
  },
  // Bahrain — CBB
  {
    id: 'cbb',
    jurisdiction: 'Bahrain (CBB)',
    jurisdictionCode: 'CBB',
    regulator: 'Central Bank of Bahrain',
    regulatorShort: 'CBB',
    flag: '\u{1F1E7}\u{1F1ED}',
    currency: 'BHD',
    maxFine: 'BHD 1,000,000',
    feeds: [
      { url: 'https://www.cbb.gov.bh/news/', type: 'enforcement' },
      { url: 'https://www.cbb.gov.bh/regulations/', type: 'regulation' },
      { url: 'https://www.cbb.gov.bh/consultation/', type: 'consultation' },
    ],
  },
  // Saudi Arabia — CMA
  {
    id: 'cma-sa',
    jurisdiction: 'Saudi Arabia (CMA)',
    jurisdictionCode: 'CMA',
    regulator: 'Capital Market Authority',
    regulatorShort: 'CMA',
    flag: '\u{1F1F8}\u{1F1E6}',
    currency: 'SAR',
    maxFine: 'SAR 10,000,000',
    feeds: [
      { url: 'https://cma.org.sa/en/MediaCenter/Pages/default.aspx', type: 'enforcement' },
      { url: 'https://cma.org.sa/en/RulesRegulations/Pages/default.aspx', type: 'regulation' },
    ],
  },
  // Saudi Arabia — SAMA
  {
    id: 'sama',
    jurisdiction: 'Saudi Arabia (SAMA)',
    jurisdictionCode: 'SAMA',
    regulator: 'Saudi Central Bank',
    regulatorShort: 'SAMA',
    flag: '\u{1F1F8}\u{1F1E6}',
    currency: 'SAR',
    maxFine: 'SAR 5,000,000',
    feeds: [
      { url: 'https://www.sama.gov.sa/en-US/News/Pages/default.aspx', type: 'regulation' },
    ],
  },
  // Qatar — QFCRA
  {
    id: 'qfcra',
    jurisdiction: 'Qatar (QFCRA)',
    jurisdictionCode: 'QFCRA',
    regulator: 'Qatar Financial Centre Regulatory Authority',
    regulatorShort: 'QFCRA',
    flag: '\u{1F1F6}\u{1F1E6}',
    currency: 'QAR',
    maxFine: 'QAR 10,000,000',
    feeds: [
      { url: 'https://www.qfcra.com/enforcement/', type: 'enforcement' },
      { url: 'https://www.qfcra.com/legislation-and-policy/', type: 'regulation' },
    ],
  },
  // Qatar — QCB
  {
    id: 'qcb',
    jurisdiction: 'Qatar (QCB)',
    jurisdictionCode: 'QCB',
    regulator: 'Qatar Central Bank',
    regulatorShort: 'QCB',
    flag: '\u{1F1F6}\u{1F1E6}',
    currency: 'QAR',
    maxFine: 'QAR 5,000,000',
    feeds: [
      { url: 'https://www.qcb.gov.qa/english/news/', type: 'regulation' },
    ],
  },
  // Kuwait — CMA
  {
    id: 'cma-kw',
    jurisdiction: 'Kuwait (CMA)',
    jurisdictionCode: 'CMA-KW',
    regulator: 'Capital Markets Authority',
    regulatorShort: 'CMA Kuwait',
    flag: '\u{1F1F0}\u{1F1FC}',
    currency: 'KWD',
    maxFine: 'KWD 500,000',
    feeds: [
      { url: 'https://www.cma.gov.kw/en/web/cma/news', type: 'enforcement' },
      { url: 'https://www.cma.gov.kw/en/web/cma/regulations', type: 'regulation' },
    ],
  },
  // Oman — CBO
  {
    id: 'cbo',
    jurisdiction: 'Oman (CBO)',
    jurisdictionCode: 'CBO',
    regulator: 'Central Bank of Oman',
    regulatorShort: 'CBO',
    flag: '\u{1F1F4}\u{1F1F2}',
    currency: 'OMR',
    maxFine: 'OMR 500,000',
    feeds: [
      { url: 'https://cbo.gov.om/news', type: 'regulation' },
    ],
  },
  // Oman — CMA
  {
    id: 'cma-om',
    jurisdiction: 'Oman (CMA)',
    jurisdictionCode: 'CMA-OM',
    regulator: 'Capital Market Authority',
    regulatorShort: 'CMA Oman',
    flag: '\u{1F1F4}\u{1F1F2}',
    currency: 'OMR',
    maxFine: 'OMR 300,000',
    feeds: [
      { url: 'https://www.cma.gov.om/Home/CircularList', type: 'regulation' },
    ],
  },
  // Jordan — CBJ / JSC
  {
    id: 'jsc',
    jurisdiction: 'Jordan (JSC)',
    jurisdictionCode: 'JSC',
    regulator: 'Jordan Securities Commission',
    regulatorShort: 'JSC',
    flag: '\u{1F1EF}\u{1F1F4}',
    currency: 'JOD',
    maxFine: 'JOD 500,000',
    feeds: [
      { url: 'https://www.jsc.gov.jo/en/news', type: 'regulation' },
    ],
  },
  // International — FATF
  {
    id: 'fatf',
    jurisdiction: 'International (FATF)',
    jurisdictionCode: 'FATF',
    regulator: 'Financial Action Task Force',
    regulatorShort: 'FATF',
    flag: '\u{1F30D}',
    currency: 'N/A',
    maxFine: 'N/A',
    feeds: [
      { url: 'https://www.fatf-gafi.org/en/publications.html', type: 'regulation' },
      { url: 'https://www.fatf-gafi.org/en/countries.html', type: 'sanction' },
    ],
  },
]

/** Get sources relevant to a set of jurisdiction codes */
export function getSourcesForJurisdictions(codes: string[]): RegulatorySource[] {
  if (!codes.length) return REGULATORY_SOURCES
  const codeSet = new Set(codes.map(c => c.toUpperCase()))
  return REGULATORY_SOURCES.filter(s => codeSet.has(s.jurisdictionCode.toUpperCase()))
}

/** All jurisdiction codes available */
export const ALL_JURISDICTION_CODES = [...new Set(REGULATORY_SOURCES.map(s => s.jurisdictionCode))]

/** Grouped by country for display */
export const JURISDICTION_GROUPS: { country: string; flag: string; sources: RegulatorySource[] }[] = (() => {
  const groups: Record<string, { flag: string; sources: RegulatorySource[] }> = {}
  for (const s of REGULATORY_SOURCES) {
    const country = s.jurisdiction.includes('International') ? 'International' :
      s.jurisdiction.includes('UAE') || s.jurisdiction.includes('Dubai') || s.jurisdiction.includes('Abu Dhabi') || s.jurisdiction.includes('DIFC') ? 'UAE' :
      s.jurisdiction.includes('Bahrain') ? 'Bahrain' :
      s.jurisdiction.includes('Saudi') ? 'Saudi Arabia' :
      s.jurisdiction.includes('Qatar') ? 'Qatar' :
      s.jurisdiction.includes('Kuwait') ? 'Kuwait' :
      s.jurisdiction.includes('Oman') ? 'Oman' :
      s.jurisdiction.includes('Jordan') ? 'Jordan' : 'Other'
    if (!groups[country]) groups[country] = { flag: s.flag, sources: [] }
    groups[country].sources.push(s)
  }
  return Object.entries(groups).map(([country, g]) => ({ country, flag: g.flag, sources: g.sources }))
})()
