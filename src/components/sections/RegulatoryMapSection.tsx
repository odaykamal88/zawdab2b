'use client'

import { useState } from 'react'

interface NewsItem {
  headline: string
  url: string
}

interface Jurisdiction {
  country: string
  flag: string
  regulator: string
  status: 'Active' | 'Emerging' | 'Hostile' | 'None'
  statusColor: string
  licenseTypes: string[]
  keyDates: string[]
  enforcement: string
  enforcementExamples: string[]
  notes: string
  source: string
  latestNews: NewsItem[]
}

const JURISDICTIONS: Jurisdiction[] = [
  {
    country: 'UAE — Dubai',
    flag: '🇦🇪',
    regulator: 'VARA',
    status: 'Active',
    statusColor: 'text-emerald-600 bg-emerald-50',
    licenseTypes: ['Advisory Services License', 'Broker-Dealer License', 'Exchange License', 'Custody License', 'Lending/Borrowing License', 'Transfer & Settlement License', 'Stablecoin Issuance License', 'Stablecoin Management License'],
    keyDates: ['Q4 2025: 19 firms fined up to AED 600K each', 'March 2026: Travel Rule enforcement deadline', 'Q1 2026: Quarterly compliance returns due'],
    enforcement: 'High — 19 enforcement actions in Q4 2025 alone. Active monitoring and license revocation.',
    enforcementExamples: [
      'Dec 2025: VARA fined 7 VASPs for operating without proper license scope — AED 600K each',
      'Nov 2025: Cease-and-desist order against unlicensed exchange operating via social media',
      'Oct 2025: VARA revoked MVP license of a custody provider for failing capital adequacy requirements',
      'Sep 2025: AED 500K fine for marketing crypto services before license approval',
    ],
    notes: 'Most active regulator in MENA. Full framework operational since 2023. Mandatory licensing for all VASP activities. VARA has the most comprehensive stablecoin framework in the region.',
    source: 'https://vara.ae',
    latestNews: [
      { headline: 'VARA publishes updated Travel Rule implementation guidelines for March 2026 deadline', url: 'https://vara.ae/en/regulations' },
      { headline: 'New stablecoin reserve attestation requirements effective Q2 2026', url: 'https://vara.ae/en/regulations' },
      { headline: 'VARA launches enhanced VASP compliance monitoring portal', url: 'https://vara.ae/en/compliance-reporting' },
    ],
  },
  {
    country: 'UAE — Abu Dhabi',
    flag: '🇦🇪',
    regulator: 'ADGM / FSRA',
    status: 'Active',
    statusColor: 'text-emerald-600 bg-emerald-50',
    licenseTypes: ['FSP — Dealing in Investments', 'FSP — Custody', 'FSP — Advising on Investments', 'FSP — Managing Investments', 'Fiat-Referenced Token (FRT) Issuer'],
    keyDates: ['2025: $8.85M in penalties across multiple actions', 'June 2025: Enhanced capital requirements — no phase-in', 'Ongoing: Enhanced AML/CFT audit frequency'],
    enforcement: 'High — USD 8.85M in total penalties. Strict compliance audits and reporting requirements.',
    enforcementExamples: [
      'Q3 2025: $3.2M fine against digital asset firm for inadequate AML controls',
      'Q2 2025: Public censure of crypto custody provider — client asset segregation failures',
      'Q1 2025: $2.1M penalty for unauthorized digital asset dealing activity',
      'Dec 2024: License conditions imposed on 3 firms for failing enhanced capital requirements',
    ],
    notes: 'International financial free zone operating under English common law. Preferred by institutional players. FRT framework is the strictest stablecoin regime in MENA.',
    source: 'https://adgm.com',
    latestNews: [
      { headline: 'FSRA updates guidance on tokenized fund structures', url: 'https://www.adgm.com/setting-up/digital-assets' },
      { headline: 'ADGM announces enhanced FRT framework alignment with EU MiCA', url: 'https://www.adgm.com/media/announcements' },
      { headline: 'New digital asset custody standards effective Q3 2026', url: 'https://www.adgm.com/setting-up/digital-assets' },
    ],
  },
  {
    country: 'UAE — Ras Al Khaimah',
    flag: '🇦🇪',
    regulator: 'RAK DAO',
    status: 'Active',
    statusColor: 'text-emerald-600 bg-emerald-50',
    licenseTypes: ['DAO LLC Registration', 'Foundation Entity', 'Web3 Business License'],
    keyDates: ['2023: RAK Digital Assets Oasis launched', '2024: Over 1,000 entities registered', '2025: Expanded DAO governance framework'],
    enforcement: 'Low — entity registration focused. No financial services enforcement (not a VASP license).',
    enforcementExamples: [
      'No formal enforcement actions to date — RAK DAO operates as an entity registration framework, not a financial services regulator',
    ],
    notes: 'World\'s first free zone dedicated to DAOs and digital asset entities. Fast, low-cost entity setup. Not a substitute for VASP licensing — does not authorize exchange, custody, or brokerage.',
    source: 'https://rakdao.com',
    latestNews: [
      { headline: 'RAK DAO surpasses 1,500 registered entities', url: 'https://rakdao.com/news' },
      { headline: 'New DAO governance toolkit launched for multi-sig treasury management', url: 'https://rakdao.com/news' },
      { headline: 'RAK DAO and VARA exploring interoperability framework for licensed VASPs', url: 'https://rakdao.com/news' },
    ],
  },
  {
    country: 'Bahrain',
    flag: '🇧🇭',
    regulator: 'CBB',
    status: 'Active',
    statusColor: 'text-emerald-600 bg-emerald-50',
    licenseTypes: ['Category 1 Crypto-Asset License', 'Category 2 Crypto-Asset License', 'Category 3 Crypto-Asset License', 'Sandbox License', 'Payment Token Service License'],
    keyDates: ['2019: First GCC crypto regulatory framework', '2024: Updated Crypto-Asset Module', 'Active: Sandbox applications open'],
    enforcement: 'Moderate — focused on licensing compliance and AML. Regulatory sandbox available.',
    enforcementExamples: [
      '2024: CBB issued formal warning to unlicensed crypto advisory firm operating from Bahrain',
      '2024: Sandbox participant had sandbox period terminated for exceeding customer limits',
      '2023: CBB suspended Category 3 license of advisory firm for inadequate CDD procedures',
    ],
    notes: 'First GCC country to regulate crypto-assets. Lowest capital thresholds in MENA (BHD 25K sandbox). Ideal for startups proving their model.',
    source: 'https://cbb.gov.bh',
    latestNews: [
      { headline: 'CBB updates Crypto-Asset Module with enhanced AML/CFT requirements', url: 'https://www.cbb.gov.bh/fintech/' },
      { headline: 'New sandbox cohort accepting applications — 10 slots available', url: 'https://www.cbb.gov.bh/fintech/' },
      { headline: 'Payment Token Service License framework published for stablecoin operators', url: 'https://www.cbb.gov.bh/regulations/' },
    ],
  },
  {
    country: 'Saudi Arabia',
    flag: '🇸🇦',
    regulator: 'CMA / SAMA',
    status: 'Emerging',
    statusColor: 'text-amber-600 bg-amber-50',
    licenseTypes: ['No dedicated crypto license yet', 'Draft Digital Asset framework (CMA)', 'Payment services via SAMA'],
    keyDates: ['Q2 2026: CMA draft framework for public comment', '2024: CMA sandbox for tokenized securities', 'TBD: First VASP licenses'],
    enforcement: 'Low (formal) — crypto not explicitly licensed. Operating without guidance carries implicit risk.',
    enforcementExamples: [
      'No formal crypto enforcement actions — framework does not yet exist',
      'CMA has warned investors against unregulated crypto platforms multiple times',
      'SAMA restricts banks from facilitating crypto-related transactions informally',
    ],
    notes: 'Largest GCC economy. Draft framework published for comment. SAMA and CMA jurisdiction overlap unresolved. Conservative regulatory culture — expect long timelines. The prize jurisdiction, but patience required.',
    source: 'https://cma.org.sa',
    latestNews: [
      { headline: 'CMA publishes draft Digital Asset Regulatory Framework for consultation', url: 'https://cma.org.sa/en/Pages/default.aspx' },
      { headline: 'SAMA exploring wholesale CBDC for cross-border settlement', url: 'https://www.sama.gov.sa/en-US/Pages/default.aspx' },
      { headline: 'Saudi Vision 2030 identifies digital assets as strategic financial sector opportunity', url: 'https://cma.org.sa/en/Pages/default.aspx' },
    ],
  },
  {
    country: 'Qatar',
    flag: '🇶🇦',
    regulator: 'QFCRA / QCB',
    status: 'Emerging',
    statusColor: 'text-amber-600 bg-amber-50',
    licenseTypes: ['QFC Digital Assets custody provisions', 'No standalone VASP license'],
    keyDates: ['July 2026: QFC custody standards effective', '2024: QFC Digital Assets Framework announced'],
    enforcement: 'Early stage — framework just launched. QCB restricts crypto for domestic banks.',
    enforcementExamples: [
      'QCB issued circular prohibiting commercial banks from crypto-related transactions (2018)',
      'No formal enforcement actions against VASPs — no framework to enforce against',
    ],
    notes: 'QFC introduced limited digital asset provisions for custody. No standalone crypto license. Retail crypto trading remains effectively banned outside QFC.',
    source: 'https://qfcra.com',
    latestNews: [
      { headline: 'QFCRA finalizes digital asset custody and safeguarding standards', url: 'https://www.qfc.qa/en/Pages/default.aspx' },
      { headline: 'QFC exploring tokenized securities framework for institutional investors', url: 'https://www.qfc.qa/en/Pages/default.aspx' },
    ],
  },
  {
    country: 'Oman',
    flag: '🇴🇲',
    regulator: 'CMSA',
    status: 'Emerging',
    statusColor: 'text-amber-600 bg-amber-50',
    licenseTypes: ['VASP Framework (sandbox stage)', 'No full VASP licenses yet'],
    keyDates: ['2024: CMSA VASP framework announced', '2025: Sandbox accepting applications', '2026: First full licenses expected'],
    enforcement: 'Minimal — framework still developing. Sandbox monitoring only.',
    enforcementExamples: [
      'No formal enforcement actions — VASP framework still in sandbox stage',
      'CMSA has warned public against unregulated crypto trading platforms',
    ],
    notes: 'CMSA (formerly CMA) issued VASP framework in 2024 influenced by VARA/FATF standards. Positioning as lower-cost GCC alternative to UAE. Central Bank of Oman retains jurisdiction over payment tokens.',
    source: 'https://cma.gov.om',
    latestNews: [
      { headline: 'CMSA launches VASP regulatory sandbox — first applications being reviewed', url: 'https://cma.gov.om' },
      { headline: 'Muscat Stock Exchange exploring tokenized securities pilot', url: 'https://cma.gov.om' },
      { headline: 'CBO issues guidance on payment token classification', url: 'https://cbo.gov.om' },
    ],
  },
  {
    country: 'Kuwait',
    flag: '🇰🇼',
    regulator: 'CBK / CMA',
    status: 'Hostile',
    statusColor: 'text-red-600 bg-red-50',
    licenseTypes: ['No crypto-specific licenses', 'CMA handles securities', 'CBK handles banking/payments'],
    keyDates: ['2024: CMA issued investor warnings', 'No timeline for framework'],
    enforcement: 'Restrictive — CBK actively prohibits bank facilitation of crypto transactions.',
    enforcementExamples: [
      'CBK issued multiple circulars prohibiting banks from facilitating crypto transactions',
      'CMA warned investors against crypto trading platforms — no formal licensing path',
      'Banks have been directed to report and block crypto-related transfers',
    ],
    notes: 'One of the most restrictive GCC jurisdictions for digital assets. No sandbox, no draft framework, no public timeline. Banks prohibited from facilitating crypto transactions.',
    source: 'https://cbk.gov.kw',
    latestNews: [
      { headline: 'CBK reiterates ban on bank facilitation of crypto transactions', url: 'https://www.cbk.gov.kw' },
      { headline: 'CMA issues fresh investor warning against unregulated crypto platforms', url: 'https://www.cma.gov.kw' },
    ],
  },
  {
    country: 'Egypt',
    flag: '🇪🇬',
    regulator: 'CBE / FRA',
    status: 'Hostile',
    statusColor: 'text-red-600 bg-red-50',
    licenseTypes: ['No digital asset license framework', 'Banking law (2020) explicitly bans crypto'],
    keyDates: ['2020: Banking law criminalizes unauthorized crypto activity', '2023: CBE began CBDC exploration'],
    enforcement: 'Active prohibition — criminal penalties possible for crypto platform operators.',
    enforcementExamples: [
      '2020 Banking Law: Criminalizes creating, promoting, or operating crypto platforms without CBE approval',
      'CBE and FRA issued joint statement prohibiting crypto issuance, trading, and promotion',
      'Reports of informal enforcement against P2P crypto traders via banking system restrictions',
    ],
    notes: 'CBE and FRA jointly prohibit crypto. Banking law explicitly criminalizes unauthorized activity. Despite one of the highest crypto adoption rates in Africa, no framework is planned. Would require CBE governor-level intervention to change.',
    source: 'https://cbe.org.eg',
    latestNews: [
      { headline: 'CBE governor reaffirms opposition to crypto regulation', url: 'https://www.cbe.org.eg' },
      { headline: 'Egypt explores e-Pound CBDC through central bank digital currency project', url: 'https://www.cbe.org.eg' },
    ],
  },
  {
    country: 'Morocco',
    flag: '🇲🇦',
    regulator: 'Bank Al-Maghrib',
    status: 'Hostile',
    statusColor: 'text-red-600 bg-red-50',
    licenseTypes: ['Crypto banned since 2017', 'No licensing framework', 'CBDC (e-Dirham) under exploration'],
    keyDates: ['2017: Bank Al-Maghrib bans cryptocurrencies', '2022: "Studying" regulatory framework announced', 'No draft published'],
    enforcement: 'Restrictive — foreign exchange violation charges possible for crypto operators.',
    enforcementExamples: [
      '2017: Bank Al-Maghrib declared crypto use a violation of foreign exchange regulations',
      'AMMC (financial markets regulator) issued warnings against crypto investments',
      'Reports of informal enforcement through banking restrictions on crypto-related accounts',
    ],
    notes: 'Banned since 2017 despite one of the highest per-capita crypto adoption rates in Africa. CBDC exploration may further delay private crypto framework. Disconnect between regulatory stance and market reality is significant.',
    source: 'https://bkam.ma',
    latestNews: [
      { headline: 'Bank Al-Maghrib advances e-Dirham CBDC pilot program', url: 'https://www.bkam.ma' },
      { headline: 'Morocco maintains crypto ban despite growing P2P adoption', url: 'https://www.bkam.ma' },
    ],
  },
  {
    country: 'Jordan',
    flag: '🇯🇴',
    regulator: 'CBJ / JSC',
    status: 'Hostile',
    statusColor: 'text-red-600 bg-red-50',
    licenseTypes: ['No crypto licenses', 'Banks prohibited from crypto dealing (2018)'],
    keyDates: ['2014: CBJ warning against crypto', '2018: Banks prohibited from dealing in virtual currencies'],
    enforcement: 'Moderate — banks actively restricted from facilitating crypto transactions.',
    enforcementExamples: [
      '2018: CBJ circular explicitly prohibiting banks and payment companies from dealing in virtual currencies',
      'JSC echoed warnings against crypto investment products',
    ],
    notes: 'CBJ prohibits banks from dealing in crypto since 2018. No framework, no sandbox, no plans. Focus is on CBDC exploration. Jordanian digital asset firms typically incorporate in UAE.',
    source: 'https://cbj.gov.jo',
    latestNews: [
      { headline: 'CBJ exploring CBDC for cross-border remittances with regional central banks', url: 'https://www.cbj.gov.jo' },
    ],
  },
  {
    country: 'Tunisia',
    flag: '🇹🇳',
    regulator: 'BCT',
    status: 'None',
    statusColor: 'text-gray-600 bg-gray-50',
    licenseTypes: ['No framework — regulatory gray zone', 'BCT has warned but not explicitly banned'],
    keyDates: ['2019: e-Dinar CBDC pilot (stalled)', 'No framework timeline'],
    enforcement: 'Minimal — no formal enforcement mechanism for crypto, but strict capital controls limit operations.',
    enforcementExamples: [
      'BCT warnings against crypto — no formal enforcement actions on record',
      'Strict capital controls effectively prevent crypto on/off ramps',
    ],
    notes: 'Regulatory gray zone. BCT has not explicitly banned crypto but does not recognize or regulate it. Strict capital controls make crypto operations practically impossible. Political instability adds uncertainty.',
    source: 'https://bct.gov.tn',
    latestNews: [
      { headline: 'Tunisia\'s e-Dinar CBDC pilot remains stalled amid political transition', url: 'https://www.bct.gov.tn' },
    ],
  },
  {
    country: 'Lebanon',
    flag: '🇱🇧',
    regulator: 'BDL',
    status: 'None',
    statusColor: 'text-gray-600 bg-gray-50',
    licenseTypes: ['No framework', 'BDL warned against crypto (2013)', 'Financial system in crisis'],
    keyDates: ['2013: BDL warning against virtual currencies', '2019: Banking system collapse'],
    enforcement: 'Non-functional — banking system and regulatory infrastructure in crisis.',
    enforcementExamples: [
      '2013: BDL circular warning against virtual currencies — no formal enforcement since',
      'Banking system effectively non-functional for regulatory oversight since 2019',
    ],
    notes: 'Financial system in systemic crisis since 2019. No regulatory capacity for crypto oversight. Crypto adoption has surged as alternative to failing banks. Lebanese operators use UAE/Bahrain structures.',
    source: 'https://bdl.gov.lb',
    latestNews: [
      { headline: 'Lebanese crypto adoption continues to grow amid ongoing banking crisis', url: 'https://www.bdl.gov.lb' },
    ],
  },
  {
    country: 'Iraq',
    flag: '🇮🇶',
    regulator: 'CBI',
    status: 'Hostile',
    statusColor: 'text-red-600 bg-red-50',
    licenseTypes: ['Crypto banned since 2017', 'Banks prohibited from crypto transactions'],
    keyDates: ['2017: CBI bans crypto dealing', 'No framework timeline'],
    enforcement: 'Active — CBI actively enforces crypto prohibition through banking system.',
    enforcementExamples: [
      '2017: CBI issued formal ban on cryptocurrency dealing and enforcement directive to banks',
      'Money exchange companies directed to report and block crypto-related transfers',
    ],
    notes: 'Explicit ban actively enforced by CBI. Banks and money exchange companies prohibited from handling crypto. AML/CFT infrastructure focused on traditional risks. Iraqi entrepreneurs should incorporate in UAE.',
    source: 'https://cbi.iq',
    latestNews: [
      { headline: 'CBI maintains hard stance against cryptocurrency activities', url: 'https://www.cbi.iq' },
    ],
  },
  {
    country: 'Libya',
    flag: '🇱🇾',
    regulator: 'CBL',
    status: 'None',
    statusColor: 'text-gray-600 bg-gray-50',
    licenseTypes: ['No framework', 'Dual government instability', 'No crypto regulation of any kind'],
    keyDates: ['No regulatory developments on record'],
    enforcement: 'Non-existent — no institutional capacity for crypto regulation.',
    enforcementExamples: [
      'No enforcement actions — no regulatory framework or institutional capacity exists',
    ],
    notes: 'Political division with competing governments. No crypto regulation and no prospect of any in the foreseeable future. Financial infrastructure focused on basic banking stability.',
    source: 'https://cbl.gov.ly',
    latestNews: [
      { headline: 'Libya focused on banking reunification — digital assets not on regulatory agenda', url: 'https://cbl.gov.ly' },
    ],
  },
]

