/**
 * POST /api/checkout/create-session
 *
 * Creates a Chargebee hosted checkout page for the given plan and returns its URL.
 * The calling client immediately redirects the user to that URL.
 *
 * Flow:
 *   1. Verify Clerk auth (userId required)
 *   2. Resolve or create a Chargebee customer for this user
 *   3. Create a Chargebee hosted checkout page for the selected plan
 *   4. Embed clerkId in pass_thru_content so /checkout/success can verify without a DB join
 *   5. Return { url } for the client to redirect to
 */

import { NextRequest, NextResponse } from 'next/server'
import { auth, currentUser } from '@clerk/nextjs/server'
import { chargebee, PLAN_IDS, type PlanId } from '@/lib/chargebee'
import { getSubscription, setSubscription } from '@/lib/subscription'

const VALID_PLAN_IDS = new Set<string>(Object.values(PLAN_IDS))
const FREE_PLAN: PlanId = 'watchlist-free'

export async function POST(req: NextRequest) {
  // 1. Auth check
  const { userId } = await auth()
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // 2. Parse and validate plan
  const body = await req.json().catch(() => ({}))
  const planId = typeof body.planId === 'string' ? body.planId : FREE_PLAN

  if (!VALID_PLAN_IDS.has(planId) || planId === FREE_PLAN) {
    // Free plan needs no checkout — activate directly
    const existing = await getSubscription(userId)
    if (!existing) {
      await setSubscription({
        clerkId: userId,
        plan: FREE_PLAN,
        status: 'free',
        chargebeeCustomerId: '',
        updatedAt: new Date().toISOString(),
      })
    }
    return NextResponse.json({ redirect: '/dashboard' })
  }

  // 3. Resolve Chargebee customer ID — create one if this user has never checked out
  let cbCustomerId: string
  const existingSub = await getSubscription(userId)

  if (existingSub?.chargebeeCustomerId) {
    cbCustomerId = existingSub.chargebeeCustomerId
  } else {
    // Fetch user details from Clerk to pre-fill Chargebee customer
    const user = await currentUser()
    const email = user?.emailAddresses?.[0]?.emailAddress ?? ''
    const firstName = user?.firstName ?? undefined
    const lastName = user?.lastName ?? undefined
    const company = typeof body.company === 'string' ? body.company : undefined

    const customerResult = await chargebee.customer.create({
      email,
      first_name: firstName,
      last_name: lastName,
      company,
      // Store Clerk ID in metadata so we can look it up from Chargebee if needed
      meta_data: { clerkId: userId },
    })

    cbCustomerId = customerResult.customer.id

    // Persist customer ID immediately so duplicate customers are never created
    await setSubscription({
      clerkId: userId,
      plan: FREE_PLAN,
      status: 'free',
      chargebeeCustomerId: cbCustomerId,
      updatedAt: new Date().toISOString(),
    })
  }

  // 4. Create Chargebee hosted checkout page
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'https://zawda.me'

  const pageResult = await chargebee.hostedPage.checkoutNewForItems({
    subscription_items: [{ item_price_id: planId as string }],
    customer: { id: cbCustomerId },
    redirect_url: `${baseUrl}/checkout/success`,
    cancel_url: `${baseUrl}/checkout?plan=${planId}&cancelled=true`,
    // Embed Clerk user ID so /checkout/success can sync Redis without a lookup
    pass_thru_content: JSON.stringify({ clerkId: userId, planId }),
  })

  const hostedPage = pageResult.hosted_page
  if (!hostedPage?.url) {
    return NextResponse.json({ error: 'Failed to create checkout session' }, { status: 500 })
  }

  return NextResponse.json({ url: hostedPage.url })
}
