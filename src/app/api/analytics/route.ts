import { NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { redis } from '@/lib/redis'

const ANALYTICS_KEY = 'analytics'
const SUBSCRIBERS_KEY = 'subscribers'
const BOT_SUBSCRIBERS_KEY = 'bot:subscribers'

interface AnalyticsData {
  pageViews: Record<string, number>
  assessmentsStarted: number
  assessmentsCompleted: number
  registrations: number
  sessions: number
}

async function getAnalytics(): Promise<AnalyticsData> {
  return (await redis.get<AnalyticsData>(ANALYTICS_KEY)) ?? {
    pageViews: {},
    assessmentsStarted: 0,
    assessmentsCompleted: 0,
    registrations: 0,
    sessions: 0,
  }
}

export async function GET() {
  const { userId, sessionClaims } = await auth()
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const role = (sessionClaims?.metadata as Record<string, unknown> | undefined)?.role
  if (role !== 'superadmin') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const [analytics, subscribers, botSubscribers] = await Promise.all([
    getAnalytics(),
    redis.get<unknown[]>(SUBSCRIBERS_KEY).then((d) => d ?? []),
    redis.get<unknown[]>(BOT_SUBSCRIBERS_KEY).then((d) => d ?? []),
  ])

  return NextResponse.json({
    analytics,
    subscribers: {
      total: subscribers.length,
      list: subscribers,
    },
    telegram: {
      subscribers: botSubscribers.length,
      configured: Boolean(process.env.TELEGRAM_BOT_TOKEN),
    },
  })
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { event } = body

    if (!event || typeof event !== 'string') {
      return NextResponse.json({ error: 'Event name required' }, { status: 400 })
    }

    const analytics = await getAnalytics()

    switch (event) {
      case 'page_view': {
        const page = typeof body.page === 'string' ? body.page : '/'
        analytics.pageViews[page] = (analytics.pageViews[page] ?? 0) + 1
        break
      }
      case 'assessment_started':
        analytics.assessmentsStarted += 1
        break
      case 'assessment_completed':
        analytics.assessmentsCompleted += 1
        break
      case 'registration':
        analytics.registrations += 1
        break
      case 'session_start':
        analytics.sessions += 1
        break
      default:
        return NextResponse.json({ error: 'Unknown event' }, { status: 400 })
    }

    await redis.set(ANALYTICS_KEY, analytics)

    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: 'Failed to track event' }, { status: 500 })
  }
}
