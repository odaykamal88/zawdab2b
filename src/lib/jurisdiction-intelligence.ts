/**
 * DEFENSE GUIDELINE: Principle 1 — This entire module must move to a server-side
 * API in production. The regulatory knowledge graph, jurisdiction assessments,
 * scoring weights, and recommendation logic are proprietary.
 *
 * Principle 3: Chainalysis data enrichment feeds into jurisdiction risk scoring.
 * Principle 4: Every recommendation is stored for model improvement.
 * Principle 7: Arabic-language narratives must be server-generated.
 */

export type JurisdictionStatus = 'active' | 'emerging' | 'hostile' | 'none'

export interface JurisdictionLicense {
  name: string
  activities: string[]
  capital: string
  timeline: string
}

export interface JurisdictionProfile {
  id: string
  name: string
  regulator: string
  flag: string
  status: JurisdictionStatus
  licenses: JurisdictionLicense[]
  stance: string
  stanceDetail: string
  risks: string[]
  bestFor: string[]
  worstFor: string[]
  /** What it would take to make this jurisdiction viable — used for hostile/none */
  whatItWouldTake?: string
  /** Where to redirect users if this jurisdiction can't serve them */
  redirectTo?: string[]
  /** Activity-specific advantages over other jurisdictions */
  activityAdvantages?: Record<string, string>
}

