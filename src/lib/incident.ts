/**
 * Security Incident & Breach Notification Pipeline.
 *
 * SLA §6.5: affected users must be notified within 72 hours of a confirmed breach.
 * Lifecycle: open → investigating → notified → resolved.
 *
 * flagIncident  — records incident + writes audit event + emails ops team
 * notifyAffectedUsers — emails affected users via Resend + marks status = notified
 * updateIncident — status transitions and notes
 * listIncidents — admin view
 */

import { redis } from './redis'
import { writeAuditLog } from './audit-log'
import { Resend } from 'resend'

const INCIDENTS_KEY = 'incidents:list'
const SLA_HOURS = 72

export type IncidentStatus = 'open' | 'investigating' | 'notified' | 'resolved'
export type IncidentSeverity = 'critical' | 'high' | 'medium' | 'low'

export interface Incident {
  id: string
  title: string
  description: string
  severity: IncidentSeverity
  status: IncidentStatus
  flaggedAt: string
  notifiedAt?: string
  resolvedAt?: string
  /** Number of users notified so far */
  affectedUserCount?: number
  notes?: string
}

async function loadAll(): Promise<Incident[]> {
  return (await redis.get<Incident[]>(INCIDENTS_KEY)) ?? []
}

async function saveAll(incidents: Incident[]): Promise<void> {
  await redis.set(INCIDENTS_KEY, incidents)
}

/** Hours elapsed since the incident was flagged */
export function hoursElapsedSinceFlagged(flaggedAt: string): number {
  return (Date.now() - new Date(flaggedAt).getTime()) / 3_600_000
}

/** ISO deadline by which users must be notified (flaggedAt + 72 h) */
export function notificationDeadline(flaggedAt: string): string {
  return new Date(new Date(flaggedAt).getTime() + SLA_HOURS * 3_600_000).toISOString()
}

export async function flagIncident(params: {
  title: string
  description: string
  severity: IncidentSeverity
  affectedUserCount?: number
  notes?: string
}): Promise<Incident> {
  const incident: Incident = {
    id: crypto.randomUUID(),
    ...params,
    status: 'open',
    flaggedAt: new Date().toISOString(),
  }

  const all = await loadAll()
  all.push(incident)
  await saveAll(all)

  void writeAuditLog({
    eventType: 'incident.flagged',
    userId: 'system',
    resourceType: 'incident',
    resourceId: incident.id,
    ip: 'internal',
    userAgent: 'system',
    status: 'success',
    details: { title: incident.title, severity: incident.severity },
  }).catch(() => undefined)

  void sendOpsAlert(incident).catch(() => undefined)

  return incident
}

export async function notifyAffectedUsers(
  incidentId: string,
  userEmails: string[],
  notes?: string,
): Promise<{ notified: number; errors: number }> {
  const all = await loadAll()
  const incident = all.find((i) => i.id === incidentId)
  if (!incident) return { notified: 0, errors: 0 }

  const apiKey = process.env.RESEND_API_KEY
  if (!apiKey) return { notified: 0, errors: 0 }

  const resend = new Resend(apiKey)
  const from = process.env.RESEND_FROM_EMAIL ?? process.env.FROM_EMAIL ?? 'noreply@zawda.me'
  const privacyEmail = process.env.PRIVACY_EMAIL ?? 'privacy@zawda.me'

  let notified = 0
  let errors = 0

  for (const email of userEmails) {
    try {
      await resend.emails.send({
        from,
        to: email,
        subject: `Security Notice — Zawda`,
        html: `<p>We are writing to inform you of a security event that may affect your account.</p>
<p><strong>${incident.title}</strong></p>
<p>${incident.description}</p>
${notes ? `<p>${notes}</p>` : ''}
<p>We take the security of your data seriously. If you have questions, contact
<a href="mailto:${privacyEmail}">${privacyEmail}</a>.</p>
<p style="color:#888;font-size:12px">Zawda B2B — zawda.me</p>`,
      })
      notified++
    } catch {
      errors++
    }
  }

  incident.status = 'notified'
  incident.notifiedAt = new Date().toISOString()
  incident.affectedUserCount = (incident.affectedUserCount ?? 0) + userEmails.length
  if (notes) incident.notes = notes
  await saveAll(all)

  void writeAuditLog({
    eventType: 'incident.notified',
    userId: 'system',
    resourceType: 'incident',
    resourceId: incidentId,
    ip: 'internal',
    userAgent: 'system',
    status: 'success',
    details: { notified, errors, total: userEmails.length },
  }).catch(() => undefined)

  return { notified, errors }
}

export async function updateIncident(
  id: string,
  patch: Partial<Pick<Incident, 'status' | 'notes' | 'resolvedAt'>>,
): Promise<Incident | null> {
  const all = await loadAll()
  const idx = all.findIndex((i) => i.id === id)
  if (idx < 0) return null

  Object.assign(all[idx], patch)
  if (patch.status === 'resolved' && !all[idx].resolvedAt) {
    all[idx].resolvedAt = new Date().toISOString()
  }
  await saveAll(all)

  void writeAuditLog({
    eventType: 'incident.updated',
    userId: 'system',
    resourceType: 'incident',
    resourceId: id,
    ip: 'internal',
    userAgent: 'system',
    status: 'success',
    details: patch as Record<string, unknown>,
  }).catch(() => undefined)

  return all[idx]
}

export async function listIncidents(): Promise<Incident[]> {
  return loadAll()
}

async function sendOpsAlert(incident: Incident): Promise<void> {
  const apiKey = process.env.RESEND_API_KEY
  const opsEmail = process.env.OPS_ALERT_EMAIL
  if (!apiKey || !opsEmail) return

  const resend = new Resend(apiKey)
  const from = process.env.RESEND_FROM_EMAIL ?? process.env.FROM_EMAIL ?? 'noreply@zawda.me'
  const deadline = notificationDeadline(incident.flaggedAt)

  await resend.emails.send({
    from,
    to: opsEmail,
    subject: `[INCIDENT ${incident.severity.toUpperCase()}] ${incident.title}`,
    html: `<p><strong>Security incident flagged — action required</strong></p>
<ul>
<li><strong>ID:</strong> ${incident.id}</li>
<li><strong>Severity:</strong> ${incident.severity}</li>
<li><strong>Flagged at:</strong> ${new Date(incident.flaggedAt).toISOString()}</li>
<li><strong>SLA deadline (72 h):</strong> ${new Date(deadline).toISOString()}</li>
</ul>
<p>${incident.description}</p>
<p><strong>Affected users must be notified by ${new Date(deadline).toISOString()} per SLA §6.5.</strong></p>`,
  })
}
