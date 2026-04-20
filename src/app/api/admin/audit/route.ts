/**
 * Admin audit log viewer (Clerk auth required).
 *
 * GET /api/admin/audit?limit=200&offset=0
 *
 * Returns the audit log newest-first, paginated.
 */

import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { readAuditLog, auditLogLength } from '@/lib/audit-log'

const MAX_LIMIT = 500

export async function GET(req: NextRequest) {
  const { userId, sessionClaims } = await auth()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const role = (sessionClaims?.metadata as Record<string, unknown> | undefined)?.role
  if (role !== 'superadmin') return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const params = req.nextUrl.searchParams
  const limit = Math.min(parseInt(params.get('limit') ?? '200', 10) || 200, MAX_LIMIT)
  const offset = Math.max(parseInt(params.get('offset') ?? '0', 10) || 0, 0)

  const [events, total] = await Promise.all([
    readAuditLog(limit, offset),
    auditLogLength(),
  ])

  return NextResponse.json({
    events,
    total,
    limit,
    offset,
    hasMore: offset + limit < total,
  })
}
