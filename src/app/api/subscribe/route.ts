import { NextRequest, NextResponse } from 'next/server'
import { redis } from '@/lib/redis'

const SUBSCRIBERS_KEY = 'subscribers'

interface Subscriber {
  email: string
  subscribedAt: string
  source: string
}

async function getSubscribers(): Promise<Subscriber[]> {
  return (await redis.get<Subscriber[]>(SUBSCRIBERS_KEY)) ?? []
}

async function saveSubscribers(subscribers: Subscriber[]): Promise<void> {
  await redis.set(SUBSCRIBERS_KEY, subscribers)
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const email = typeof body.email === 'string' ? body.email.trim().toLowerCase() : ''

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ error: 'Valid email required' }, { status: 400 })
    }

    const subscribers = await getSubscribers()

    if (subscribers.some((s) => s.email === email)) {
      return NextResponse.json({ message: 'Already subscribed' })
    }

    subscribers.push({
      email,
      subscribedAt: new Date().toISOString(),
      source: 'weekly-brief',
    })

    await saveSubscribers(subscribers)

    return NextResponse.json({ message: 'Subscribed successfully' })
  } catch {
    return NextResponse.json({ error: 'Subscription failed' }, { status: 500 })
  }
}

export async function GET() {
  const subscribers = await getSubscribers()
  return NextResponse.json({ subscribers, total: subscribers.length })
}
