/**
 * Cron dispatch route.
 *
 * IMPORTANT: Vercel Crons invoke GET — all dispatch logic lives here.
 * POST remains available as a manual trigger (requires CRON_SECRET auth).
 *
 * SLA §3.1: critical alerts must be delivered within 4 hours.
 * Cron schedule: every 3 hours (0 *\/3 * * * in vercel.json) — satisfies the 4-hour window.
 *
 * Fixes vs. original:
 * 1. GET now runs dispatch (not just status).
 * 2. Only truly sent updates are marked dispatched — failed sends are retried next run.
 * 3. dispatchedAt is recorded on each RegulatoryUpdate for SLA audit.
 * 4. alert.sla_breach is written to the audit log when critical updates exceed 4 hours undelivered.
 */

import { NextResponse } from 'next/server'
import { redis } from '@/lib/redis'
import {
  type RegulatoryUpdate,
  REGULATORY_SOURCES,
} from '@/lib/regulatory-sources'
import {
  type BotSubscriber,
  shouldDispatchNow,
  formatTelegramAlert,
  formatWeeklyDigest,
  sendTelegramMessage,
} from '@/lib/bot-service'
import { writeAuditLog } from '@/lib/audit-log'

const REG_UPDATES_KEY = 'reg:updates'
const BOT_SUBSCRIBERS_KEY = 'bot:subscribers'
const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN ?? ''

/** SLA §3.1: critical alerts must be dispatched within this many hours */
const CRITICAL_SLA_HOURS = 4

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

async function runDispatch(): Promise<NextResponse> {
  const [updates, subscribers] = await Promise.all([
    redis.get<RegulatoryUpdate[]>(REG_UPDATES_KEY).then((d) => d ?? []),
    redis.get<BotSubscriber[]>(BOT_SUBSCRIBERS_KEY).then((d) => d ?? []),
  ])

  if (!BOT_TOKEN || subscribers.length === 0) {
    return NextResponse.json({ status: 'skipped', reason: 'No bot token or no subscribers' })
  }

  const undispatched = updates.filter((u) => !u.dispatched)
  const now = new Date().toISOString()
  let dispatched = 0

  // Log SLA breaches before attempting dispatch
  for (const update of undispatched) {
    if (update.severity === 'critical') {
      const publishedAt = update.publishedAt ?? update.date
      const hoursElapsed = (Date.now() - new Date(publishedAt).getTime()) / 3_600_000
      if (hoursElapsed > CRITICAL_SLA_HOURS) {
        void writeAuditLog({
          eventType: 'alert.sla_breach',
          userId: 'system',
          resourceType: 'regulatory_update',
          resourceId: update.id,
          ip: 'internal',
          userAgent: 'cron',
          status: 'error',
          details: {
            title: update.title,
            jurisdictionCode: update.jurisdictionCode,
            publishedAt,
            hoursElapsed: hoursElapsed.toFixed(2),
            slaSla: CRITICAL_SLA_HOURS,
          },
        }).catch(() => undefined)
      }
    }
  }

  // Track which updates were successfully sent to at least one subscriber
  const sentUpdateIds = new Set<string>()

  for (const subscriber of subscribers) {
    const relevant = undispatched.filter((u) =>
      subscriber.jurisdictions.some(
        (j) => j.toUpperCase() === u.jurisdictionCode.toUpperCase(),
      ),
    )

    for (const update of relevant) {
      if (shouldDispatchNow(update, subscriber)) {
        const message = formatTelegramAlert(update)
        const sent = await sendTelegramMessage(subscriber.chatId, message, BOT_TOKEN)
        if (sent) {
          subscriber.weeklyCount += 1
          subscriber.lastNotifiedAt = now
          sentUpdateIds.add(update.id)
          dispatched++

          void writeAuditLog({
            eventType: 'alert.dispatched',
            userId: subscriber.id,
            resourceType: 'regulatory_update',
            resourceId: update.id,
            ip: 'internal',
            userAgent: 'cron',
            status: 'success',
            details: {
              channel: subscriber.channel,
              chatId: subscriber.chatId,
              severity: update.severity,
              jurisdictionCode: update.jurisdictionCode,
            },
          }).catch(() => undefined)
        }
      }
    }
  }

  // Only mark updates that were actually dispatched — failed sends will be retried next run
  for (const update of undispatched) {
    if (sentUpdateIds.has(update.id)) {
      update.dispatched = true
      update.dispatchedAt = now
    }
  }

  await Promise.all([
    redis.set(REG_UPDATES_KEY, updates),
    redis.set(BOT_SUBSCRIBERS_KEY, subscribers),
  ])

  return NextResponse.json({
    status: 'ok',
    processed: undispatched.length,
    dispatched,
    subscribers: subscribers.length,
  })
}

/**
 * GET — called by Vercel Crons (every 3 hours) and by ?action= queries.
 */
export async function GET(request: Request) {
  const authError = requireCronAuth(request)
  if (authError) return authError

  const url = new URL(request.url)
  const action = url.searchParams.get('action')

  // Weekly digest: GET ?action=digest
  if (action === 'digest') {
    const [updates, subscribers] = await Promise.all([
      redis.get<RegulatoryUpdate[]>(REG_UPDATES_KEY).then((d) => d ?? []),
      redis.get<BotSubscriber[]>(BOT_SUBSCRIBERS_KEY).then((d) => d ?? []),
    ])

    if (!BOT_TOKEN) {
      return NextResponse.json({ error: 'No bot token' }, { status: 500 })
    }

    const weekAgo = new Date()
    weekAgo.setDate(weekAgo.getDate() - 7)
    const recentUpdates = updates.filter((u) => new Date(u.date) >= weekAgo)

    let sent = 0
    for (const sub of subscribers) {
      if (sub.frequency === 'critical-only') continue

      const relevant = recentUpdates.filter((u) =>
        sub.jurisdictions.some(
          (j) => j.toUpperCase() === u.jurisdictionCode.toUpperCase(),
        ),
      )

      const digest = formatWeeklyDigest(relevant, sub.jurisdictions)
      const ok = await sendTelegramMessage(sub.chatId, digest, BOT_TOKEN)
      if (ok) sent++
    }

    return NextResponse.json({ status: 'ok', digestsSent: sent })
  }

  // Status query: GET ?action=status
  if (action === 'status') {
    const [updates, subscribers] = await Promise.all([
      redis.get<RegulatoryUpdate[]>(REG_UPDATES_KEY).then((d) => d ?? []),
      redis.get<BotSubscriber[]>(BOT_SUBSCRIBERS_KEY).then((d) => d ?? []),
    ])

    return NextResponse.json({
      status: 'ok',
      sources: REGULATORY_SOURCES.length,
      totalUpdates: updates.length,
      undispatched: updates.filter((u) => !u.dispatched).length,
      subscribers: subscribers.length,
      note: 'Cron runs every 3 hours (GET). POST for manual dispatch. GET ?action=digest for weekly digest.',
    })
  }

  // Default: run dispatch (this is what the Vercel cron calls)
  return runDispatch()
}

/**
 * POST — manual dispatch trigger (requires CRON_SECRET).
 * Useful for testing and backfill without waiting for the cron.
 */
export async function POST(request: Request) {
  const authError = requireCronAuth(request)
  if (authError) return authError

  return runDispatch()
}
