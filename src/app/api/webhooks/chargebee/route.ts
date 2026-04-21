/**
 * Chargebee webhook endpoint — syncs subscription state into Redis and writes audit log.
 *
 * Authentication: HTTP Basic Auth (username + password set in Chargebee dashboard).
 * Set CHARGEBEE_WEBHOOK_USERNAME and CHARGEBEE_WEBHOOK_PASSWORD in your environment.
 * Register this URL in Chargebee: Settings → API Keys & Webhooks → Webhooks
 *
 * Handled events:
 *   subscription_created      → write record, mark trialing/active
 *   subscription_started      → trial started
 *   subscription_renewed      → renew period end date
 *   subscription_cancelled    → mark cancelled
 *   subscription_reactivated  → restore active
 *   subscription_changed      → plan switch
 *   payment_failed            → log failure (Chargebee handles retry schedule)
 *   invoice_generated         → log invoice
 *   payment_succeeded         → log success
 */

import { NextRequest, NextResponse } from 'next/server'
import { verifyChargebeeWebhook } from '@/lib/chargebee'
import {
  getClerkIdByChargebeeCustomer,
  setSubscription,
  type SubscriptionRecord,
  type SubscriptionStatus,
} from '@/lib/subscription'
import { writeAuditLog, type AuditEventType } from '@/lib/audit-log'
import type { PlanId } from '@/lib/chargebee'

// ---------------------------------------------------------------------------
// Chargebee payload types (subset of fields we actually use)
// ---------------------------------------------------------------------------

interface ChargebeeSubscription {
  id: string
  customer_id: string
  plan_id: string
  status: string
  trial_end?: number
  current_term_end?: number
  cancelled_at?: number
}

interface ChargebeeWebhookPayload {
  event_type: string
  content?: {
    subscription?: ChargebeeSubscription
    invoice?: { id: string; amount_due?: number; currency_code?: string }
    transaction?: { id: string; amount?: number; currency_code?: string }
    customer?: { id: string; email?: string }
  }
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function mapChargebeeStatus(cbStatus: string): SubscriptionStatus {
  const map: Record<string, SubscriptionStatus> = {
    trialing: 'trialing',
    active: 'active',
    non_renewing: 'non_renewing',
    paused: 'paused',
    cancelled: 'cancelled',
  }
  return map[cbStatus] ?? 'active'
}

function toIso(unixSeconds?: number): string | undefined {
  return unixSeconds ? new Date(unixSeconds * 1000).toISOString() : undefined
}

async function syncSubscription(
  clerkId: string,
  sub: ChargebeeSubscription,
): Promise<void> {
  const record: SubscriptionRecord = {
    clerkId,
    plan: sub.plan_id as PlanId,
    status: mapChargebeeStatus(sub.status),
    chargebeeCustomerId: sub.customer_id,
    chargebeeSubscriptionId: sub.id,
    currentPeriodEnd: toIso(sub.current_term_end),
    trialEnd: toIso(sub.trial_end),
    cancelAt: toIso(sub.cancelled_at),
    updatedAt: new Date().toISOString(),
  }
  await setSubscription(record)
}

// ---------------------------------------------------------------------------
// Event → audit type mapping
// ---------------------------------------------------------------------------

const EVENT_AUDIT_MAP: Record<string, AuditEventType> = {
  subscription_created: 'payment.subscription_created',
  subscription_started: 'payment.trial_started',
  subscription_renewed: 'payment.subscription_renewed',
  subscription_cancelled: 'payment.subscription_cancelled',
  subscription_reactivated: 'payment.subscription_reactivated',
  subscription_changed: 'payment.plan_changed',
  subscription_trial_end_reminder: 'payment.trial_ended',
  payment_failed: 'payment.failed',
  invoice_generated: 'payment.invoice_generated',
  payment_succeeded: 'payment.subscription_renewed',
  refund_initiated: 'payment.refund_issued',
}

// ---------------------------------------------------------------------------
// Route handler
// ---------------------------------------------------------------------------

export async function POST(req: NextRequest) {
  // Verify Basic Auth credentials
  const authHeader = req.headers.get('authorization')
  if (!verifyChargebeeWebhook(authHeader)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  let payload: ChargebeeWebhookPayload
  try {
    payload = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const { event_type: eventType, content = {} } = payload
  const sub = content.subscription

  // For subscription events, resolve the Clerk user from the Chargebee customer ID
  let clerkId: string | null = null
  if (sub?.customer_id) {
    clerkId = await getClerkIdByChargebeeCustomer(sub.customer_id)
  }

  // Sync subscription state for all subscription lifecycle events
  const isSubscriptionEvent = [
    'subscription_created',
    'subscription_started',
    'subscription_renewed',
    'subscription_cancelled',
    'subscription_reactivated',
    'subscription_changed',
  ].includes(eventType)

  if (isSubscriptionEvent && sub && clerkId) {
    await syncSubscription(clerkId, sub)
  }

  // Write audit log entry
  const auditType = EVENT_AUDIT_MAP[eventType]
  if (auditType) {
    await writeAuditLog({
      eventType: auditType,
      userId: clerkId ?? 'unknown',
      resourceType: 'subscription',
      resourceId: sub?.id ?? content.invoice?.id ?? content.transaction?.id ?? '',
      ip: 'chargebee-webhook',
      userAgent: req.headers.get('user-agent') ?? 'chargebee',
      status: 'success',
      details: {
        chargebeeEvent: eventType,
        planId: sub?.plan_id,
        chargebeeCustomerId: sub?.customer_id,
        invoiceId: content.invoice?.id,
        amount: content.invoice?.amount_due ?? content.transaction?.amount,
        currency: content.invoice?.currency_code ?? content.transaction?.currency_code,
      },
    })
  }

  return NextResponse.json({ ok: true })
}
