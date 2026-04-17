import { NextResponse } from 'next/server'
import { redis } from '@/lib/redis'
import { type RegulatoryUpdate } from '@/lib/regulatory-sources'

const REG_UPDATES_KEY = 'reg:updates'

const seedUpdates: RegulatoryUpdate[] = [
  {
    id: 'seed-001',
    sourceId: 'vara',
    jurisdiction: 'Dubai (VARA)',
    jurisdictionCode: 'VARA',
    regulator: 'Virtual Assets Regulatory Authority',
    type: 'enforcement',
    severity: 'critical',
    title: 'Cease & desist issued to unlicensed broker-dealer',
    summary: 'Operating virtual asset broker-dealer services without a valid VASP license. All operations to cease within 15 days.',
    entity: 'AlphaChain FZE',
    fineAmount: 'AED 600,000',
    url: 'https://www.vara.ae/en/enforcement-actions',
    date: '2026-04-08',
    dispatched: false,
  },
  {
    id: 'seed-002',
    sourceId: 'adgm',
    jurisdiction: 'Abu Dhabi (ADGM)',
    jurisdictionCode: 'ADGM',
    regulator: 'Financial Services Regulatory Authority',
    type: 'enforcement',
    severity: 'high',
    title: 'Public censure for failure to segregate client assets',
    summary: 'Failure to segregate client assets per FSMR Rule 3.11.2. Firm must engage independent auditor within 30 days.',
    entity: 'Gulf Digital Markets Ltd',
    fineAmount: '$1,250,000',
    url: 'https://www.adgm.com/media/announcements',
    date: '2026-04-05',
    dispatched: false,
  },
  {
    id: 'seed-003',
    sourceId: 'vara',
    jurisdiction: 'Dubai (VARA)',
    jurisdictionCode: 'VARA',
    regulator: 'Virtual Assets Regulatory Authority',
    type: 'enforcement',
    severity: 'high',
    title: 'Financial penalty for inadequate AML/CFT monitoring',
    summary: 'Inadequate AML/CFT transaction monitoring and delayed SAR filing. Firm must appoint independent compliance monitor.',
    entity: 'DuneEx Trading',
    fineAmount: 'AED 450,000',
    url: 'https://www.vara.ae/en/enforcement-actions',
    date: '2026-04-02',
    dispatched: false,
  },
  {
    id: 'seed-004',
    sourceId: 'cbb',
    jurisdiction: 'Bahrain (CBB)',
    jurisdictionCode: 'CBB',
    regulator: 'Central Bank of Bahrain',
    type: 'enforcement',
    severity: 'medium',
    title: 'License restriction for Travel Rule non-compliance',
    summary: 'Non-compliance with Travel Rule requirements. No IVMS 101 solution implemented. License restricted pending remediation.',
    entity: 'Bahrain Crypto Exchange',
    fineAmount: 'BHD 75,000',
    url: 'https://www.cbb.gov.bh/regulations/',
    date: '2026-03-28',
    dispatched: false,
  },
  {
    id: 'seed-005',
    sourceId: 'vara',
    jurisdiction: 'Dubai (VARA)',
    jurisdictionCode: 'VARA',
    regulator: 'Virtual Assets Regulatory Authority',
    type: 'regulation',
    severity: 'critical',
    title: 'Stablecoin issuance framework — dual approval required',
    summary: 'VARA has formalized stablecoin issuance under a dedicated license category. AED 50M minimum capital. AED-pegged stablecoins require CBUAE approval. Algorithmic stablecoins prohibited.',
    url: 'https://www.vara.ae/en/regulations',
    date: '2026-04-01',
    dispatched: false,
  },
  {
    id: 'seed-006',
    sourceId: 'adgm',
    jurisdiction: 'Abu Dhabi (ADGM)',
    jurisdictionCode: 'ADGM',
    regulator: 'Financial Services Regulatory Authority',
    type: 'regulation',
    severity: 'high',
    title: 'Fiat-Referenced Token (FRT) framework published',
    summary: 'Final rules for FRT issuers: USD 8M minimum capital, HQLA reserve requirements, real-time reserve monitoring. Existing operators must apply within 6 months.',
    url: 'https://www.adgm.com/setting-up/digital-assets',
    date: '2026-03-25',
    dispatched: false,
  },
  {
    id: 'seed-007',
    sourceId: 'cbuae',
    jurisdiction: 'UAE (CBUAE)',
    jurisdictionCode: 'CBUAE',
    regulator: 'Central Bank of the UAE',
    type: 'regulation',
    severity: 'high',
    title: 'Payment token regulation — onshore backing required',
    summary: 'All AED-denominated payment tokens must maintain reserves exclusively in UAE-based banks. Foreign reserve backing no longer sufficient. 90-day compliance window.',
    url: 'https://www.centralbank.ae/en/regulations',
    date: '2026-03-20',
    dispatched: false,
  },
  {
    id: 'seed-008',
    sourceId: 'cma-sa',
    jurisdiction: 'Saudi Arabia (CMA)',
    jurisdictionCode: 'CMA-SA',
    regulator: 'Capital Market Authority',
    type: 'consultation',
    severity: 'medium',
    title: 'Saudi digital asset framework — draft published for comment',
    summary: 'Draft regulatory framework for digital assets published. Comments open until Q3 2026. Signals Saudi Arabia moving toward formal VASP licensing.',
    url: 'https://cma.org.sa/en/Pages/default.aspx',
    date: '2026-03-15',
    dispatched: false,
  },
  {
    id: 'seed-009',
    sourceId: 'qfcra',
    jurisdiction: 'Qatar (QFC)',
    jurisdictionCode: 'QFCRA',
    regulator: 'Qatar Financial Centre Regulatory Authority',
    type: 'regulation',
    severity: 'medium',
    title: 'Custody standards for digital assets introduced',
    summary: 'New custody and safeguarding standards for digital asset service providers within the QFC. Must appoint qualified custodian or obtain custody license.',
    url: 'https://www.qfc.qa/en/Pages/default.aspx',
    date: '2026-03-10',
    dispatched: false,
  },
  {
    id: 'seed-010',
    sourceId: 'vara',
    jurisdiction: 'Dubai (VARA)',
    jurisdictionCode: 'VARA',
    regulator: 'Virtual Assets Regulatory Authority',
    type: 'deadline',
    severity: 'critical',
    title: 'Travel Rule enforcement begins — March 2026',
    summary: 'FATF Travel Rule enforcement begins. VASPs without IVMS 101 solution face license suspension. No further extensions expected.',
    deadlineDate: 'March 31, 2026',
    url: 'https://www.vara.ae/en/regulations',
    date: '2026-03-01',
    dispatched: false,
  },
  {
    id: 'seed-011',
    sourceId: 'adgm',
    jurisdiction: 'Abu Dhabi (ADGM)',
    jurisdictionCode: 'ADGM',
    regulator: 'Financial Services Regulatory Authority',
    type: 'guidance',
    severity: 'low',
    title: 'Updated guidance on virtual asset custody arrangements',
    summary: 'FSRA published updated guidance on custody arrangements including multi-signature requirements, insurance minimums, and cold storage ratios.',
    url: 'https://www.adgm.com/setting-up/digital-assets',
    date: '2026-02-28',
    dispatched: true,
  },
  {
    id: 'seed-012',
    sourceId: 'cbb',
    jurisdiction: 'Bahrain (CBB)',
    jurisdictionCode: 'CBB',
    regulator: 'Central Bank of Bahrain',
    type: 'guidance',
    severity: 'low',
    title: 'Cross-border virtual asset services guidance update',
    summary: 'Updated guidance on cross-border services. Entities licensed in Bahrain serving other GCC states must obtain separate authorization. Passporting not available.',
    url: 'https://www.cbb.gov.bh/regulations/',
    date: '2026-02-15',
    dispatched: true,
  },
]

export async function POST(request: Request) {
  const authHeader = request.headers.get('authorization')
  const cronSecret = process.env.CRON_SECRET
  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const existing = await redis.get<RegulatoryUpdate[]>(REG_UPDATES_KEY)
  if (existing && existing.length > 0) {
    return NextResponse.json({ status: 'already_seeded', count: existing.length })
  }

  await redis.set(REG_UPDATES_KEY, seedUpdates)

  return NextResponse.json({ status: 'seeded', count: seedUpdates.length })
}

export async function GET() {
  const updates = await redis.get<RegulatoryUpdate[]>(REG_UPDATES_KEY)
  if (updates && updates.length > 0) {
    return NextResponse.json({ seeded: true, count: updates.length })
  }
  return NextResponse.json({ seeded: false, count: 0, note: 'POST to this endpoint to seed demo data' })
}
