/**
 * Curated top regulatory risks for MENA digital asset firms.
 * Rotated weekly via ISO week number so the hero stat and floating alert
 * refresh automatically without a content deploy.
 *
 * Add new entries at the END of the array. Older items stay in rotation.
 * Each entry should cite a source URL so the claim is verifiable.
 */

export interface TopRisk {
  /** Short headline shown in the hero stat chip (≤ 24 chars ideally). */
  stat: string
  /** Label below the stat value — short noun phrase. */
  statLabel: string
  /** Full headline for the floating alert card. */
  headline: string
  /** One-sentence context for the floating alert card. */
  body: string
  /** Deep-link for "read more" on the floating alert. */
  href: string
  /** Source citation rendered in small text. */
  source: string
}

/**
 * Keep these grounded in verifiable public facts. The list is consumed
 * by two surfaces, so everything here must read well in both.
 */
export const TOP_RISKS: TopRisk[] = [
  {
    stat: 'LIVE',
    statLabel: 'Travel Rule enforcement',
    headline: 'FATF Travel Rule is now enforced across VARA and ADGM.',
    body:
      'As of March 2026, VASPs must transmit originator and beneficiary data on qualifying transfers. Non-compliant firms face license suspension.',
    href: '#assessment',
    source: 'FATF Recommendation 16',
  },
  {
    stat: '19',
    statLabel: 'cease-and-desist orders (Q4 2025)',
    headline: 'VARA issued 19 cease-and-desist orders in Q4 2025.',
    body:
      'Fines of up to AED 600K per violation were imposed on unlicensed firms operating in the UAE. Enforcement has continued into 2026.',
    href: '#pain',
    source: 'vara.ae enforcement register',
  },
  {
    stat: 'AED 50M',
    statLabel: 'stablecoin issuer capital floor',
    headline: 'Stablecoin issuance now requires dual regulator approval.',
    body:
      'VARA + CBUAE jointly gate AED-denominated stablecoin issuance, with a AED 50M capital floor, 1:1 HQLA reserves, and monthly attestation.',
    href: '#product',
    source: 'CBUAE Payment Token Services Regulation',
  },
  {
    stat: 'Q2 2026',
    statLabel: 'CMA digital asset rules draft',
    headline: 'Saudi CMA draft digital asset rules expected Q2 2026.',
    body:
      'Firms planning KSA market entry should begin readiness now — consultation windows historically close within 8 weeks of publication.',
    href: '#product',
    source: 'CMA Strategic Plan 2024–2026',
  },
]

/**
 * Compute ISO-8601 week number for a given date. Used to rotate risks
 * deterministically so every visitor in the same calendar week sees the
 * same item.
 */
export function getISOWeek(date: Date = new Date()): number {
  // Copy to avoid mutating input and zero the time portion.
  const d = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()))
  // ISO weeks start on Monday. Shift Sunday (0) to 7.
  const dayNum = d.getUTCDay() || 7
  // Thursday in current week decides the year.
  d.setUTCDate(d.getUTCDate() + 4 - dayNum)
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1))
  return Math.ceil(((d.getTime() - yearStart.getTime()) / 86400000 + 1) / 7)
}

/**
 * Select this week's top risk. Same input week -> same output for the
 * whole world. Exported separately from the array so call sites can
 * stay short.
 */
export function getWeeklyTopRisk(date: Date = new Date()): TopRisk {
  const week = getISOWeek(date)
  return TOP_RISKS[week % TOP_RISKS.length]
}

/**
 * Stable key for "dismissed this week" state in localStorage so the
 * floating alert re-appears each new week.
 */
export function getWeeklyAlertKey(date: Date = new Date()): string {
  return `zawda-alert-dismissed-${date.getUTCFullYear()}-w${getISOWeek(date)}`
}
