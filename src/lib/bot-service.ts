/**
 * Bot notification service.
 * Handles message formatting, smart dispatch logic, and weekly digest compilation.
 *
 * Dispatch rules:
 * - Alert threshold (minSeverity) controls what gets pushed immediately
 * - Weekly digest batches everything below the threshold
 * - SLA §3.1: critical alerts always dispatched within 4 hours, no exceptions
 */

import {
  type RegulatoryUpdate,
  type Severity,
  UPDATE_TYPE_LABELS,
  UPDATE_TYPE_ICONS,
  REGULATORY_SOURCES,
  JURISDICTION_GROUPS,
} from './regulatory-sources'

export type Channel = 'telegram' | 'whatsapp'
export type Frequency = 'weekly' | 'twice-weekly' | 'critical-only'
export type AlertLevel = 'critical' | 'high' | 'medium'

export interface BotSubscriber {
  id: string
  channel: Channel
  chatId: string
  jurisdictions: string[]
  frequency: Frequency
  /** Minimum severity for an immediate push notification (below threshold goes to digest only) */
  minSeverity: AlertLevel
  email?: string
  lastNotifiedAt?: string
  weeklyCount: number
  weekNumber: number
  createdAt: string
  /** Tracks onboarding wizard step; cleared once onboarding is complete */
  onboardingStep?: 'jurisdictions' | 'alertLevel'
}

export const ALERT_LEVEL_ICON: Record<AlertLevel, string> = {
  critical: '\u{1F534}', // 🔴
  high:     '\u{1F7E0}', // 🟠
  medium:   '\u{1F7E1}', // 🟡
}

export const ALERT_LEVEL_LABEL: Record<AlertLevel, string> = {
  critical: 'Red — Critical only',
  high:     'Orange — High priority & above',
  medium:   'Yellow — All alerts',
}

const SEVERITY_RANK: Record<Severity, number> = { critical: 3, high: 2, medium: 1, low: 0 }

/** Get current ISO week number */
function getWeekNumber(): number {
  const now = new Date()
  const start = new Date(now.getFullYear(), 0, 1)
  return Math.ceil(((now.getTime() - start.getTime()) / 86400000 + start.getDay() + 1) / 7)
}

/**
 * Decide whether to push an update immediately.
 * Returns true only when the update meets the subscriber's alert threshold.
 */
export function shouldDispatchNow(
  update: RegulatoryUpdate,
  subscriber: BotSubscriber,
): boolean {
  const currentWeek = getWeekNumber()
  if (subscriber.weekNumber !== currentWeek) {
    subscriber.weeklyCount = 0
    subscriber.weekNumber = currentWeek
  }

  // SLA §3.1: critical alerts always dispatched immediately regardless of settings
  if (update.severity === 'critical') return true

  // critical-only subscribers: nothing else pushed
  if (subscriber.frequency === 'critical-only') return false

  // Below subscriber's alert threshold: batch into digest only
  const threshold = subscriber.minSeverity ?? 'high'
  return SEVERITY_RANK[update.severity] >= SEVERITY_RANK[threshold]
}

/**
 * Format a single update as a Telegram message (Markdown).
 */
export function formatTelegramAlert(update: RegulatoryUpdate): string {
  const icon = UPDATE_TYPE_ICONS[update.type]
  const typeLabel = UPDATE_TYPE_LABELS[update.type]
  const source = REGULATORY_SOURCES.find(s => s.id === update.sourceId)
  const flag = source?.flag ?? ''
  const alertIcon = ALERT_LEVEL_ICON[update.severity as AlertLevel] ?? ''

  const lines: string[] = [
    `${alertIcon} ${icon} *${typeLabel}*`,
    `${flag} ${update.regulator} (${update.jurisdictionCode})`,
    '',
    `*${escapeMarkdown(update.title)}*`,
  ]

  if (update.entity) lines.push(`Entity: ${escapeMarkdown(update.entity)}`)
  if (update.fineAmount) lines.push(`Penalty: ${escapeMarkdown(update.fineAmount)}`)
  if (update.deadlineDate) lines.push(`Deadline: ${escapeMarkdown(update.deadlineDate)}`)

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
      '_Reply /latest anytime or /settings to adjust preferences._',
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

  const priorityOrder: string[] = ['enforcement', 'deadline', 'regulation', 'sanction', 'consultation', 'guidance', 'licensing']

  for (const type of priorityOrder) {
    const items = byType.get(type)
    if (!items?.length) continue

    const icon = UPDATE_TYPE_ICONS[type as keyof typeof UPDATE_TYPE_ICONS]
    const label = UPDATE_TYPE_LABELS[type as keyof typeof UPDATE_TYPE_LABELS]
    lines.push(`${icon} *${label}* (${items.length})`)

    for (const item of items.slice(0, 5)) {
      const severityDot = ALERT_LEVEL_ICON[item.severity as AlertLevel] ?? ''
      const fine = item.fineAmount ? ` — ${item.fineAmount}` : ''
      lines.push(`  ${severityDot} ${escapeMarkdown(item.title)}${fine}`)
      if (item.url) lines.push(`    [Details](${item.url})`)
    }

    if (items.length > 5) lines.push(`  _...and ${items.length - 5} more_`)
    lines.push('')
  }

  lines.push('_Reply /settings to adjust alert level or jurisdictions._')

  return lines.join('\n')
}

