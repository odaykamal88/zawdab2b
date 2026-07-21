import type { Jurisdiction } from './types'

export interface JurisdictionNode {
  code: Jurisdiction
  country: string
  regulator: string
  regulatorAr?: string
  authorityType: 'financial-free-zone' | 'central-bank' | 'securities' | 'standard-setter'
  primarySourceUrl: string
}

// Jurisdiction taxonomy — regulators are real; Arabic names included only where
// confirmed (e.g. CBB, taken from the CBB letterhead in the data room).
export const JURISDICTIONS: JurisdictionNode[] = [
  { code: 'AE-VARA', country: 'United Arab Emirates', regulator: 'Virtual Assets Regulatory Authority', authorityType: 'financial-free-zone', primarySourceUrl: 'https://www.vara.ae/en/' },
  { code: 'AE-ADGM', country: 'United Arab Emirates', regulator: 'ADGM Financial Services Regulatory Authority', authorityType: 'financial-free-zone', primarySourceUrl: 'https://www.adgm.com/' },
  { code: 'AE-DFSA', country: 'United Arab Emirates', regulator: 'Dubai Financial Services Authority', authorityType: 'financial-free-zone', primarySourceUrl: 'https://www.dfsa.ae/' },
  { code: 'AE-CBUAE', country: 'United Arab Emirates', regulator: 'Central Bank of the UAE', authorityType: 'central-bank', primarySourceUrl: 'https://www.centralbank.ae/en/' },
  { code: 'BH-CBB', country: 'Bahrain', regulator: 'Central Bank of Bahrain', regulatorAr: 'مصرف البحرين المركزي', authorityType: 'central-bank', primarySourceUrl: 'https://www.cbb.gov.bh/' },
  { code: 'SA-CMA', country: 'Saudi Arabia', regulator: 'Capital Market Authority', authorityType: 'securities', primarySourceUrl: 'https://cma.org.sa/en/' },
  { code: 'SA-SAMA', country: 'Saudi Arabia', regulator: 'Saudi Central Bank', authorityType: 'central-bank', primarySourceUrl: 'https://www.sama.gov.sa/en-US/' },
  { code: 'QA-QFCRA', country: 'Qatar', regulator: 'Qatar Financial Centre Regulatory Authority', authorityType: 'financial-free-zone', primarySourceUrl: 'https://www.qfcra.com/' },
  { code: 'INTL-FATF', country: 'International', regulator: 'Financial Action Task Force', authorityType: 'standard-setter', primarySourceUrl: 'https://www.fatf-gafi.org/' },
]

export interface LicenceTypeNode {
  key: string
  jurisdiction: Jurisdiction
  label: string
  /** Real, source-backed where cited; capital figures are per public frameworks. */
  note?: string
}

// Licence-type taxonomy. VARA activity licences and CBB CRA categories are real
// public frameworks; capital notes should be re-confirmed against the current
// rulebook before external quotation.
export const LICENCE_TYPES: LicenceTypeNode[] = [
  { key: 'vara-advisory', jurisdiction: 'AE-VARA', label: 'Advisory Services' },
  { key: 'vara-broker-dealer', jurisdiction: 'AE-VARA', label: 'Broker-Dealer Services' },
  { key: 'vara-exchange', jurisdiction: 'AE-VARA', label: 'Exchange Services' },
  { key: 'vara-custody', jurisdiction: 'AE-VARA', label: 'Custody Services' },
  { key: 'vara-lending', jurisdiction: 'AE-VARA', label: 'Lending & Borrowing' },
  { key: 'vara-transfer-settlement', jurisdiction: 'AE-VARA', label: 'Transfer & Settlement' },
  { key: 'vara-management', jurisdiction: 'AE-VARA', label: 'Management & Investment' },
  { key: 'cbb-cra-cat1', jurisdiction: 'BH-CBB', label: 'CRA Category 1', note: 'Advisory / arranging (CRA Module, Rulebook Vol. 6)' },
  { key: 'cbb-cra-cat2', jurisdiction: 'BH-CBB', label: 'CRA Category 2', note: 'Includes custody, wallets, and trading platform per CRA Module' },
  { key: 'cbb-cra-cat3', jurisdiction: 'BH-CBB', label: 'CRA Category 3' },
  { key: 'cbb-cra-cat4', jurisdiction: 'BH-CBB', label: 'CRA Category 4' },
  { key: 'adgm-fsp-va', jurisdiction: 'AE-ADGM', label: 'FSP — Virtual Asset activities' },
  { key: 'adgm-frt-issuer', jurisdiction: 'AE-ADGM', label: 'Fiat-Referenced Token issuer' },
]
