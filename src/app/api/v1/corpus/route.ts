import { NextRequest, NextResponse } from 'next/server'
import { JURISDICTIONS, LICENCE_TYPES, corpusCoverage, queryCorpus } from '@/lib/corpus'
import type { ItemType, Jurisdiction } from '@/lib/corpus'

export const dynamic = 'force-dynamic'

// Proprietary corpus — gated behind an API key (the moat is server-side).
function gate(req: NextRequest): 'ok' | 'unconfigured' | 'unauthorized' {
  const key = process.env.ZAWDA_API_KEY
  if (!key) return 'unconfigured'
  return req.headers.get('x-api-key') === key ? 'ok' : 'unauthorized'
}

export async function GET(req: NextRequest) {
  const g = gate(req)
  if (g === 'unconfigured') return NextResponse.json({ error: 'API key not configured (set ZAWDA_API_KEY)' }, { status: 503 })
  if (g === 'unauthorized') return NextResponse.json({ error: 'Unauthorized — provide a valid x-api-key header' }, { status: 401 })

  const sp = req.nextUrl.searchParams

  if (sp.get('view') === 'taxonomy') {
    return NextResponse.json({ version: 'v1', jurisdictions: JURISDICTIONS, licenceTypes: LICENCE_TYPES })
  }

  const items = queryCorpus({
    jurisdiction: (sp.get('jurisdiction') as Jurisdiction | null) ?? undefined,
    type: (sp.get('type') as ItemType | null) ?? undefined,
    licenceType: sp.get('licenceType') ?? undefined,
    since: sp.get('since') ?? undefined,
  })

  return NextResponse.json({
    version: 'v1',
    query: Object.fromEntries(sp),
    count: items.length,
    coverage: corpusCoverage(),
    disclaimer: 'Items marked verification="needs-verification" are seeded from internal data and must be confirmed against the primary source before enterprise use.',
    items,
  })
}
