/**
 * Data Subject Access Request (DSAR) service.
 *
 * UAE Federal Decree-Law No. 45 of 2021 (PDPL) — 30-day response SLA.
 * Intake → confirmation email → admin alert → admin resolves → closed.
 *
 * Required by: ToS §8.7, §8.2.
 */

import { redis } from './redis'
import { Resend } from 'resend'

const DSAR_KEY = 'dsar:requests'
const DSAR_SLA_DAYS = 30

export type DsarType =
  | 'access'
  | 'rectification'
  | 'erasure'
  | 'restriction'
  | 'objection'

export type DsarStatus = 'open' | 'in_progress' | 'completed' | 'rejected'

export interface DsarRequest {
  id: string
  /** Email address of the requester */
  requester: string
  /** Clerk user ID */
  userId: string
  type: DsarType
  status: DsarStatus
  openedAt: string
  /** openedAt + 30 days — PDPL deadline */
  dueAt: string
  closedAt?: string
  notes?: string
}

export function dsarDueDate(from: Date = new Date()): string {
  const due = new Date(from)
  due.setDate(due.getDate() + DSAR_SLA_DAYS)
  return due.toISOString()
}

/** Positive = days remaining; negative = days overdue */
export function daysUntilDue(dueAt: string): number {
  return Math.floor((new Date(dueAt).getTime() - Date.now()) / 86_400_000)
}

export function dsarTypeLabel(type: DsarType): string {
  const labels: Record<DsarType, string> = {
    access: 'Data Access',
    rectification: 'Data Rectification',
    erasure: 'Data Erasure (Right to be Forgotten)',
    restriction: 'Processing Restriction',
    objection: 'Objection to Processing',
  }
  return labels[type]
}

async function loadAll(): Promise<DsarRequest[]> {
  return (await redis.get<DsarRequest[]>(DSAR_KEY)) ?? []
}

async function saveAll(reqs: DsarRequest[]): Promise<void> {
  await redis.set(DSAR_KEY, reqs)
}

export async function submitDsar(params: {
  userId: string
  requester: string
  type: DsarType
  notes?: string
}): Promise<DsarRequest> {
  const now = new Date()
  const req: DsarRequest = {
    id: crypto.randomUUID(),
    requester: params.requester,
    userId: params.userId,
    type: params.type,
    status: 'open',
    openedAt: now.toISOString(),
    dueAt: dsarDueDate(now),
    notes: params.notes,
  }

  const all = await loadAll()
  all.push(req)
  await saveAll(all)

  void sendDsarEmails(req).catch(() => undefined)

  return req
}

export async function updateDsar(
  id: string,
  patch: Partial<Pick<DsarRequest, 'status' | 'notes' | 'closedAt'>>,
): Promise<DsarRequest | null> {
  const all = await loadAll()
  const idx = all.findIndex((r) => r.id === id)
  if (idx < 0) return null

  Object.assign(all[idx], patch)
  if ((patch.status === 'completed' || patch.status === 'rejected') && !all[idx].closedAt) {
    all[idx].closedAt = new Date().toISOString()
  }
  await saveAll(all)
  return all[idx]
}

export async function readDsarRequests(): Promise<DsarRequest[]> {
  return loadAll()
}

async function sendDsarEmails(req: DsarRequest): Promise<void> {
  const apiKey = process.env.RESEND_API_KEY
  if (!apiKey) return

  const resend = new Resend(apiKey)
  const from = process.env.RESEND_FROM_EMAIL ?? process.env.FROM_EMAIL ?? 'noreply@zawda.me'
  const privacyEmail = process.env.PRIVACY_EMAIL ?? 'privacy@zawda.me'
  const due = new Date(req.dueAt).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
  const label = dsarTypeLabel(req.type)
  const ref = req.id.slice(0, 8).toUpperCase()

  await Promise.allSettled([
    resend.emails.send({
      from,
      to: req.requester,
      subject: `Your data request has been received — Zawda (Ref: ${ref})`,
      html: `<p>We have received your <strong>${label}</strong> request.</p>
<p><strong>Reference:</strong> ${req.id}</p>
<p>We will respond by <strong>${due}</strong> in accordance with UAE Federal Decree-Law No. 45 of 2021 (PDPL).</p>
<p>For questions, contact <a href="mailto:${privacyEmail}">${privacyEmail}</a>.</p>
<p style="color:#888;font-size:12px">Zawda B2B — zawda.me</p>`,
    }),

    resend.emails.send({
      from,
      to: privacyEmail,
      subject: `[DSAR] New ${label} request — due ${due}`,
      html: `<p>A new DSAR has been submitted and requires action.</p>
<ul>
<li><strong>Reference:</strong> ${req.id}</li>
<li><strong>Type:</strong> ${label}</li>
<li><strong>Requester:</strong> ${req.requester}</li>
<li><strong>Opened:</strong> ${new Date(req.openedAt).toISOString()}</li>
<li><strong>Due:</strong> ${due} (PDPL 30-day SLA)</li>
</ul>
<p>Log in to the admin dashboard to manage this request.</p>`,
    }),
  ])
}
