/**
 * Append-only audit log backed by Upstash Redis (lpush / ltrim).
 *
 * Design goals:
 * - Fire-and-forget: errors are swallowed — audit failures never block the primary request path.
 * - Bounded storage: capped at MAX_EVENTS (~90 days at typical traffic).
 * - Structured schema: every event carries userId, resourceType/Id, ip, userAgent.
 *
 * Required for: SLA §6.2 (audit logging), UAE PDPL incident investigation.
 */

import { redis } from './redis'

const AUDIT_KEY = 'audit:log'
const MAX_EVENTS = 50_000

export type AuditEventType =
  | 'auth.login'
  | 'auth.logout'
  | 'auth.session_created'
  | 'auth.session_revoked'
  | 'account.profile_updated'
  | 'vault.upload'
  | 'vault.download'
  | 'vault.delete'
  | 'vault.list'
  | 'dsar.submitted'
  | 'dsar.updated'
  | 'incident.flagged'
  | 'incident.notified'
  | 'incident.updated'
  | 'alert.dispatched'
  | 'alert.sla_breach'

export interface AuditEvent {
  id: string
  timestamp: string
  eventType: AuditEventType
  userId: string
  resourceType: string
  resourceId: string
  ip: string
  userAgent: string
  status: 'success' | 'failure' | 'error'
  details?: Record<string, unknown>
}

/**
 * Append an event to the audit log.
 * Always fire-and-forget — never await if you don't want to block.
 */
export async function writeAuditLog(
  event: Omit<AuditEvent, 'id' | 'timestamp'>,
): Promise<void> {
  try {
    const entry: AuditEvent = {
      id: crypto.randomUUID(),
      timestamp: new Date().toISOString(),
      ...event,
    }
    await redis.lpush(AUDIT_KEY, entry)
    // Keep the list bounded — drop the oldest events
    await redis.ltrim(AUDIT_KEY, 0, MAX_EVENTS - 1)
  } catch {
    // Never surface audit failures to callers
  }
}

/** Extract IP and User-Agent from a Request / NextRequest */
export function extractRequestMeta(req: Request): { ip: string; userAgent: string } {
  const ip =
    req.headers.get('x-forwarded-for')?.split(',')[0].trim() ??
    req.headers.get('x-real-ip') ??
    'unknown'
  const userAgent = req.headers.get('user-agent') ?? 'unknown'
  return { ip, userAgent }
}

/** Read events (newest first, paginated). */
export async function readAuditLog(limit = 200, offset = 0): Promise<AuditEvent[]> {
  return redis.lrange<AuditEvent>(AUDIT_KEY, offset, offset + limit - 1)
}

/** Total number of stored events. */
export async function auditLogLength(): Promise<number> {
  return redis.llen(AUDIT_KEY)
}
