/**
 * GET /api/checkout/verify?id=hp_xxx
 *
 * Called by /checkout/success after Chargebee redirects the user back.
 * Retrieves the hosted page, confirms payment succeeded, and syncs the
 * subscription state into Redis.
 *
 * Returns:
 *   { ok: true, plan: string, redirect: '/onboarding' }  — on success
 *   { ok: false, reason: string }                         — on failure/pending
 */

import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { chargebee } from '@/lib/chargebee'
import { setSubscription, type SubscriptionRecord } from '@/lib/subscription'
import { writeAuditLog } from '@/lib/audit-log'
import type { PlanId } from '@/lib/chargebee'

export async function GET(req: NextRequest) {
  const { userId } = await auth()
  if (!userId) {
    return NextResponse.json({ ok: false, reason: 'Unauthorized' }, { status: 401 })
  }

  const hostedPageId = req.nextUrl.searchParams.get('id')
  if (!hostedPageId) {
    return NextResponse.json({ ok: false, reason: 'Missing hosted page id' }, { status: 400 })
  }

  // Retrieve the hosted page from Chargebee
  const result = await chargebee.hostedPage.retrieve(hostedPageId)
  const page = result.hosted_page

  if (page.state !== 'succeeded') {
    return NextResponse.json({ ok: false, reason: `Payment not completed (state: ${page.state})` })
  }

  // Extract Clerk user ID and plan from pass_thru_content (set during create-session)
  let clerkId = userId
  let planId: PlanId = 'watchlist-free'

  if (page.pass_thru_content) {
    try {
      const meta = JSON.parse(page.pass_thru_content) as { clerkId?: string; planId?: string }
      if (meta.clerkId) clerkId = meta.clerkId
      if (meta.planId) planId = meta.planId as PlanId
    } catch {
      // Fall back to authenticated userId — safe to continue
    }
  }

  // Extract subscription details from hosted page content
  const content = page.content as unknown as Record<string, unknown>
  const sub = content?.subscription as Record<string, unknown> | undefined
  const customerId = (sub?.customer_id ?? '') as string
  const subscriptionId = (sub?.id ?? '') as string
  const status = (sub?.status ?? 'active') as string
  const trialEnd = typeof sub?.trial_end === 'number' ? sub.trial_end : undefined
  const currentTermEnd = typeof sub?.current_term_end === 'number' ? sub.current_term_end : undefined

  const record: SubscriptionRecord = {
    clerkId,
    plan: planId,
    status: status === 'in_trial' ? 'trialing' : 'active',
    chargebeeCustomerId: customerId,
    chargebeeSubscriptionId: subscriptionId,
    currentPeriodEnd: currentTermEnd ? new Date(currentTermEnd * 1000).toISOString() : undefined,
    trialEnd: trialEnd ? new Date(trialEnd * 1000).toISOString() : undefined,
    updatedAt: new Date().toISOString(),
  }

  await setSubscription(record)

  // Audit log
  void writeAuditLog({
    eventType: 'payment.subscription_created',
    userId: clerkId,
    resourceType: 'subscription',
    resourceId: subscriptionId,
    ip: req.headers.get('x-forwarded-for')?.split(',')[0].trim() ?? 'unknown',
    userAgent: req.headers.get('user-agent') ?? 'unknown',
    status: 'success',
    details: { planId, chargebeeCustomerId: customerId, hostedPageId },
  })

  return NextResponse.json({ ok: true, plan: planId, redirect: '/onboarding' })
}