export const JURISDICTION_PROFILES: Record<string, JurisdictionProfile> = {
  // ═══════════════════════════════════════════════
  // ACTIVE LICENSING FRAMEWORKS
  // ═══════════════════════════════════════════════
  vara: {
    id: 'vara',
    name: 'VARA (Dubai)',
    regulator: 'Virtual Assets Regulatory Authority',
    flag: '🇦🇪',
    status: 'active',
    stance: 'Most comprehensive VASP licensing framework in MENA.',
    stanceDetail: 'VARA operates the most mature digital asset regulatory framework in the region. Activity-specific licensing, clear capital requirements, and active enforcement. 19 cease-and-desist orders in Q4 2025. This is the gold standard for MENA — but the most expensive and strictest to obtain.',
    licenses: [
      { name: 'Advisory Services License', activities: ['Advisory Services'], capital: 'AED 500K', timeline: '3–6 months' },
      { name: 'Broker-Dealer License', activities: ['Broker-Dealer', 'OTC Brokerage'], capital: 'AED 5M', timeline: '6–9 months' },
      { name: 'Exchange License', activities: ['Exchange / Trading Platform'], capital: 'AED 15M', timeline: '9–12 months' },
      { name: 'Custody License', activities: ['Custody & Safeguarding'], capital: 'AED 10M', timeline: '6–9 months' },
      { name: 'Lending/Borrowing License', activities: ['Lending & Borrowing'], capital: 'AED 5M', timeline: '6–9 months' },
      { name: 'Transfer & Settlement License', activities: ['Transfer & Settlement', 'Payments / Remittance'], capital: 'AED 5M', timeline: '6–9 months' },
      { name: 'Stablecoin Issuance License', activities: ['Stablecoin Issuance'], capital: 'AED 50M', timeline: '12–18 months' },
      { name: 'Stablecoin Management License', activities: ['Stablecoin Management'], capital: 'AED 10M', timeline: '9–12 months' },
    ],
    risks: [
      'Highest capital requirements in the region',
      'Active enforcement — 19 firms ceased in Q4 2025',
      'Dual regulatory risk (VARA + CBUAE for stablecoins)',
      'Banking relationships extremely difficult to establish',
    ],
    bestFor: ['Exchange / Trading Platform', 'Custody & Safeguarding', 'Stablecoin Issuance'],
    worstFor: [],
    activityAdvantages: {
      'Exchange / Trading Platform': 'Dubai is the #1 hub for retail crypto trading in MENA. VARA license carries the most market credibility.',
      'Custody & Safeguarding': 'VARA custody license is the most recognized in the region. Institutional clients expect it.',
      'Stablecoin Issuance': 'Only jurisdiction with a dedicated stablecoin issuance license category. AED 50M capital barrier keeps competition low.',
    },
  },

  adgm: {
    id: 'adgm',
    name: 'ADGM (Abu Dhabi)',
    regulator: 'Financial Services Regulatory Authority (FSRA)',
    flag: '🇦🇪',
    status: 'active',
    stance: 'Common law jurisdiction with institutional-grade regulatory framework.',
    stanceDetail: 'ADGM operates under English common law — unique in the UAE. The FSRA framework is modeled on UK FCA standards, making it the preferred choice for firms with institutional or cross-border focus. Lower profile than VARA but highly respected by institutional counterparties. $8.85M in penalties demonstrates active enforcement.',
    licenses: [
      { name: 'FSP — Dealing in Investments', activities: ['Broker-Dealer', 'OTC Brokerage', 'Exchange / Trading Platform'], capital: 'USD 2M', timeline: '4–8 months' },
      { name: 'FSP — Custody', activities: ['Custody & Safeguarding'], capital: 'USD 4M', timeline: '4–8 months' },
      { name: 'FSP — Advising on Investments', activities: ['Advisory Services'], capital: 'USD 250K', timeline: '3–6 months' },
      { name: 'FSP — Managing Investments', activities: ['Lending & Borrowing'], capital: 'USD 2M', timeline: '4–8 months' },
      { name: 'Fiat-Referenced Token (FRT) Issuer', activities: ['Stablecoin Issuance', 'Stablecoin Management'], capital: 'USD 8M', timeline: '9–12 months' },
    ],
    risks: [
      '$8.85M in penalties already imposed',
      'Enhanced capital requirements effective June 2025 — no phase-in',
      'Common law jurisdiction — requires specialized legal counsel',
    ],
    bestFor: ['Advisory Services', 'Broker-Dealer', 'Lending & Borrowing'],
    worstFor: [],
    activityAdvantages: {
      'Advisory Services': 'Lowest capital entry point in MENA (USD 250K). Ideal for consultancies and fund advisors.',
      'Broker-Dealer': 'Single FSP covers dealing, OTC, and exchange. No need for multiple licenses like VARA.',
      'Lending & Borrowing': 'Managing Investments FSP covers lending under a well-understood framework.',
    },
  },

  cbb: {
    id: 'cbb',
    name: 'CBB (Bahrain)',
    regulator: 'Central Bank of Bahrain',
    flag: '🇧🇭',
    status: 'active',
    stance: 'Sandbox-friendly with the lowest capital thresholds in MENA.',
    stanceDetail: 'Bahrain was the first MENA jurisdiction to regulate crypto-assets (2019). The CBB regulatory sandbox offers a low-barrier entry point (BHD 25K) for testing before full licensing. Ideal for startups and firms that need to prove their model before committing large capital. However, the market is small and cross-border passporting does not exist.',
    licenses: [
      { name: 'Category 1 Crypto-Asset License', activities: ['Exchange / Trading Platform', 'Broker-Dealer'], capital: 'BHD 500K', timeline: '6–9 months' },
      { name: 'Category 2 Crypto-Asset License', activities: ['Custody & Safeguarding', 'Transfer & Settlement'], capital: 'BHD 200K', timeline: '4–6 months' },
      { name: 'Category 3 Crypto-Asset License', activities: ['Advisory Services', 'OTC Brokerage'], capital: 'BHD 50K', timeline: '3–5 months' },
      { name: 'Sandbox License', activities: ['Exchange / Trading Platform', 'Lending & Borrowing', 'Payments / Remittance'], capital: 'BHD 25K', timeline: '2–3 months' },
      { name: 'Payment Token Service License', activities: ['Stablecoin Issuance', 'Stablecoin Management'], capital: 'BHD 1M', timeline: '6–12 months' },
    ],
    risks: [
      'Sandbox exit is not guaranteed — CBB may not grant full license',
      'Small domestic market — limited revenue potential from Bahrain alone',
      'No cross-border passporting — UAE customers need a separate VARA license',
    ],
    bestFor: ['Payments / Remittance', 'OTC Brokerage', 'Transfer & Settlement'],
    worstFor: ['Exchange / Trading Platform'],
    activityAdvantages: {
      'Payments / Remittance': 'BHD 25K sandbox entry — test your payments model before committing. Bahrain is a fintech-friendly jurisdiction.',
      'OTC Brokerage': 'Category 3 license at BHD 50K — lowest barrier for OTC operations in MENA.',
    },
  },

  'rak-dao': {
    id: 'rak-dao',
    name: 'RAK DAO (Ras Al Khaimah)',
    regulator: 'RAK Digital Assets Oasis',
    flag: '🇦🇪',
    status: 'active',
    stance: 'Free zone purpose-built for Web3 and digital asset entities. Low-cost, fast setup.',
    stanceDetail: 'RAK Digital Assets Oasis (RAK DAO) launched in 2023 as the world\'s first free zone dedicated to digital assets and decentralized autonomous organizations. It offers entity registration for DAOs, DeFi projects, and Web3 businesses with minimal capital requirements and fast incorporation (7–14 days). However, RAK DAO is primarily an entity registration framework — it does not issue VASP licenses equivalent to VARA or ADGM. Firms that need regulated financial services permissions (exchange, custody, brokerage) must still obtain licensing from VARA, ADGM, or another regulator. RAK DAO is best used as a holding structure, legal wrapper for DAOs, or operational base for non-custodial activities.',
    licenses: [
      { name: 'DAO LLC Registration', activities: ['Advisory Services'], capital: 'USD 0 (no minimum)', timeline: '7–14 days' },
      { name: 'Foundation Entity', activities: ['Advisory Services'], capital: 'USD 0 (no minimum)', timeline: '7–14 days' },
    ],
    risks: [
      'Not a substitute for VASP licensing — does not authorize exchange, custody, or brokerage',
      'Entity registration only — no regulatory permissions for financial services',
      'Regulatory status may evolve as UAE consolidates oversight',
      'Banking relationships extremely limited for RAK DAO entities',
    ],
    bestFor: ['Advisory Services'],
    worstFor: ['Exchange / Trading Platform', 'Custody & Safeguarding', 'Broker-Dealer', 'Stablecoin Issuance'],
    activityAdvantages: {
      'Advisory Services': 'Fastest and cheapest entity setup in the UAE. Ideal for Web3 advisory, DAO governance, and non-custodial services.',
    },
  },

  // ═══════════════════════════════════════════════
  // EMERGING FRAMEWORKS
  // ═══════════════════════════════════════════════
  'cma-sa': {
    id: 'cma-sa',
    name: 'Saudi Arabia — CMA',
    regulator: 'Capital Market Authority',
    flag: '🇸🇦',
    status: 'emerging',
    stance: 'Draft framework published. No licenses issued yet.',
    stanceDetail: 'The Saudi CMA published a draft Digital Asset regulatory framework in Q2 2026 for public comment. SAMA (Saudi Central Bank) retains authority over payment-related tokens. No licenses have been issued. Saudi Arabia is the largest economy in the GCC and the prize jurisdiction — but the regulatory timeline is unclear. The CMA is deliberate and conservative. Expect 12–24 months before any license is granted. In the interim, operating virtual asset services in Saudi Arabia is effectively unlicensed and carries significant legal risk.',
    licenses: [],
    risks: [
      'No licensing framework in force — operating is unlicensed activity',
      'SAMA and CMA jurisdiction overlap is unresolved for payment tokens',
      'Conservative regulatory culture — expect long timelines',
      'Sharia compliance considerations may add additional requirements',
    ],
    bestFor: [],
    worstFor: ['Exchange / Trading Platform', 'Stablecoin Issuance'],
    whatItWouldTake: 'The CMA must finalize and gazette the Digital Asset framework, establish a licensing portal, and process at least one application. Realistically 12–24 months from the draft stage. Firms should monitor but not commit capital until the final rules are published.',
    redirectTo: ['vara', 'adgm'],
  },

  qfcra: {
    id: 'qfcra',
    name: 'Qatar — QFCRA',
    regulator: 'Qatar Financial Centre Regulatory Authority',
    flag: '🇶🇦',
    status: 'emerging',
    stance: 'QFC has introduced limited digital asset provisions. No standalone crypto license.',
    stanceDetail: 'The Qatar Financial Centre (QFC) has introduced custody and safeguarding standards for digital assets effective July 2026. However, there is no standalone virtual asset service provider license. The QFC framework allows regulated financial institutions within the QFC to handle digital assets as part of their existing permissions. Qatar Central Bank (QCB) maintains a cautious stance on cryptocurrency trading for the broader market. Retail crypto trading remains effectively banned outside the QFC.',
    licenses: [],
    risks: [
      'No standalone VASP license available',
      'QCB hostile to retail crypto — exchange operations not viable',
      'Limited to QFC-registered entities with existing financial permissions',
      'Small market with limited institutional adoption',
    ],
    bestFor: [],
    worstFor: ['Exchange / Trading Platform', 'Payments / Remittance'],
    whatItWouldTake: 'QFCRA would need to establish a dedicated digital asset licensing category. Current provisions only cover custody within existing financial institutions. A standalone framework is at least 18–24 months away, if pursued at all.',
    redirectTo: ['adgm', 'vara'],
  },

  'cma-om': {
    id: 'cma-om',
    name: 'Oman — CMSA',
    regulator: 'Capital Markets and Securities Authority (CMSA)',
    flag: '🇴🇲',
    status: 'emerging',
    stance: 'VASP framework under the CMSA with sandbox operational. First licenses expected 2026.',
    stanceDetail: 'Oman\'s Capital Markets and Securities Authority (CMSA, formerly CMA) issued the Virtual Assets Regulatory Framework in 2024, modeled on VARA and FATF standards. The CMSA has launched a regulatory sandbox and is accepting applications from VASPs. Oman is positioning itself as a lower-cost, GCC-compliant alternative to the UAE — particularly attractive for firms priced out of VARA\'s capital requirements. The Central Bank of Oman (CBO) retains jurisdiction over payment-related tokens and stablecoin activity. Oman\'s Muscat Stock Exchange has also signaled interest in tokenized securities. Full VASP licensing is expected in 2026 once sandbox participants graduate.',
    licenses: [],
    risks: [
      'Framework still in development — final rules and capital thresholds not yet gazetted',
      'No full VASP licenses issued yet — only sandbox admissions',
      'Small domestic market with limited banking infrastructure for VA businesses',
      'CBO jurisdiction over payment tokens creates dual-regulatory risk',
      'Regulatory capacity is still being built — expect slower processing times',
    ],
    bestFor: [],
    worstFor: ['Stablecoin Issuance'],
    whatItWouldTake: 'CMSA must finalize the VASP rulebook, publish capital requirements, and begin processing full license applications. Sandbox participants will have an advantage. Estimated 6–12 months to first full licenses. Oman is a credible option for patient firms — but not for those needing to operate immediately.',
    redirectTo: ['vara', 'cbb'],
  },

  // ═══════════════════════════════════════════════
  // NO FRAMEWORK — HOSTILE OR ABSENT
  // ═══════════════════════════════════════════════
  'cma-kw': {
    id: 'cma-kw',
    name: 'Kuwait — CBK / CMA',
    regulator: 'Central Bank of Kuwait / Capital Markets Authority',
    flag: '🇰🇼',
    status: 'hostile',
    stance: 'Crypto trading effectively banned. No licensing path exists.',
    stanceDetail: 'The Central Bank of Kuwait (CBK) has issued multiple circulars warning against cryptocurrency trading and prohibiting banks from facilitating crypto transactions. The CMA has no virtual asset licensing framework. Kuwait is one of the most restrictive jurisdictions in the GCC for digital assets. There is no sandbox, no draft framework, and no public indication that this will change in the near term. Operating a virtual asset business from Kuwait targeting Kuwaiti residents carries significant legal risk including potential criminal prosecution.',
    licenses: [],
    risks: [
      'CBK has explicitly banned banks from facilitating crypto transactions',
      'No licensing framework — any VA activity is unlicensed',
      'Banks will not open accounts for crypto-related businesses',
      'Potential criminal liability for operating without authorization',
    ],
    bestFor: [],
    worstFor: ['Exchange / Trading Platform', 'Broker-Dealer', 'Custody & Safeguarding', 'Payments / Remittance'],
    whatItWouldTake: 'A complete reversal of CBK policy, new primary legislation, and establishment of a licensing authority. This would require direct intervention from the Council of Ministers. Realistically 3–5+ years, if it happens at all.',
    redirectTo: ['vara', 'adgm', 'cbb'],
  },

  'cbe-eg': {
    id: 'cbe-eg',
    name: 'Egypt — CBE',
    regulator: 'Central Bank of Egypt',
    flag: '🇪🇬',
    status: 'hostile',
    stance: 'Central Bank prohibits crypto. Would require governor-level intervention to change.',
    stanceDetail: 'The Central Bank of Egypt (CBE) and the Financial Regulatory Authority (FRA) have jointly prohibited the issuance, trading, or promotion of cryptocurrencies. Egypt\'s banking law (2020) explicitly bans creating, promoting, or operating platforms for issuing or trading crypto without CBE approval — and no such approval has ever been granted. The CBE views crypto as a threat to monetary policy and the Egyptian pound. Given Egypt\'s macroeconomic challenges (currency devaluation, capital controls), there is zero appetite at the central bank to enable capital outflows via crypto. Changing this would require a directive from the CBE governor, legislative amendment, and FRA cooperation — a heavy lift with no political champion.',
    licenses: [],
    risks: [
      'Criminal penalties for operating crypto platforms — imprisonment possible',
      'Banking law explicitly criminalizes unauthorized crypto activity',
      'No draft framework, no consultation, no public timeline',
      'Macroeconomic instability makes regulatory liberalization unlikely',
      'Capital controls mean CBE will resist any channel for capital flight',
    ],
    bestFor: [],
    worstFor: ['Exchange / Trading Platform', 'Broker-Dealer', 'Stablecoin Issuance', 'Payments / Remittance'],
    whatItWouldTake: 'Amendment to the 2020 Banking Law, a CBE governor directive, FRA regulatory framework, and FATF-compliant AML infrastructure. This is a multi-year legislative process requiring political will that does not currently exist. Egyptian firms should incorporate and obtain licensing in the UAE or Bahrain to serve the MENA market.',
    redirectTo: ['vara', 'cbb', 'adgm'],
  },

  'bam-ma': {
    id: 'bam-ma',
    name: 'Morocco — Bank Al-Maghrib',
    regulator: 'Bank Al-Maghrib',
    flag: '🇲🇦',
    status: 'hostile',
    stance: 'Banned in 2017. Draft framework under study — no timeline.',
    stanceDetail: 'Bank Al-Maghrib (BAM) banned cryptocurrencies in 2017, declaring them a violation of foreign exchange regulations. In 2022, BAM announced it was "studying" a regulatory framework but no draft has been published. Morocco\'s AMMC (financial markets regulator) has also warned against crypto investments. Meanwhile, Morocco has one of the highest per-capita crypto adoption rates in Africa, driven by remittance demand and informal P2P trading. The disconnect between regulatory stance and market reality is significant. BAM is exploring a CBDC (e-Dirham) which may further delay any private stablecoin or crypto framework.',
    licenses: [],
    risks: [
      'Cryptocurrency explicitly banned since 2017',
      'Foreign exchange violation charges possible for operators',
      'No draft framework despite 2022 announcement',
      'CBDC exploration may crowd out private sector frameworks',
      'AMMC (financial markets authority) also hostile',
    ],
    bestFor: [],
    worstFor: ['Exchange / Trading Platform', 'Stablecoin Issuance', 'Payments / Remittance'],
    whatItWouldTake: 'BAM must lift the 2017 ban, publish a licensing framework, and establish AML/CFT infrastructure for VASPs. The CBDC project may accelerate or delay this — unclear. Moroccan entrepreneurs should seek licensing in Bahrain (lowest capital requirements, sandbox available) or ADGM for advisory activities.',
    redirectTo: ['cbb', 'adgm'],
  },

  'cbj-jo': {
    id: 'cbj-jo',
    name: 'Jordan — CBJ',
    regulator: 'Central Bank of Jordan',
    flag: '🇯🇴',
    status: 'hostile',
    stance: 'CBJ prohibits banks from dealing in crypto. No framework planned.',
    stanceDetail: 'The Central Bank of Jordan (CBJ) issued a circular in 2014 warning against cryptocurrencies, and in 2018 explicitly prohibited banks, payment companies, and financial institutions from dealing in Bitcoin and other virtual currencies. The Jordan Securities Commission (JSC) has echoed these warnings. Jordan has no draft framework, no sandbox, and no public plans to regulate digital assets. The regulatory focus is on CBDC exploration and modernizing traditional payment infrastructure. Jordanian firms in the digital asset space typically incorporate in the UAE.',
    licenses: [],
    risks: [
      'Banks prohibited from dealing in virtual currencies since 2018',
      'No licensing framework or regulatory sandbox',
      'Small domestic market with limited institutional interest',
      'No political champion for crypto regulation',
    ],
    bestFor: [],
    worstFor: ['Exchange / Trading Platform', 'Broker-Dealer', 'Payments / Remittance'],
    whatItWouldTake: 'CBJ policy reversal, JSC framework development, and AML/CFT infrastructure. Jordan follows cautious monetary policy — unlikely to move before Saudi Arabia establishes a framework. Estimated 3+ years.',
    redirectTo: ['vara', 'adgm'],
  },

  'bct-tn': {
    id: 'bct-tn',
    name: 'Tunisia — BCT',
    regulator: 'Banque Centrale de Tunisie',
    flag: '🇹🇳',
    status: 'none',
    stance: 'No explicit ban, but no framework. Gray zone.',
    stanceDetail: 'Tunisia occupies a regulatory gray zone. The BCT has not explicitly banned cryptocurrencies but has warned against them and does not recognize them as legal tender or financial instruments. There is no licensing framework for VASPs. Tunisia\'s fintech sector is growing but focused on mobile payments and traditional financial inclusion. Strict capital controls and foreign exchange regulations make crypto operations practically impossible without central bank cooperation. Tunisia was an early CBDC explorer (e-Dinar pilot in 2019) but progress has stalled.',
    licenses: [],
    risks: [
      'No legal framework — operating in a regulatory gray zone',
      'Strict capital controls limit crypto on/off ramps',
      'BCT has warned against crypto without explicitly banning it',
      'Small domestic market with limited infrastructure',
    ],
    bestFor: [],
    worstFor: ['Exchange / Trading Platform', 'Stablecoin Issuance'],
    whatItWouldTake: 'BCT regulatory framework, foreign exchange regulation amendments, and AML/CFT infrastructure. Tunisia\'s political instability adds uncertainty. Tunisian founders should seek licensing in Bahrain (sandbox) or ADGM.',
    redirectTo: ['cbb', 'adgm'],
  },

  'bdl-lb': {
    id: 'bdl-lb',
    name: 'Lebanon — BDL',
    regulator: 'Banque du Liban',
    flag: '🇱🇧',
    status: 'none',
    stance: 'Financial system in crisis. No capacity for crypto regulation.',
    stanceDetail: 'Lebanon\'s banking system has been in crisis since 2019. Banque du Liban (BDL) issued a circular in 2013 warning against virtual currencies but the regulatory landscape has not evolved since. The country is dealing with sovereign default, currency collapse, and banking sector insolvency. There is no capacity — financial, institutional, or political — to develop a virtual asset regulatory framework. Ironically, crypto adoption in Lebanon has surged as citizens seek alternatives to the failing banking system. Lebanese entrepreneurs in the digital asset space operate exclusively from offshore jurisdictions (primarily UAE and Bahrain).',
    licenses: [],
    risks: [
      'Financial system in systemic crisis since 2019',
      'No regulatory capacity to develop or enforce a framework',
      'Banking sector effectively non-functional for business operations',
      'Extreme political instability',
    ],
    bestFor: [],
    worstFor: ['Exchange / Trading Platform', 'Custody & Safeguarding', 'Stablecoin Issuance'],
    whatItWouldTake: 'Full banking sector reform, sovereign debt restructuring, new central bank governance, and political stability. This is a multi-year, multi-institutional process. Lebanese operators must use offshore structures.',
    redirectTo: ['vara', 'cbb'],
  },

  'cbi-iq': {
    id: 'cbi-iq',
    name: 'Iraq — CBI',
    regulator: 'Central Bank of Iraq',
    flag: '🇮🇶',
    status: 'hostile',
    stance: 'CBI banned crypto dealing in 2017. Actively enforced.',
    stanceDetail: 'The Central Bank of Iraq banned dealing in cryptocurrencies in 2017 and actively enforces this prohibition. Iraqi banks and money exchange companies are prohibited from handling crypto transactions. Iraq\'s AML/CFT infrastructure is focused on traditional money laundering and terrorism financing risks, with no capacity for virtual asset supervision. The country faces ongoing security and governance challenges that make regulatory modernization extremely unlikely in the near term.',
    licenses: [],
    risks: [
      'Explicit ban actively enforced by CBI',
      'Banks prohibited from facilitating crypto transactions',
      'AML/CFT infrastructure not equipped for VA supervision',
      'Ongoing security and governance challenges',
    ],
    bestFor: [],
    worstFor: ['Exchange / Trading Platform', 'Broker-Dealer', 'Payments / Remittance'],
    whatItWouldTake: 'CBI policy reversal, new primary legislation, AML/CFT capacity building, and political stability. Realistically 5+ years. Iraqi entrepreneurs should incorporate in the UAE.',
    redirectTo: ['vara', 'adgm'],
  },

  'cbl-ly': {
    id: 'cbl-ly',
    name: 'Libya — CBL',
    regulator: 'Central Bank of Libya',
    flag: '🇱🇾',
    status: 'none',
    stance: 'No framework. Dual government and institutional instability.',
    stanceDetail: 'Libya has no virtual asset regulatory framework. The country has faced political division with competing governments and central banks. The CBL has not addressed cryptocurrency regulation. Libya\'s financial infrastructure is focused on basic banking stability and reunification. There is no prospect of digital asset regulation in the foreseeable future.',
    licenses: [],
    risks: [
      'No regulatory framework of any kind for digital assets',
      'Political instability and institutional fragmentation',
      'No banking infrastructure for VA businesses',
    ],
    bestFor: [],
    worstFor: ['Exchange / Trading Platform', 'Broker-Dealer', 'Custody & Safeguarding'],
    whatItWouldTake: 'Political reunification, institutional rebuilding, banking reform, and regulatory capacity building. Not viable for the foreseeable future.',
    redirectTo: ['vara', 'cbb'],
  },
}