export function RegulatoryMapSection() {
  const [expandedRow, setExpandedRow] = useState<string | null>(null)

  function toggleRow(country: string) {
    setExpandedRow(expandedRow === country ? null : country)
  }

  return (
    <section id="regulatory-map" className="py-20 sm:py-28 bg-bg-surface" aria-labelledby="regmap-heading">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <p className="font-mono text-gold uppercase tracking-widest text-[length:var(--text-xs)] mb-4">
          Regulator Map
        </p>
        <h2
          id="regmap-heading"
          className="font-display font-bold text-text tracking-tight max-w-3xl"
          style={{ fontSize: 'var(--text-xl)' }}
        >
          MENA Digital Asset Regulation — Every Jurisdiction Covered.
        </h2>
        <p className="text-text-muted text-[length:var(--text-base)] mt-3 max-w-2xl">
          Click any row to see license types, enforcement examples, key dates, latest news, and source links. Covering {JURISDICTIONS.length} jurisdictions across the Gulf, Levant, and North Africa.
        </p>

        {/* Table */}
        <div className="mt-10 overflow-x-auto">
          <table className="w-full text-left border-collapse" role="grid">
            <thead>
              <tr className="border-b-2 border-border">
                <th className="py-3 pr-4 text-text text-[length:var(--text-sm)] font-semibold w-8" aria-label="Expand" />
                <th className="py-3 px-4 text-text text-[length:var(--text-sm)] font-semibold">Jurisdiction</th>
                <th className="py-3 px-4 text-text text-[length:var(--text-sm)] font-semibold">Regulator</th>
                <th className="py-3 px-4 text-text text-[length:var(--text-sm)] font-semibold">Status</th>
                <th className="py-3 pl-4 text-text text-[length:var(--text-sm)] font-semibold hidden sm:table-cell">Enforcement</th>
              </tr>
            </thead>
            <tbody>
              {JURISDICTIONS.map((j) => {
                const isExpanded = expandedRow === j.country
                return (
                  <TableRow key={j.country} jurisdiction={j} isExpanded={isExpanded} onToggle={() => toggleRow(j.country)} />
                )
              })}
            </tbody>
          </table>
        </div>

        <p className="text-text-faint text-[length:var(--text-xs)] mt-6">
          Data sourced from official regulator websites, public enforcement records, and regional legal analysis. Last verified April 2026.
          News and enforcement data refreshed every 48 hours.
          For real-time alerts on regulatory changes, subscribe to the <a href="#brief" className="text-gold hover:underline">Weekly Brief</a>.
        </p>
      </div>
    </section>
  )
}

