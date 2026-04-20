/**
 * Admin DSAR management API (Clerk auth required).
 *
 * GET   /api/admin/dsar        — list all requests
 * PATCH /api/admin/dsar?id=:id — update status/notes
 */

import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { readDsarRequests, updateDsar, daysUntilDue, type DsarStatus } from '@/lib/dsar'
import { writeAuditLog, extractRequestMeta } from '@/lib/audit-log'

const VALID_STATUSES: DsarStatus[] = ['open', 'in_progress', 'completed', 'rejected']

export async function GET(_req: NextRequest) {
  const { userId, sessionClaims } = await auth()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const role = (sessionClaims?.metadata as Record<string, unknown> | undefined)?.role
  if (role !== 'superadmin') return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const all = await readDsarRequests()
  const enriched = all.map((r) => ({
    ...r,
    daysRemaining: daysUntilDue(r.dueAt),
    overdue: daysUntilDue(r.dueAt) < 0 && r.status !== 'completed' && r.status !== 'rejected',
    atRisk: daysUntilDue(r.dueAt) <= 5 && r.status !== 'completed' && r.status !== 'rejected',
  }))

  // Sort: open first, then by due date ascending
  enriched.sort((a, b) => {
    const openOrder = (s: string) => (s === 'open' ? 0 : s === 'in_progress' ? 1 : 2)
    if (openOrder(a.status) !== openOrder(b.status)) return openOrder(a.status) - openOrder(b.status)
    return new Date(a.dueAt).getTime() - new Date(b.dueAt).getTime()
  })

  return NextResponse.json({ requests: enriched, total: enriched.length })
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

  if (body.status !== undefined && !VALID_STATUSES.includes(body.status as DsarStatus)) {
    return NextResponse.json(
      { error: `status must be one of: ${VALID_STATUSES.join(', ')}` },
      { status: 400 },
    )
  }

  const patch: Parameters<typeof updateDsar>[1] = {}
  if (body.status) patch.status = body.status as DsarStatus
  if (typeof body.notes === 'string') patch.notes = body.notes.slice(0, 2000)

  const updated = await updateDsar(id, patch)
  if (!updated) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  const { ip, userAgent } = extractRequestMeta(req)
  void writeAuditLog({
    eventType: 'dsar.updated',
    userId,
    resourceType: 'dsar',
    resourceId: id,
    ip,
    userAgent,
    status: 'success',
    details: patch as Record<string, unknown>,
  }).catch(() => undefined)

  return NextResponse.json({ dsar: updated })
}