/**
 * Given the user's activities, find the best jurisdiction from those with active frameworks.
 * Weighs: activity match → capital efficiency → timeline → activity-specific advantages.
 */
export function findBestJurisdiction(
  activities: string[],
  excludeId?: string,
): { jurisdictionId: string; profile: JurisdictionProfile; bestLicense: JurisdictionLicense; matchScore: number; reason: string }[] {
  const activeJurisdictions = Object.values(JURISDICTION_PROFILES).filter(
    (j) => j.status === 'active' && j.id !== excludeId
  )

  type ScoredResult = { jurisdictionId: string; profile: JurisdictionProfile; bestLicense: JurisdictionLicense; matchScore: number; reason: string }

  const raw = activeJurisdictions.map((j): ScoredResult | null => {
    const matchedLicenses = j.licenses
      .map((lic) => ({
        ...lic,
        matchScore: lic.activities.filter((a) => activities.includes(a)).length,
        matchedActivities: lic.activities.filter((a) => activities.includes(a)),
      }))
      .filter((lic) => lic.matchScore > 0)
      .sort((a, b) => b.matchScore - a.matchScore)

    const bestLicense = matchedLicenses[0]
    if (!bestLicense) return null

    // Score: activity match (x3) + bestFor bonus (x2) + advantage bonus
    let score = bestLicense.matchScore * 3
    const isBestFor = activities.some((a) => j.bestFor.includes(a))
    if (isBestFor) score += 2
    const hasAdvantage = activities.some((a) => j.activityAdvantages?.[a])
    if (hasAdvantage) score += 1

    // Penalty for worstFor
    const isWorstFor = activities.some((a) => j.worstFor.includes(a))
    if (isWorstFor) score -= 1

    const advantageActivity = activities.find((a) => j.activityAdvantages?.[a])
    const reason = advantageActivity
      ? j.activityAdvantages![advantageActivity]!
      : isBestFor
        ? `Strong fit for ${activities.filter((a) => j.bestFor.includes(a)).join(', ')}`
        : `Covers ${bestLicense.matchedActivities.join(', ')}`

    return {
      jurisdictionId: j.id,
      profile: j,
      bestLicense,
      matchScore: score,
      reason,
    }
  })

  const scored = raw.filter((x): x is ScoredResult => x !== null)
  return scored.sort((a, b) => b.matchScore - a.matchScore)
}
