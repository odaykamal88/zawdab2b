/**
 * Clerk webhook endpoint — logs auth events to the audit log.
 *
 * Signature verification is done manually with Node.js crypto (no svix npm package needed).
 * Algorithm: HMAC-SHA256 over "{svix-id}.{svix-timestamp}.{rawBody}" using the decoded secret.
 *
 * Set CLERK_WEBHOOK_SECRET in Vercel (format: whsec_<base64>).
 * Register this URL in the Clerk dashboard: https://dashboard.clerk.com → Webhooks
 */

import { createHmac } from 'crypto'
import { NextRequest, NextResponse } from 'next/server'
import { writeAuditLog, type AuditEventType } from '@/lib/audit-log'

function verifyClerkWebhook(
  rawBody: string,
  msgId: string,
  msgTimestamp: string,
  msgSignature: string,
  secret: string,
): boolean {
  try {
    const secretBytes = Buffer.from(secret.replace(/^whsec_/, ''), 'base64')
    const signedContent = `${msgId}.${msgTimestamp}.${rawBody}`
    const hmac = createHmac('sha256', secretBytes)
    hmac.update(signedContent)
    const expected = hmac.digest('base64')
    // svix-signature may contain multiple space-separated "v1,<sig>" tokens
    const sigs = msgSignature.split(' ').map((s) => s.replace(/^v\d+,/, ''))
    return sigs.some((sig) => sig === expected)
  } catch {
    return false
  }
}

const EVENT_MAP: Record<string, AuditEventType | null> = {
  'session.created': 'auth.login',
  'session.revoked': 'auth.logout',
  'session.ended': 'auth.logout',
  'session.removed': 'auth.session_revoked',
  'user.created': 'auth.session_created',
  'user.updated': 'account.profile_updated',
  'user.deleted': 'auth.session_revoked',
}

export async function POST(req: NextRequest) {
  const webhookSecret = process.env.CLERK_WEBHOOK_SECRET
  if (!webhookSecret) {
    // Graceful degradation: if secret not configured, skip verification but still log
    // (only allow in non-production to prevent open logging endpoint)
    if (process.env.NODE_ENV === 'production') {
      return NextResponse.json({ error: 'Webhook not configured' }, { status: 500 })
    }
  }

  const svixId = req.headers.get('svix-id') ?? ''
  const svixTimestamp = req.headers.get('svix-timestamp') ?? ''
  const svixSignature = req.headers.get('svix-signature') ?? ''
  const rawBody = await req.text()

  if (webhookSecret) {
    // Reject replays older than 5 minutes
    const ts = parseInt(svixTimestamp, 10)
    if (!ts || Math.abs(Date.now() / 1000 - ts) > 300) {
      return NextResponse.json({ error: 'Timestamp out of range' }, { status: 400 })
    }

    if (!verifyClerkWebhook(rawBody, svixId, svixTimestamp, svixSignature, webhookSecret)) {
      return NextResponse.json({ error: 'Invalid signature' }, { status: 401 })
    }
  }

  let payload: { type?: string; data?: Record<string, unknown> }
  try {
    payload = JSON.parse(rawBody)
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const eventType = payload.type ?? ''
  const auditType = EVENT_MAP[eventType]

  if (auditType) {
    const data = payload.data ?? {}
    const userId = String(
      data.user_id ?? data.id ?? 'unknown',
    )
    const ip = req.headers.get('x-forwarded-for')?.split(',')[0].trim() ?? 'clerk'

    await writeAuditLog({
      eventType: auditType,
      userId,
      resourceType: 'auth',
      resourceId: String(data.id ?? ''),
      ip,
      userAgent: req.headers.get('user-agent') ?? 'clerk-webhook',
      status: 'success',
      details: { clerkEvent: eventType },
    })
  }

  return NextResponse.json({ ok: true })
}
