/**
 * Bot notification service.
 * Handles message formatting, smart dispatch logic, and weekly digest compilation.
 *
 * Dispatch rules:
 * - Max 1-2 messages per week per subscriber
 * - Weekly digest sent Monday 8am GST
 * - Only "critical" severity breaks the weekly rhythm (major enforcement, deadline changes)
 * - Everything else is batched into the weekly summary
 */

import {
  type RegulatoryUpdate,
  type Severity,
  UPDATE_TYPE_LABELS,
  UPDATE_TYPE_ICONS,
  REGULATORY_SOURCES,
} from './regulatory-sources'

export type Channel = 'telegram' | 'whatsapp'
export type Frequency = 'weekly' | 'twice-weekly' | 'critical-only'

export interface BotSubscriber {
  id: string
  channel: Channel
  chatId: string
  /** Jurisdiction codes they're tracking */
  jurisdictions: string[]
  frequency: Frequency
  /** Optional email for parallel digest */
  email?: string
  /** When they last received a notification */
  lastNotifiedAt?: string
  /** How many notifications sent this week */
  weeklyCount: number
  /** Week number for reset */
  weekNumber: number
  createdAt: string
}

/** Get current ISO week number */
function getWeekNumber(): number {
  const now = new Date()
  const start = new Date(now.getFullYear(), 0, 1)
  const diff = now.getTime() - start.getTime()
  return Math.ceil((diff / 86400000 + start.getDay() + 1) / 7)
}

/**
 * Decide whether to send a notification now or batch it.
 * Returns true if the update should be sent immediately.
 */
export function shouldDispatchNow(
  update: RegulatoryUpdate,
  subscriber: BotSubscriber,
): boolean {
  const currentWeek = getWeekNumber()

  // Reset weekly count if new week
  if (subscriber.weekNumber !== currentWeek) {
    subscriber.weeklyCount = 0
    subscriber.weekNumber = currentWeek
  }

  // SLA §3.1: critical alerts MUST be delivered within 4 hours — bypass all weekly caps.
  // The UX preference to limit messages cannot override a contractual SLA obligation.
  if (update.severity === 'critical') return true

  // Critical-only subscribers get nothing else
  if (subscriber.frequency === 'critical-only') return false

  // Weekly: batch everything non-critical into the digest
  if (subscriber.frequency === 'weekly') {
    return false
  }

  // Twice-weekly: allow high-severity up to 2 dispatches per week
  if (subscriber.frequency === 'twice-weekly') {
    if (update.severity === 'high' && subscriber.weeklyCount < 2) return true
    return false
  }

  return false
}

/**
 * Format a single update as a Telegram message (Markdown).
 */
export function formatTelegramAlert(update: RegulatoryUpdate): string {
  const icon = UPDATE_TYPE_ICONS[update.type]
  const typeLabel = UPDATE_TYPE_LABELS[update.type]
  const source = REGULATORY_SOURCES.find(s => s.id === update.sourceId)
  const flag = source?.flag ?? ''

  const lines: string[] = [
    `${icon} *${typeLabel}*`,
    `${flag} ${update.regulator} (${update.jurisdictionCode})`,
    '',
    `*${escapeMarkdown(update.title)}*`,
  ]

  if (update.entity) {
    lines.push(`Entity: ${escapeMarkdown(update.entity)}`)
  }

  if (update.fineAmount) {
    lines.push(`Penalty: ${escapeMarkdown(update.fineAmount)}`)
  }

  if (update.deadlineDate) {
    lines.push(`Deadline: ${escapeMarkdown(update.deadlineDate)}`)
  }

  lines.push('')
  lines.push(escapeMarkdown(update.summary))
  lines.push('')
  lines.push(`[Read full details](${update.url})`)
  lines.push('')
  lines.push(`_${update.date} · via Zawda_`)

  return lines.join('\n')
}

/**
 * Format a weekly digest of multiple updates.
 */
