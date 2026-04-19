/**
 * User-facing DSAR intake API.
 *
 * POST /api/dsar — submit a new DSAR (Clerk auth required)
 * GET  /api/dsar — list current user's own requests
 */

import { NextRequest, NextResponse } from 'next/server'
import { auth, currentUser } from '@clerk/nextjs/server'
import { submitDsar, readDsarRequests, type DsarType } from '@/lib/dsar'
import { writeAuditLog, extractRequestMeta } from '@/lib/audit-log'

const VALID_TYPES: DsarType[] = [
  'access',
  'rectification',
  'erasure',
  'restriction',
  'objection',
]

export async function POST(req: NextRequest) {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const user = await currentUser()
  const requester =
    user?.emailAddresses?.[0]?.emailAddress ?? ''

  if (!requester) {
    return NextResponse.json({ error: 'Account has no email address' }, { status: 400 })
  }

  let body: { type?: unknown; notes?: unknown }
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  if (!VALID_TYPES.includes(body.type as DsarType)) {
    return NextResponse.json(
      { error: `type must be one of: ${VALID_TYPES.join(', ')}` },
      { status: 400 },
    )
  }

  const notes =
    typeof body.notes === 'string' ? body.notes.slice(0, 2000) : undefined

  const dsar = await submitDsar({
    userId,
    requester,
    type: body.type as DsarType,
    notes,
  })

  const { ip, userAgent } = extractRequestMeta(req)
  void writeAuditLog({
    eventType: 'dsar.submitted',
    userId,
    resourceType: 'dsar',
    resourceId: dsar.id,
    ip,
    userAgent,
    status: 'success',
    details: { type: dsar.type },
  }).catch(() => undefined)

  return NextResponse.json({ dsar }, { status: 201 })
}

export async function GET(_req: NextRequest) {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const all = await readDsarRequests()
  const mine = all.filter((r) => r.userId === userId)

  return NextResponse.json({ requests: mine })
}
