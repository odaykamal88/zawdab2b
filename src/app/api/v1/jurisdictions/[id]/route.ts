import { NextRequest, NextResponse } from 'next/server'
import { Ratelimit } from '@upstash/ratelimit'
import { redis } from '@/lib/redis'
import { extractRequestMeta } from '@/lib/audit-log'
import { getJurisdictionWithProvenance, PROVENANCE_META } from '@/lib/provenance'

const ratelimit = new Ratelimit({ redis, limiter: Ratelimit.slidingWindow(60, '1 m') })

/** GET /api/v1/jurisdictions/[id] — one jurisdiction profile with provenance. */
export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { ip } = extractRequestMeta(req)
  const { success } = await ratelimit.limit(`v1-jurisdiction:${ip}`)
  if (!success) return NextResponse.json({ error: 'Too many requests' }, { status: 429 })

  const { id } = await params
  const jurisdiction = getJurisdictionWithProvenance(id)
  if (!jurisdiction) return NextResponse.json({ error: 'Jurisdiction not found' }, { status: 404 })

  return NextResponse.json({
    apiVersion: 'v1',
    generatedAt: new Date().toISOString(),
    attribution: PROVENANCE_META,
    jurisdiction,
  })
}
