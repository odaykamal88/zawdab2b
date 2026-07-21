import { NextRequest, NextResponse } from 'next/server'
import { Ratelimit } from '@upstash/ratelimit'
import { redis } from '@/lib/redis'
import { findBestJurisdiction } from '@/lib/jurisdiction-intelligence'

const ratelimit = new Ratelimit({ redis, limiter: Ratelimit.slidingWindow(30, '1 m') })

/**
 * POST /api/v1/assess — the proprietary recommendation engine.
 *
 * Gated behind an API key (Defense Principle 1: the scoring engine is never
 * exposed to unauthenticated callers). Body: { activities: string[], excludeId?: string }.
 */
export async function POST(req: NextRequest) {
  const expected = process.env.ZAWDA_API_KEY
  if (!expected) return NextResponse.json({ error: 'API key not configured' }, { status: 503 })

  const key = req.headers.get('x-api-key')
  if (!key || key !== expected) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { success } = await ratelimit.limit(`v1-assess:${key.slice(0, 8)}`)
  if (!success) return NextResponse.json({ error: 'Too many requests' }, { status: 429 })

  let body: unknown
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
  }

  const raw = (body as { activities?: unknown; excludeId?: unknown }) ?? {}
  const activities = Array.isArray(raw.activities) ? raw.activities.filter((a): a is string => typeof a === 'string') : []
  if (activities.length === 0) {
    return NextResponse.json({ error: 'Body must include a non-empty activities: string[]' }, { status: 400 })
  }
  const excludeId = typeof raw.excludeId === 'string' ? raw.excludeId : undefined

  const results = findBestJurisdiction(activities, excludeId)
  return NextResponse.json({
    apiVersion: 'v1',
    generatedAt: new Date().toISOString(),
    input: { activities, excludeId },
    count: results.length,
    results,
  })
}
