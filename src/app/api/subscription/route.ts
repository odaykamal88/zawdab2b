/**
 * GET /api/subscription
 *
 * Returns the authenticated user's subscription record from Redis.
 * Used by client components via the useSubscription() hook.
 *
 * Returns:
 *   { subscription: SubscriptionRecord }  — if found
 *   { subscription: null }               — if no record exists (new user, seeding in progress)
 */

import { NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { getSubscription } from '@/lib/subscription'

export async function GET() {
  const { userId } = await auth()
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const subscription = await getSubscription(userId)
  return NextResponse.json({ subscription })
}
