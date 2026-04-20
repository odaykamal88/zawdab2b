/**
 * Admin incident management API (Clerk auth required).
 *
 * GET   /api/admin/incidents                      — list all incidents
 * POST  /api/admin/incidents                      — flag new incident
 * PATCH /api/admin/incidents?id=:id               — update status/notes
 * POST  /api/admin/incidents?id=:id&action=notify — notify affected users
 */

import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import {
  flagIncident,
  notifyAffectedUsers,
  updateIncident,
  listIncidents,
  hoursElapsedSinceFlagged,
  notificationDeadline,
  type IncidentSeverity,
  type IncidentStatus,
} from '@/lib/incident'
import { extractRequestMeta } from '@/lib/audit-log'

const VALID_SEVERITIES: IncidentSeverity[] = ['critical', 'high', 'medium', 'low']
const VALID_STATUSES: IncidentStatus[] = ['open', 'investigating', 'notified', 'resolved']

export async function GET(_req: NextRequest) {
  const { userId, sessionClaims } = await auth()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const role = (sessionClaims?.metadata as Record<string, unknown> | undefined)?.role
  if (role !== 'superadmin') return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const incidents = await listIncidents()
  const enriched = incidents.map((i) => ({
    ...i,
    hoursElapsed: hoursElapsedSinceFlagged(i.flaggedAt),
    notificationDeadline: notificationDeadline(i.flaggedAt),
    slaBreached:
      i.status !== 'notified' &&
      i.status !== 'resolved' &&
      hoursElapsedSinceFlagged(i.flaggedAt) > 72,
  }))

  enriched.sort((a, b) => new Date(b.flaggedAt).getTime() - new Date(a.flaggedAt).getTime())

  return NextResponse.json({ incidents: enriched, total: enriched.length })
}

export async function POST(req: NextRequest) {
  const { userId, sessionClaims } = await auth()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const role = (sessionClaims?.metadata as Record<string, unknown> | undefined)?.role
  if (role !== 'superadmin') return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const id = req.nextUrl.searchParams.get('id')
  const action = req.nextUrl.searchParams.get('action')

  // Notify affected users for an existing incident
  if (id && action === 'notify') {
    let body: { emails?: unknown; notes?: unknown }
    try {
      body = await req.json()
    } catch {
      return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
    }

    if (!Array.isArray(body.emails) || body.emails.length === 0) {
      return NextResponse.json({ error: 'emails array is required' }, { status: 400 })
    }

    const emails = (body.emails as unknown[]).filter(
      (e): e is string => typeof e === 'string' && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e),
    )

    if (emails.length === 0) {
      return NextResponse.json({ error: 'No valid email addresses' }, { status: 400 })
    }

    const notes = typeof body.notes === 'string' ? body.notes.slice(0, 2000) : undefined
    const result = await notifyAffectedUsers(id, emails, notes)

    return NextResponse.json({ ok: true, ...result })
  }

  // Flag a new incident
  let body: {
    title?: unknown
    description?: unknown
    severity?: unknown
    affectedUserCount?: unknown
    notes?: unknown
  }
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  if (typeof body.title !== 'string' || body.title.trim().length === 0) {
    return NextResponse.json({ error: 'title is required' }, { status: 400 })
  }
  if (typeof body.description !== 'string' || body.description.trim().length === 0) {
    return NextResponse.json({ error: 'description is required' }, { status: 400 })
  }
  if (!VALID_SEVERITIES.includes(body.severity as IncidentSeverity)) {
    return NextResponse.json(
      { error: `severity must be one of: ${VALID_SEVERITIES.join(', ')}` },
      { status: 400 },
    )
  }

  const { ip, userAgent } = extractRequestMeta(req)
  void ip, userAgent // used indirectly via flagIncident audit call

  const incident = await flagIncident({
    title: body.title.trim(),
    description: (body.description as string).trim(),
    severity: body.severity as IncidentSeverity,
    affectedUserCount:
      typeof body.affectedUserCount === 'number' ? body.affectedUserCount : undefined,
    notes: typeof body.notes === 'string' ? body.notes.slice(0, 2000) : undefined,
  })

  return NextResponse.json({ incident }, { status: 201 })
}

export async function PATCH(req: NextRequest) {
  const { userId, sessionClaims } = await auth()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const role = (sessionClaims?.metadata as Record<string, unknown> | undefined)?.role
  if (role !== 'superadmin') return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const id = req.nextUrl.searchParams.get('id')
  if (!id) return NextResponse.json({ error: 'id is required' }, { status: 400 })

  let body: { status?: unknown; notes?: unknown }
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  if (body.status !== undefined && !VALID_STATUSES.includes(body.status as IncidentStatus)) {
    return NextResponse.json(
      { error: `status must be one of: ${VALID_STATUSES.join(', ')}` },
      { status: 400 },
    )
  }

  const patch: Parameters<typeof updateIncident>[1] = {}
  if (body.status) patch.status = body.status as IncidentStatus
  if (typeof body.notes === 'string') patch.notes = body.notes.slice(0, 2000)

  const updated = await updateIncident(id, patch)
  if (!updated) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  return NextResponse.json({ incident: updated })
}
