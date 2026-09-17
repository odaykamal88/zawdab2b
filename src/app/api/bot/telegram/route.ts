import { NextRequest, NextResponse } from 'next/server'
import { redis } from '@/lib/redis'
import {
  type BotSubscriber,
  type AlertLevel,
  formatWelcomeMessage,
  formatStatusMessage,
  formatWeeklyDigest,
  formatJurisdictionPrompt,
  formatAlertLevelPrompt,
  formatAlertLevelMessage,
  ALERT_LEVEL_ICON,
  ALERT_LEVEL_LABEL,
  sendTelegramMessage,
} from '@/lib/bot-service'
import { ALL_JURISDICTION_CODES, type RegulatoryUpdate } from '@/lib/regulatory-sources'

const BOT_SUBSCRIBERS_KEY = 'bot:subscribers'
const SUBSCRIBERS_KEY = 'subscribers'
const REG_UPDATES_KEY = 'reg:updates'
const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN ?? ''
const TELEGRAM_WEBHOOK_SECRET = process.env.TELEGRAM_WEBHOOK_SECRET ?? ''

async function getSubscribers(): Promise<BotSubscriber[]> {
  return (await redis.get<BotSubscriber[]>(BOT_SUBSCRIBERS_KEY)) ?? []
}

async function saveSubscribers(subs: BotSubscriber[]): Promise<void> {
  await redis.set(BOT_SUBSCRIBERS_KEY, subs)
}

