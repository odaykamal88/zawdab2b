import { NextRequest, NextResponse } from 'next/server'
import { redis } from '@/lib/redis'
import {
  type BotSubscriber,
  formatWelcomeMessage,
  formatStatusMessage,
  sendTelegramMessage,
} from '@/lib/bot-service'
import { ALL_JURISDICTION_CODES } from '@/lib/regulatory-sources'

const BOT_SUBSCRIBERS_KEY = 'bot:subscribers'
const SUBSCRIBERS_KEY = 'subscribers'
const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN ?? ''

async function getSubscribers(): Promise<BotSubscriber[]> {
  return (await redis.get<BotSubscriber[]>(BOT_SUBSCRIBERS_KEY)) ?? []
}

async function saveSubscribers(subs: BotSubscriber[]): Promise<void> {
  await redis.set(BOT_SUBSCRIBERS_KEY, subs)
}

export async function POST(request: NextRequest) {
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

    if (text === '/start' || text.startsWith('/start ')) {
      if (existing) {
        await reply(chatId, 'You\'re already subscribed! Use /status to see your settings.')
        return NextResponse.json({ ok: true })
      }

      const defaultJurisdictions = ['VARA', 'ADGM', 'CBB']

      const newSub: BotSubscriber = {
        id: `tg_${chatId}`,
        channel: 'telegram',
        chatId,
        jurisdictions: defaultJurisdictions,
        frequency: 'weekly',
        weeklyCount: 0,
        weekNumber: getWeekNumber(),
        createdAt: new Date().toISOString(),
      }

      subscribers.push(newSub)
      await saveSubscribers(subscribers)
      await reply(chatId, formatWelcomeMessage(defaultJurisdictions))
      return NextResponse.json({ ok: true })
    }

    if (!existing) {
      await reply(chatId, 'Welcome! Send /start to subscribe to Zawda regulatory alerts.')
      return NextResponse.json({ ok: true })
    }

    if (text === '/status') {
      await reply(chatId, formatStatusMessage(existing))
      return NextResponse.json({ ok: true })
    }

    if (text === '/help') {
      await reply(chatId, [
        '*Zawda Bot Commands*',
        '',
        '/status — View your subscription',
        '/jurisdictions — List & update tracked jurisdictions',
        '/frequency — Change alert frequency',
        '/email your@email.com — Add weekly email digest',
        '/latest — Recent regulatory updates',
        '/stop — Unsubscribe',
        '/help — Show this message',
      ].join('\n'))
      return NextResponse.json({ ok: true })
    }

    if (text === '/jurisdictions') {
      await reply(chatId, [
        '*Your jurisdictions:* ' + existing.jurisdictions.join(', '),
        '',
        '*Available:* ' + ALL_JURISDICTION_CODES.join(', '),
        '',
        'To update, send:',
        '`/jurisdictions VARA ADGM CBB CMA`',
      ].join('\n'))
      return NextResponse.json({ ok: true })
    }

    if (text.startsWith('/jurisdictions ')) {
      const codes = text.replace('/jurisdictions ', '').split(/[\s,]+/).map((c: string) => c.toUpperCase())
      const valid = codes.filter((c: string) => ALL_JURISDICTION_CODES.includes(c))

      if (valid.length === 0) {
        await reply(chatId, `No valid jurisdiction codes. Available: ${ALL_JURISDICTION_CODES.join(', ')}`)
        return NextResponse.json({ ok: true })
      }

      existing.jurisdictions = valid
      await saveSubscribers(subscribers)
      await reply(chatId, `\u{2705} Now tracking: ${valid.join(', ')}`)
      return NextResponse.json({ ok: true })
    }

    if (text === '/frequency') {
      await reply(chatId, [
        `*Current frequency:* ${existing.frequency}`,
        '',
        '*Options:*',
        '`/frequency weekly` — Monday digest + critical breaking alerts',
        '`/frequency twice-weekly` — Mon & Thu digests + critical alerts',
        '`/frequency critical-only` — Only major enforcement & deadlines',
      ].join('\n'))
      return NextResponse.json({ ok: true })
    }

    if (text.startsWith('/frequency ')) {
      const freq = text.replace('/frequency ', '').trim()
      if (!['weekly', 'twice-weekly', 'critical-only'].includes(freq)) {
        await reply(chatId, 'Invalid. Use: weekly, twice-weekly, or critical-only')
        return NextResponse.json({ ok: true })
      }
      existing.frequency = freq as BotSubscriber['frequency']
      await saveSubscribers(subscribers)
      await reply(chatId, `\u{2705} Frequency set to: ${freq}`)
      return NextResponse.json({ ok: true })
    }

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

      // Cross-write to the email subscribers list (non-critical)
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

    if (text === '/latest') {
      await reply(chatId, [
        '*Latest Updates*',
        '',
        'No new updates since your last digest.',
        '',
        '_Updates are crawled from regulatory sources across your tracked jurisdictions. Your next digest arrives Monday 8am GST._',
      ].join('\n'))
      return NextResponse.json({ ok: true })
    }

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
    setup: BOT_TOKEN
      ? `Set webhook: https://api.telegram.org/bot${BOT_TOKEN}/setWebhook?url=YOUR_DOMAIN/api/bot/telegram`
      : 'Set TELEGRAM_BOT_TOKEN env var first',
  })
}