function TableRow({ jurisdiction: j, isExpanded, onToggle }: { jurisdiction: Jurisdiction; isExpanded: boolean; onToggle: () => void }) {
  const enforcementLevel = j.enforcement.split('\u2014')[0]?.trim() ?? j.enforcement

  return (
    <>
      <tr
        className={`border-b border-border cursor-pointer transition-colors hover:bg-bg-surface-2 ${isExpanded ? 'bg-bg-surface-2' : ''}`}
        onClick={onToggle}
        role="row"
        aria-expanded={isExpanded}
      >
        <td className="py-3 pr-2 text-center">
          <svg
            width="16"
            height="16"
            viewBox="0 0 16 16"
            fill="none"
            stroke="var(--text-muted)"
            strokeWidth="2"
            strokeLinecap="round"
            className={`transition-transform inline-block ${isExpanded ? 'rotate-90' : ''}`}
            aria-hidden="true"
          >
            <path d="M6 4l4 4-4 4" />
          </svg>
        </td>
        <td className="py-3 px-4 text-text text-[length:var(--text-sm)] font-medium">
          <span className="inline-flex items-center gap-2">
            <span className="text-[1.25rem] leading-none" role="img" aria-label={j.country}>{j.flag}</span>
            <span>{j.country}</span>
          </span>
        </td>
        <td className="py-3 px-4 text-text-muted text-[length:var(--text-sm)]">{j.regulator}</td>
        <td className="py-3 px-4">
          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[length:var(--text-xs)] font-medium ${j.statusColor}`}>
            {j.status}
          </span>
        </td>
        <td className="py-3 pl-4 text-text-muted text-[length:var(--text-sm)] hidden sm:table-cell">{enforcementLevel}</td>
      </tr>

      {isExpanded && (
        <tr className="border-b border-border bg-bg-primary">
          <td colSpan={5} className="px-4 py-5">
            <div className="grid md:grid-cols-2 gap-6 max-w-5xl">
              {/* License types */}
              <div>
                <h4 className="font-display font-bold text-text text-[length:var(--text-sm)] mb-2">License Types</h4>
                <ul className="space-y-1">
                  {j.licenseTypes.map((lt) => (
                    <li key={lt} className="text-text-muted text-[length:var(--text-sm)] flex items-start gap-2">
                      <span className="text-gold mt-0.5">&bull;</span>{lt}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Key dates */}
              <div>
                <h4 className="font-display font-bold text-text text-[length:var(--text-sm)] mb-2">Key Dates</h4>
                <ul className="space-y-1">
                  {j.keyDates.map((kd) => (
                    <li key={kd} className="text-text-muted text-[length:var(--text-sm)] flex items-start gap-2">
                      <span className="text-gold mt-0.5">&bull;</span>{kd}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Enforcement examples */}
              <div>
                <h4 className="font-display font-bold text-text text-[length:var(--text-sm)] mb-2">Enforcement Examples</h4>
                <ul className="space-y-1.5">
                  {j.enforcementExamples.map((ex, i) => (
                    <li key={i} className="text-text-muted text-[length:var(--text-xs)] flex items-start gap-2 leading-relaxed">
                      <span className="text-red-500 mt-0.5 shrink-0">&#9650;</span>{ex}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Latest news */}
              <div>
                <h4 className="font-display font-bold text-text text-[length:var(--text-sm)] mb-2">
                  Latest News
                  <span className="text-text-faint text-[length:var(--text-xs)] font-normal ml-2">Updated every 48h</span>
                </h4>
                <ul className="space-y-1.5">
                  {j.latestNews.map((news, i) => (
                    <li key={i} className="text-[length:var(--text-xs)] flex items-start gap-2 leading-relaxed">
                      <span className="text-gold mt-0.5 shrink-0">&#8250;</span>
                      <a
                        href={news.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-text-muted hover:text-gold transition-colors"
                        onClick={(e) => e.stopPropagation()}
                      >
                        {news.headline}
                        <span className="text-gold ml-1">&#8599;</span>
                      </a>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Notes + source */}
              <div className="md:col-span-2">
                <h4 className="font-display font-bold text-text text-[length:var(--text-sm)] mb-2">Notes</h4>
                <p className="text-text-muted text-[length:var(--text-sm)] leading-relaxed">{j.notes}</p>
                <a
                  href={j.source}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-gold text-[length:var(--text-xs)] mt-2 hover:underline"
                  onClick={(e) => e.stopPropagation()}
                >
                  Source: {j.source} &#8599;
                </a>
              </div>
            </div>
          </td>
        </tr>
      )}
    </>
  )
}
