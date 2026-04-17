import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { Ratelimit } from '@upstash/ratelimit'
import { redis } from '@/lib/redis'
import { listVault, storeFile, limitsFor } from '@/lib/vault-storage'

const ratelimit = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(30, '1 m'),
})

export async function GET(req: NextRequest) {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { success } = await ratelimit.limit(userId)
  if (!success) return NextResponse.json({ error: 'Too many requests' }, { status: 429 })

  const plan = req.headers.get('x-plan') ?? undefined
  const records = await listVault(userId)
  return NextResponse.json({
    records: records.map(({ tenantId: _t, blobUrl: _b, ...rest }) => rest),
    limits: limitsFor(plan),
  })
}

export async function POST(req: NextRequest) {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { success } = await ratelimit.limit(userId)
  if (!success) return NextResponse.json({ error: 'Too many requests' }, { status: 429 })

  const plan = req.headers.get('x-plan') ?? undefined

  let form: FormData
  try {
    form = await req.formData()
  } catch {
    return NextResponse.json({ error: 'Expected multipart/form-data' }, { status: 400 })
  }

  const file = form.get('file')
  const docId = form.get('docId')

  if (!(file instanceof File)) return NextResponse.json({ error: 'file field is required' }, { status: 400 })
  if (typeof docId !== 'string' || !/^[a-zA-Z0-9_-]{1,128}$/.test(docId)) {
    return NextResponse.json({ error: 'Invalid docId' }, { status: 400 })
  }
  if (file.size === 0) return NextResponse.json({ error: 'File is empty' }, { status: 400 })

  const safeName = file.name.replace(/[^\w.\- ]+/g, '_').slice(0, 200)
  const buf = Buffer.from(await file.arrayBuffer())

  const result = await storeFile({
    tenantId: userId,
    docId,
    filename: safeName,
    mimeType: file.type || 'application/octet-stream',
    data: buf,
    plan,
  })

  if ('error' in result) {
    return NextResponse.json({ error: result.error }, { status: result.status })
  }

  const { tenantId: _t, blobUrl: _b, ...record } = result.record
  return NextResponse.json({ record })
}