export async function POST(request: NextRequest) {
  if (!BOT_TOKEN) {
    return NextResponse.json({ error: 'Telegram bot is not configured' }, { status: 503 })
  }
  if (!TELEGRAM_WEBHOOK_SECRET) {
    return NextResponse.json({ error: 'Telegram webhook secret is not configured' }, { status: 503 })
  }
  if (request.headers.get('x-telegram-bot-api-secret-token') !== TELEGRAM_WEBHOOK_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const body = await request.json()
    const message = body.message

    if (!message?.text || !message?.chat?.id) {
      return NextResponse.json({ ok: true })
    }

    const chatId = String(message.chat.id)
    const text = message.text.trim()
    const subscribers = await getSubscribers()
    const existing = subscribers.find(s => s.chatId === chatId)

    // ── /start ────────────────────────────────────────────────────────────────
    if (text === '/start' || text.startsWith('/start ')) {
      if (existing && !existing.onboardingStep) {
        await reply(chatId, 'You\'re already subscribed! Use /status to see your settings or /stop to unsubscribe.')
        return NextResponse.json({ ok: true })
      }

      // Begin onboarding wizard
      const newSub: BotSubscriber = {
        id: `tg_${chatId}`,
        channel: 'telegram',
        chatId,
        jurisdictions: [],
        frequency: 'weekly',
        minSeverity: 'high',
        weeklyCount: 0,
        weekNumber: getWeekNumber(),
        createdAt: existing?.createdAt ?? new Date().toISOString(),
        onboardingStep: 'jurisdictions',
      }

      // Replace or add
      const idx = subscribers.findIndex(s => s.chatId === chatId)
      if (idx >= 0) subscribers[idx] = newSub
      else subscribers.push(newSub)

      await saveSubscribers(subscribers)
      await reply(chatId, formatJurisdictionPrompt())
      return NextResponse.json({ ok: true })
    }

    // ── No subscriber yet ─────────────────────────────────────────────────────
    if (!existing) {
      await reply(chatId, 'Welcome to Zawda! Send /start to subscribe to MENA regulatory alerts.')
      return NextResponse.json({ ok: true })
    }

    // ── Onboarding: step 1 — jurisdiction selection ───────────────────────────
    if (existing.onboardingStep === 'jurisdictions') {
      const input = text.trim().toUpperCase()

      let chosen: string[]
      if (input === 'ALL') {
        chosen = ALL_JURISDICTION_CODES
      } else {
        const codes = input.split(/[\s,]+/).filter(Boolean)
        chosen = codes.filter((c: string) => ALL_JURISDICTION_CODES.includes(c))
      }

      if (chosen.length === 0) {
        await reply(chatId, [
          'No valid jurisdiction codes found.',
          '',
          `Available: ${ALL_JURISDICTION_CODES.join(', ')}`,
          '',
          'Or reply `ALL` to track everything.',
        ].join('\n'))
        return NextResponse.json({ ok: true })
      }

      existing.jurisdictions = chosen
      existing.onboardingStep = 'alertLevel'
      await saveSubscribers(subscribers)
      await reply(chatId, formatAlertLevelPrompt())
      return NextResponse.json({ ok: true })
    }

    // ── Onboarding: step 2 — alert level selection ────────────────────────────
    if (existing.onboardingStep === 'alertLevel') {
      const levelMap: Record<string, AlertLevel> = {
        red: 'critical', orange: 'high', yellow: 'medium',
        critical: 'critical', high: 'high', medium: 'medium',
      }
      const key = text.replace(/^\//, '').toLowerCase()
      const level = levelMap[key]

      if (!level) {
        await reply(chatId, 'Please reply with `red`, `orange`, or `yellow` to choose your alert level.')
        return NextResponse.json({ ok: true })
      }

      existing.minSeverity = level
      existing.onboardingStep = undefined
      await saveSubscribers(subscribers)

      await reply(chatId, [
        `${ALERT_LEVEL_ICON[level]} Alert level set to *${ALERT_LEVEL_LABEL[level]}*`,
        '',
        formatWelcomeMessage(existing.jurisdictions, level),
      ].join('\n'))
      return NextResponse.json({ ok: true })
    }

    // ── /status / /settings ───────────────────────────────────────────────────
    if (text === '/status' || text === '/settings') {
      await reply(chatId, formatStatusMessage(existing))
      return NextResponse.json({ ok: true })
    }

    // ── /help ─────────────────────────────────────────────────────────────────
    if (text === '/help') {
      await reply(chatId, [
        '*Zawda Bot Commands*',
        '',
        '/alert — View or change your alert level (🔴/🟠/🟡)',
        '/jurisdictions — List & update tracked jurisdictions',
        '/frequency — Change digest cadence',
        '/email your@email.com — Add weekly email digest',
        '/latest — Recent regulatory updates',
        '/status — View your subscription',
        '/stop — Unsubscribe',
        '/help — Show this message',
        '',
        '_Alert levels: 🔴 red (critical only) · 🟠 orange (high+) · 🟡 yellow (all)_',
      ].join('\n'))
      return NextResponse.json({ ok: true })
    }

    // ── /alert ────────────────────────────────────────────────────────────────
    if (text === '/alert') {
      await reply(chatId, formatAlertLevelMessage(existing.minSeverity ?? 'high'))
      return NextResponse.json({ ok: true })
    }

    if (text.startsWith('/alert ')) {
      const levelMap: Record<string, AlertLevel> = {
        red: 'critical', orange: 'high', yellow: 'medium',
        critical: 'critical', high: 'high', medium: 'medium',
      }
      const arg = text.replace('/alert ', '').trim().toLowerCase()
      const level = levelMap[arg]

      if (!level) {
        await reply(chatId, 'Usage: `/alert red`, `/alert orange`, or `/alert yellow`')
        return NextResponse.json({ ok: true })
      }

      existing.minSeverity = level
      await saveSubscribers(subscribers)
      await reply(chatId, `${ALERT_LEVEL_ICON[level]} Alert level set to *${ALERT_LEVEL_LABEL[level]}*`)
      return NextResponse.json({ ok: true })
    }

    // ── /jurisdictions ────────────────────────────────────────────────────────
    if (text === '/jurisdictions') {
      await reply(chatId, [
        `*Your jurisdictions:* ${existing.jurisdictions.join(', ')}`,
        '',
        '*Available:* ' + ALL_JURISDICTION_CODES.join(', '),
        '',
        'To update, send:',
        '`/jurisdictions VARA ADGM CBB`',
        '',
        'Or `/jurisdictions ALL` for everything.',
      ].join('\n'))
      return NextResponse.json({ ok: true })
    }

    if (text.startsWith('/jurisdictions ')) {
      const arg = text.replace('/jurisdictions ', '').trim().toUpperCase()
      let valid: string[]

      if (arg === 'ALL') {
        valid = ALL_JURISDICTION_CODES
      } else {
        const codes = arg.split(/[\s,]+/).filter(Boolean)
        valid = codes.filter((c: string) => ALL_JURISDICTION_CODES.includes(c))
      }

      if (valid.length === 0) {
        await reply(chatId, `No valid codes found. Available: ${ALL_JURISDICTION_CODES.join(', ')}`)
        return NextResponse.json({ ok: true })
      }

      existing.jurisdictions = valid
      await saveSubscribers(subscribers)
      await reply(chatId, `\u{2705} Now tracking: ${valid.join(', ')}`)
      return NextResponse.json({ ok: true })
    }

    // ── /frequency ────────────────────────────────────────────────────────────
    if (text === '/frequency') {
      await reply(chatId, [
        `*Current digest frequency:* ${existing.frequency}`,
        '',
        '*Options:*',
        '`/frequency weekly` — Monday digest + immediate alerts above your threshold',
        '`/frequency twice-weekly` — Mon & Thu digests + immediate alerts',
        '`/frequency critical-only` — No digest; only critical breaking alerts',
      ].join('\n'))
      return NextResponse.json({ ok: true })
    }

    if (text.startsWith('/frequency ')) {
      const freq = text.replace('/frequency ', '').trim()
      if (!['weekly', 'twice-weekly', 'critical-only'].includes(freq)) {
        await reply(chatId, 'Invalid. Use: `weekly`, `twice-weekly`, or `critical-only`')
        return NextResponse.json({ ok: true })
      }
      existing.frequency = freq as BotSubscriber['frequency']
      await saveSubscribers(subscribers)
      await reply(chatId, `\u{2705} Digest frequency set to: ${freq}`)
      return NextResponse.json({ ok: true })
    }

    // ── /email ────────────────────────────────────────────────────────────────
    if (text === '/email') {
      await reply(chatId, existing.email
        ? `*Email digest:* ${existing.email}\n\nSend \`/email new@address.com\` to change or \`/email off\` to disable.`
        : 'Send `/email your@address.com` to receive a parallel weekly email digest.')
      return NextResponse.json({ ok: true })
    }

    if (text.startsWith('/email ')) {
      const emailArg = text.replace('/email ', '').trim()
      if (emailArg === 'off') {
        existing.email = undefined
        await saveSubscribers(subscribers)
        await reply(chatId, '\u{2705} Email digest disabled.')
        return NextResponse.json({ ok: true })
      }
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailArg)) {
        await reply(chatId, 'That doesn\'t look like a valid email. Try again.')
        return NextResponse.json({ ok: true })
      }
      existing.email = emailArg
      await saveSubscribers(subscribers)
      await reply(chatId, `\u{2705} Weekly email digest will be sent to: ${emailArg}`)

      try {
        type EmailSub = { email: string; subscribedAt: string; source: string }
        const emailSubs = (await redis.get<EmailSub[]>(SUBSCRIBERS_KEY)) ?? []
        if (!emailSubs.some(s => s.email === emailArg)) {
          emailSubs.push({ email: emailArg, subscribedAt: new Date().toISOString(), source: 'telegram-bot' })
          await redis.set(SUBSCRIBERS_KEY, emailSubs)
        }
      } catch { /* non-critical */ }

      return NextResponse.json({ ok: true })
    }

    // ── /latest ───────────────────────────────────────────────────────────────
    if (text === '/latest') {
      const allUpdates = (await redis.get<RegulatoryUpdate[]>(REG_UPDATES_KEY)) ?? []
      const weekAgo = new Date()
      weekAgo.setDate(weekAgo.getDate() - 7)
      const recent = allUpdates
        .filter(u =>
          new Date(u.date) >= weekAgo &&
          existing.jurisdictions.some(j => j.toUpperCase() === u.jurisdictionCode.toUpperCase()),
        )
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
        .slice(0, 10)
      await reply(chatId, formatWeeklyDigest(recent, existing.jurisdictions))
      return NextResponse.json({ ok: true })
    }

    // ── /stop ─────────────────────────────────────────────────────────────────
    if (text === '/stop') {
      const idx = subscribers.findIndex(s => s.chatId === chatId)
      if (idx >= 0) subscribers.splice(idx, 1)
      await saveSubscribers(subscribers)
      await reply(chatId, 'You\'ve been unsubscribed. Send /start anytime to resubscribe.')
      return NextResponse.json({ ok: true })
    }

    await reply(chatId, 'Send /help to see available commands.')
    return NextResponse.json({ ok: true })
  } catch {
    return NextResponse.json({ ok: true })
  }
}

async function reply(chatId: string, text: string) {
  if (!BOT_TOKEN) return
  await sendTelegramMessage(chatId, text, BOT_TOKEN)
}

function getWeekNumber(): number {
  const now = new Date()
  const start = new Date(now.getFullYear(), 0, 1)
  return Math.ceil(((now.getTime() - start.getTime()) / 86400000 + start.getDay() + 1) / 7)
}

export async function GET() {
  return NextResponse.json({
    status: 'ok',
    bot: BOT_TOKEN ? 'configured' : 'missing TELEGRAM_BOT_TOKEN',
    webhookSecret: TELEGRAM_WEBHOOK_SECRET ? 'configured' : 'missing TELEGRAM_WEBHOOK_SECRET',
    webhook: 'https://zawda.me/api/bot/telegram',
  })
}
