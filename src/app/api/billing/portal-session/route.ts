/**
 * POST /api/billing/portal-session
 *
 * Creates a Chargebee self-serve portal session for the authenticated user.
 * The frontend receives the portal URL and redirects the user to it.
 *
 * Returns:
 *   { url: string }                      — redirect to Chargebee portal
 *   { error: string, redirect: string }  — no Chargebee account yet, go to checkout
 */

import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { chargebee } from '@/lib/chargebee'
import { getSubscription } from '@/lib/subscription'

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? 'https://zawda.me'

export async function POST(_req: NextRequest) {
  const { userId } = await auth()
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const subscription = await getSubscription(userId)

  // No Chargebee customer yet — user is on the free plan or hasn't paid
  if (!subscription?.chargebeeCustomerId) {
    return NextResponse.json(
      { error: 'No billing account found', redirect: '/checkout?plan=professional-799' },
      { status: 404 },
    )
  }

  const result = await chargebee.portalSession.create({
    redirect_url: `${APP_URL}/billing`,
    customer: { id: subscription.chargebeeCustomerId },
  })

  const session = result.portal_session
  return NextResponse.json({ url: session.access_url })
}
