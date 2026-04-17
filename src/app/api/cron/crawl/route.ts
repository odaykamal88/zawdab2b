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

const REG_UPDATES_KEY = 'reg:updates'
const BOT_SUBSCRIBERS_KEY = 'bot:subscribers'
const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN ?? ''

export async function POST(request: Request) {
  const authHeader = request.headers.get('authorization')
  const cronSecret = process.env.CRON_SECRET
  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const [updates, subscribers] = await Promise.all([
    redis.get<RegulatoryUpdate[]>(REG_UPDATES_KEY).then((d) => d ?? []),
    redis.get<BotSubscriber[]>(BOT_SUBSCRIBERS_KEY).then((d) => d ?? []),
  ])

  if (!BOT_TOKEN || subscribers.length === 0) {
    return NextResponse.json({ status: 'skipped', reason: 'No bot token or no subscribers' })
  }

  const undispatched = updates.filter(u => !u.dispatched)
  let dispatched = 0

  for (const subscriber of subscribers) {
    const relevant = undispatched.filter(u =>
      subscriber.jurisdictions.some(j => j.toUpperCase() === u.jurisdictionCode.toUpperCase())
    )

    for (const update of relevant) {
      if (shouldDispatchNow(update, subscriber)) {
        const message = formatTelegramAlert(update)
        const sent = await sendTelegramMessage(subscriber.chatId, message, BOT_TOKEN)
        if (sent) {
          subscriber.weeklyCount += 1
          subscriber.lastNotifiedAt = new Date().toISOString()
          dispatched++
        }
      }
    }
  }

  for (const u of undispatched) {
    u.dispatched = true
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

export async function GET(request: Request) {
  const url = new URL(request.url)
  const action = url.searchParams.get('action')

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
    const recentUpdates = updates.filter(u => new Date(u.date) >= weekAgo)

    let sent = 0
    for (const sub of subscribers) {
      if (sub.frequency === 'critical-only') continue

      const relevant = recentUpdates.filter(u =>
        sub.jurisdictions.some(j => j.toUpperCase() === u.jurisdictionCode.toUpperCase())
      )

      const digest = formatWeeklyDigest(relevant, sub.jurisdictions)
      const ok = await sendTelegramMessage(sub.chatId, digest, BOT_TOKEN)
      if (ok) sent++
    }

    return NextResponse.json({ status: 'ok', digestsSent: sent })
  }

  const [updates, subscribers] = await Promise.all([
    redis.get<RegulatoryUpdate[]>(REG_UPDATES_KEY).then((d) => d ?? []),
    redis.get<BotSubscriber[]>(BOT_SUBSCRIBERS_KEY).then((d) => d ?? []),
  ])

  return NextResponse.json({
    status: 'ok',
    sources: REGULATORY_SOURCES.length,
    totalUpdates: updates.length,
    undispatched: updates.filter(u => !u.dispatched).length,
    subscribers: subscribers.length,
    note: 'POST to trigger crawl dispatch. GET ?action=digest to send weekly digest.',
  })
}
