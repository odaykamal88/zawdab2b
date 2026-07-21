import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { Ratelimit } from '@upstash/ratelimit'
import { redis } from '@/lib/redis'
import { listVault, storeFile, limitsFor, type VaultRecord } from '@/lib/vault-storage'
import { writeAuditLog, extractRequestMeta } from '@/lib/audit-log'
import { getSubscription, isFeatureAllowed, type SubscriptionRecord } from '@/lib/subscription'

const ratelimit = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(30, '1 m'),
})

function resolveVaultPlan(subscription: SubscriptionRecord | null): string | undefined {
  const planId = subscription?.plan ?? ''
  if (planId.includes('enterprise')) return 'enterprise'
  if (planId.includes('professional')) return 'professional'
  return undefined
}

async function getVaultEntitlements(userId: string): Promise<{ canUpload: boolean; plan: string | undefined }> {
  const subscription = await getSubscription(userId)
  const canUpload = isFeatureAllowed(subscription, 'vault')
  return {
    canUpload,
    plan: canUpload ? resolveVaultPlan(subscription) : undefined,
  }
}

function toClientRecord(record: VaultRecord): Omit<VaultRecord, 'tenantId' | 'blobUrl' | 'blobPathname'> {
  return {
    id: record.id,
    docId: record.docId,
    filename: record.filename,
    mimeType: record.mimeType,
    size: record.size,
    sha256: record.sha256,
    uploadedAt: record.uploadedAt,
    encrypted: record.encrypted,
  }
}

export async function GET(req: NextRequest) {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { success } = await ratelimit.limit(userId)
  if (!success) return NextResponse.json({ error: 'Too many requests' }, { status: 429 })

  const entitlements = await getVaultEntitlements(userId)
  const records = await listVault(userId)

  const { ip, userAgent } = extractRequestMeta(req)
  void writeAuditLog({
    eventType: 'vault.list',
    userId,
    resourceType: 'vault',
    resourceId: userId,
    ip,
    userAgent,
    status: 'success',
    details: { count: records.length },
  }).catch(() => undefined)

  return NextResponse.json({
    records: records.map(toClientRecord),
    limits: entitlements.canUpload ? limitsFor(entitlements.plan) : null,
    canUpload: entitlements.canUpload,
  })
}

export async function POST(req: NextRequest) {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { success } = await ratelimit.limit(userId)
  if (!success) return NextResponse.json({ error: 'Too many requests' }, { status: 429 })

  const entitlements = await getVaultEntitlements(userId)
  if (!entitlements.canUpload) {
    return NextResponse.json({ error: 'Vault access requires an eligible paid plan.' }, { status: 403 })
  }

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
    plan: entitlements.plan,
  })

  if ('error' in result) {
    const { ip: errIp, userAgent: errUa } = extractRequestMeta(req)
    void writeAuditLog({
      eventType: 'vault.upload',
      userId,
      resourceType: 'vault',
      resourceId: docId,
      ip: errIp,
      userAgent: errUa,
      status: 'failure',
      details: { error: result.error },
    }).catch(() => undefined)
    return NextResponse.json({ error: result.error }, { status: result.status })
  }

  const { ip, userAgent } = extractRequestMeta(req)
  void writeAuditLog({
    eventType: 'vault.upload',
    userId,
    resourceType: 'vault',
    resourceId: result.record.id,
    ip,
    userAgent,
    status: 'success',
    details: { filename: result.record.filename, size: result.record.size },
  }).catch(() => undefined)

  return NextResponse.json({ record: toClientRecord(result.record) })
}
