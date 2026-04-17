import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { Ratelimit } from '@upstash/ratelimit'
import { redis } from '@/lib/redis'
import { readFileDecrypted, deleteFile } from '@/lib/vault-storage'

const ratelimit = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(30, '1 m'),
})

function isValidId(id: string): boolean {
  return /^[a-f0-9-]{36}$/.test(id)
}

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { success } = await ratelimit.limit(userId)
  if (!success) return NextResponse.json({ error: 'Too many requests' }, { status: 429 })

  const { id } = await params
  if (!isValidId(id)) return NextResponse.json({ error: 'Invalid id' }, { status: 400 })

  const result = await readFileDecrypted(userId, id)
  if (!result) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  const safeName = result.record.filename.replace(/"/g, '')
  return new NextResponse(new Uint8Array(result.data), {
    status: 200,
    headers: {
      'Content-Type': result.record.mimeType,
      'Content-Length': String(result.data.length),
      'Content-Disposition': `attachment; filename="${safeName}"`,
      'X-Content-SHA256': result.record.sha256,
    },
  })
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { success } = await ratelimit.limit(userId)
  if (!success) return NextResponse.json({ error: 'Too many requests' }, { status: 429 })

  const { id } = await params
  if (!isValidId(id)) return NextResponse.json({ error: 'Invalid id' }, { status: 400 })

  const ok = await deleteFile(userId, id)
  if (!ok) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  return NextResponse.json({ ok: true })
}