export function formatWeeklyDigest(updates: RegulatoryUpdate[], jurisdictions: string[]): string {
  if (updates.length === 0) {
    return [
      '\u{1F4CB} *Zawda Weekly Digest*',
      '',
      `Jurisdictions: ${jurisdictions.join(', ')}`,
      '',
      'No new regulatory updates this week. Your compliance posture remains unchanged.',
      '',
      '_Stay vigilant. Reply /settings to adjust your preferences._',
    ].join('\n')
  }

  const byType = new Map<string, RegulatoryUpdate[]>()
  for (const u of updates) {
    const list = byType.get(u.type) ?? []
    list.push(u)
    byType.set(u.type, list)
  }

  const lines: string[] = [
    '\u{1F4CB} *Zawda Weekly Digest*',
    `_${new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}_`,
    '',
    `Tracking: ${jurisdictions.join(', ')}`,
    `Updates this week: ${updates.length}`,
    '',
  ]

  // Enforcement first (most important)
  const priorityOrder: string[] = ['enforcement', 'deadline', 'regulation', 'sanction', 'consultation', 'guidance', 'licensing']

  for (const type of priorityOrder) {
    const items = byType.get(type)
    if (!items?.length) continue

    const icon = UPDATE_TYPE_ICONS[type as keyof typeof UPDATE_TYPE_ICONS]
    const label = UPDATE_TYPE_LABELS[type as keyof typeof UPDATE_TYPE_LABELS]
    lines.push(`${icon} *${label}* (${items.length})`)

    for (const item of items.slice(0, 5)) {
      const fine = item.fineAmount ? ` — ${item.fineAmount}` : ''
      lines.push(`  • ${escapeMarkdown(item.title)}${fine}`)
      if (item.url) lines.push(`    [Details](${item.url})`)
    }

    if (items.length > 5) {
      lines.push(`  _...and ${items.length - 5} more_`)
    }

    lines.push('')
  }

  lines.push('_Reply /settings to adjust frequency or jurisdictions._')
  lines.push('_Reply /email to add a weekly email digest._')

  return lines.join('\n')
}

/**
 * Format a welcome message for new subscribers.
 */
export function formatWelcomeMessage(jurisdictions: string[]): string {
  return [
    '\u{1F44B} *Welcome to Zawda Regulatory Alerts*',
    '',
    "You'll receive curated regulatory intelligence for:",
    ...jurisdictions.map(j => `  • ${j}`),
    '',
    '*How it works:*',
    '• Weekly digest every Monday at 8am GST',
    '• Breaking alerts only for critical enforcement actions or deadline changes',
    '• Maximum 1-2 messages per week — we respect your attention',
    '',
    '*Commands:*',
    '/settings — Change frequency or jurisdictions',
    '/jurisdictions — Update tracked jurisdictions',
    '/frequency — Switch between weekly / twice-weekly / critical-only',
    '/email — Add email for parallel weekly digest',
    '/latest — See the latest regulatory updates',
    '/status — Check your subscription status',
    '/help — Show all commands',
    '',
    '_Powered by Zawda — zawda.me_',
  ].join('\n')
}

/**
 * Format a status message.
 */
export function formatStatusMessage(subscriber: BotSubscriber): string {
  return [
    '\u{1F4CA} *Your Subscription Status*',
    '',
    `Channel: ${subscriber.channel === 'telegram' ? 'Telegram' : 'WhatsApp'}`,
    `Frequency: ${subscriber.frequency}`,
    `Jurisdictions: ${subscriber.jurisdictions.join(', ')}`,
    `Email digest: ${subscriber.email ?? 'Not set'}`,
    `Messages this week: ${subscriber.weeklyCount}`,
    `Member since: ${new Date(subscriber.createdAt).toLocaleDateString()}`,
    '',
    '_Reply /settings to make changes._',
  ].join('\n')
}

/** Escape Telegram MarkdownV1 special characters */
function escapeMarkdown(text: string): string {
  return text.replace(/([_*\[\]()~`>#+\-=|{}.!])/g, '\\$1')
}

/**
 * Send a message via Telegram Bot API.
 */
export async function sendTelegramMessage(
  chatId: string,
  text: string,
  botToken: string,
): Promise<boolean> {
  try {
    const res = await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: chatId,
        text,
        parse_mode: 'Markdown',
        disable_web_page_preview: true,
      }),
    })
    return res.ok
  } catch {
    return false
  }
}
