import { NextRequest, NextResponse } from 'next/server'
import { redis } from '@/lib/redis'
import { type RegulatoryUpdate } from '@/lib/regulatory-sources'

const REG_UPDATES_KEY = 'reg:updates'

export async function GET(request: NextRequest) {
  const url = new URL(request.url)
  const jurisdictions = url.searchParams.get('jurisdictions')?.split(',').map(j => j.trim().toUpperCase()) ?? []
  const limit = parseInt(url.searchParams.get('limit') ?? '50', 10)
  const severity = url.searchParams.get('severity')

  let updates = await redis.get<RegulatoryUpdate[]>(REG_UPDATES_KEY)

  if (!updates) {
    return NextResponse.json({
      updates: [],
      total: 0,
      seeded: false,
      note: 'No regulatory updates crawled yet. POST to /api/cron/crawl to trigger a crawl.',
    })
  }

  if (jurisdictions.length > 0) {
    updates = updates.filter(u => jurisdictions.includes(u.jurisdictionCode.toUpperCase()))
  }

  if (severity) {
    updates = updates.filter(u => u.severity === severity)
  }

  updates.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())

  const total = updates.length
  updates = updates.slice(0, limit)

  const stats = {
    total,
    critical: updates.filter(u => u.severity === 'critical').length,
    high: updates.filter(u => u.severity === 'high').length,
    undispatched: updates.filter(u => !u.dispatched).length,
    jurisdictions: [...new Set(updates.map(u => u.jurisdictionCode))],
  }

  return NextResponse.json({ updates, stats, seeded: true })
}
