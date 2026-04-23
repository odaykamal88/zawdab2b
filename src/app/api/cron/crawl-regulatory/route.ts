/**
 * Cron crawl route — fetches from all 14 MENA regulatory sources.
 *
 * Schedule: twice daily at 06:00 and 18:00 UTC (vercel.json).
 * GET is called by Vercel Crons; POST is a manual trigger (requires CRON_SECRET).
 *
 * Pipeline:
 *   1. Load existing updates from Redis (for deduplication)
 *   2. Run crawlAllSources() — RSS-first, HTML fallback per feed
 *   3. Merge new updates, cap total at 500 (drop oldest), save back to Redis
 *   4. Return a JSON summary: { crawledAt, totalNew, critical, high, sources }
 */

import { NextResponse } from 'next/server'
import { redis } from '@/lib/redis'
import { type RegulatoryUpdate } from '@/lib/regulatory-sources'
import { crawlAllSources } from '@/lib/crawlers'

const REG_UPDATES_KEY = 'reg:updates'
const MAX_STORED_UPDATES = 500

function requireCronAuth(request: Request): NextResponse | null {
  const cronSecret = process.env.CRON_SECRET
  if (!cronSecret) {
    return NextResponse.json({ error: 'CRON_SECRET is not configured' }, { status: 503 })
  }
  if (request.headers.get('authorization') !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  return null
}

async function runCrawl(): Promise<NextResponse> {
  const existing = (await redis.get<RegulatoryUpdate[]>(REG_UPDATES_KEY)) ?? []

  const result = await crawlAllSources(existing)

  if (result.newUpdates.length > 0) {
    const merged = [...result.newUpdates, ...existing]
    // Keep newest updates; trim to cap to avoid unbounded growth
    const trimmed = merged.slice(0, MAX_STORED_UPDATES)
    await redis.set(REG_UPDATES_KEY, trimmed)
  }

  return NextResponse.json({
    crawledAt: result.crawledAt,
    totalNew: result.totalNew,
    critical: result.critical,
    high: result.high,
    sources: result.sources,
  })
}

export async function GET(request: Request) {
  const authError = requireCronAuth(request)
  if (authError) return authError
  return runCrawl()
}

export async function POST(request: Request) {
  const authError = requireCronAuth(request)
  if (authError) return authError
  return runCrawl()
}
