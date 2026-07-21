import { NextRequest, NextResponse } from 'next/server'
import { Ratelimit } from '@upstash/ratelimit'
import { redis } from '@/lib/redis'
import { extractRequestMeta } from '@/lib/audit-log'
import { listJurisdictionsWithProvenance, PROVENANCE_META } from '@/lib/provenance'

const ratelimit = new Ratelimit({ redis, limiter: Ratelimit.slidingWindow(60, '1 m') })

/** GET /api/v1/jurisdictions — list every jurisdiction profile with provenance. */
export async function GET(req: NextRequest) {
  const { ip } = extractRequestMeta(req)
  const { success } = await ratelimit.limit(`v1-jurisdictions:${ip}`)
  if (!success) return NextResponse.json({ error: 'Too many requests' }, { status: 429 })

  const jurisdictions = listJurisdictionsWithProvenance()
  return NextResponse.json({
    apiVersion: 'v1',
    generatedAt: new Date().toISOString(),
    attribution: PROVENANCE_META,
    count: jurisdictions.length,
    jurisdictions,
  })
}