/**
 * Step 1 of onboarding: ask which jurisdictions to track.
 */
export function formatJurisdictionPrompt(): string {
  const lines = [
    '\u{1F30D} *Step 1 of 2 — Choose your jurisdictions*',
    '',
    'Reply with the jurisdiction codes you want to track, separated by spaces.',
    'Or reply `ALL` to track every available jurisdiction.',
    '',
    '*Available jurisdictions:*',
  ]

  for (const group of JURISDICTION_GROUPS) {
    const codes = group.sources.map(s => `\`${s.jurisdictionCode}\``).join('  ')
    lines.push(`${group.flag} *${group.country}:* ${codes}`)
  }

  lines.push('')
  lines.push('_Example: `VARA ADGM CBB`_')

  return lines.join('\n')
}

/**
 * Step 2 of onboarding: ask which alert level to use.
 */
export function formatAlertLevelPrompt(): string {
  return [
    '\u{1F514} *Step 2 of 2 — Choose your alert level*',
    '',
    'What severity should trigger an *immediate push notification* to you?',
    '(Everything else is batched into your weekly digest)',
    '',
    `\u{1F534} \`red\` — *Critical only*`,
    '    Major enforcement, license revocations, mandatory deadlines',
    '',
    `\u{1F7E0} \`orange\` — *High priority & above* _(recommended)_`,
    '    Above + new regulations, framework amendments, sanctions',
    '',
    `\u{1F7E1} \`yellow\` — *All alerts*`,
    '    Above + consultations, licensing updates, guidance notes',
    '',
    'Reply with: `red`, `orange`, or `yellow`',
  ].join('\n')
}

/**
 * Format the /alert command display and options.
 */
export function formatAlertLevelMessage(current: AlertLevel): string {
  const lines = [
    '\u{1F514} *Alert Level*',
    '',
    `Current: ${ALERT_LEVEL_ICON[current]} *${ALERT_LEVEL_LABEL[current]}*`,
    '',
    '*To change, reply with:*',
    `\u{1F534} \`/alert red\` — Critical only (major enforcement, mandatory deadlines)`,
    `\u{1F7E0} \`/alert orange\` — High priority & above (+ new regulations, sanctions)`,
    `\u{1F7E1} \`/alert yellow\` — All alerts (+ consultations, licensing updates)`,
    '',
    '_Everything below your threshold is batched into your weekly digest._',
  ]
  return lines.join('\n')
}

/**
 * Format the final welcome message shown after onboarding is complete.
 */
export function formatWelcomeMessage(jurisdictions: string[], minSeverity: AlertLevel = 'high'): string {
  return [
    '\u{1F44B} *Welcome to Zawda Regulatory Alerts*',
    '',
    `Alert level: ${ALERT_LEVEL_ICON[minSeverity]} *${ALERT_LEVEL_LABEL[minSeverity]}*`,
    `Tracking: ${jurisdictions.join(', ')}`,
    '',
    '*What to expect:*',
    '• Immediate push for alerts at or above your threshold',
    '• Weekly digest every Monday at 8am GST with everything else',
    '• Critical enforcement actions always delivered within 4 hours',
    '',
    '*Commands:*',
    '/alert — Change your alert level (🔴/🟠/🟡)',
    '/jurisdictions — Update tracked jurisdictions',
    '/frequency — Switch digest cadence',
    '/email — Add email for weekly digest',
    '/latest — See recent updates',
    '/status — Check your subscription',
    '/help — Show all commands',
    '/stop — Unsubscribe',
    '',
    '_Powered by Zawda — zawda.me_',
  ].join('\n')
}

/**
 * Format a status message.
 */
export function formatStatusMessage(subscriber: BotSubscriber): string {
  const level = subscriber.minSeverity ?? 'high'
  return [
    '\u{1F4CA} *Your Subscription*',
    '',
    `Alert level: ${ALERT_LEVEL_ICON[level]} ${ALERT_LEVEL_LABEL[level]}`,
    `Jurisdictions: ${subscriber.jurisdictions.join(', ')}`,
    `Digest frequency: ${subscriber.frequency}`,
    `Email digest: ${subscriber.email ?? 'Not set'}`,
    `Messages this week: ${subscriber.weeklyCount}`,
    `Member since: ${new Date(subscriber.createdAt).toLocaleDateString()}`,
    '',
    '_/alert to change level · /jurisdictions to change regions_',
  ].join('\n')
}

/** Escape Telegram MarkdownV1 special characters */
function escapeMarkdown(text: string): string {
  return text.replace(/([_*[\]()~`>#+\-=|{}.!])/g, '\\$1')
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
