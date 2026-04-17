import { put, del } from '@vercel/blob'
import { redis } from './redis'
import { randomUUID, createHash } from 'crypto'
import { encrypt, decrypt, serialize, deserialize } from './vault-crypto'

export interface VaultRecord {
  id: string
  tenantId: string
  docId: string
  filename: string
  mimeType: string
  size: number
  sha256: string
  uploadedAt: string
  encrypted: true
  blobUrl: string
}

function indexKey(tenantId: string): string {
  return `vault:${tenantId}:index`
}

async function readIndex(tenantId: string): Promise<VaultRecord[]> {
  return (await redis.get<VaultRecord[]>(indexKey(tenantId))) ?? []
}

async function writeIndex(tenantId: string, records: VaultRecord[]): Promise<void> {
  await redis.set(indexKey(tenantId), records)
}

export interface PlanLimits {
  maxFiles: number
  maxBytesPerFile: number
  maxTotalBytes: number
}

export function limitsFor(plan: string | undefined): PlanLimits {
  const p = (plan ?? '').toLowerCase()
  if (p === 'enterprise') return { maxFiles: 10000, maxBytesPerFile: 100 * 1024 * 1024, maxTotalBytes: 10 * 1024 * 1024 * 1024 }
  if (p === 'navigator' || p === 'professional') return { maxFiles: 500, maxBytesPerFile: 50 * 1024 * 1024, maxTotalBytes: 2 * 1024 * 1024 * 1024 }
  return { maxFiles: 10, maxBytesPerFile: 10 * 1024 * 1024, maxTotalBytes: 100 * 1024 * 1024 }
}

export async function listVault(tenantId: string): Promise<VaultRecord[]> {
  return readIndex(tenantId)
}

export async function storeFile(params: {
  tenantId: string
  docId: string
  filename: string
  mimeType: string
  data: Buffer
  plan?: string
}): Promise<{ record: VaultRecord } | { error: string; status: number }> {
  const limits = limitsFor(params.plan)
  if (params.data.length > limits.maxBytesPerFile) {
    return { error: `File exceeds plan limit of ${Math.round(limits.maxBytesPerFile / 1024 / 1024)} MB`, status: 413 }
  }

  const existing = await readIndex(params.tenantId)
  if (existing.length >= limits.maxFiles) {
    return { error: `File count exceeds plan limit of ${limits.maxFiles}. Upgrade to upload more.`, status: 402 }
  }
  const usedBytes = existing.reduce((sum, r) => sum + r.size, 0)
  if (usedBytes + params.data.length > limits.maxTotalBytes) {
    return { error: 'Storage quota exceeded for current plan. Upgrade to upload more.', status: 402 }
  }

  const id = randomUUID()
  const sha256 = createHash('sha256').update(params.data).digest('hex')
  const encryptedBlob = encrypt(params.data)
  const serialized = serialize(encryptedBlob)

  const { url: blobUrl } = await put(
    `vault/${params.tenantId}/${id}.bin`,
    serialized,
    { access: 'public', contentType: 'application/octet-stream', addRandomSuffix: false },
  )

  const record: VaultRecord = {
    id,
    tenantId: params.tenantId,
    docId: params.docId,
    filename: params.filename,
    mimeType: params.mimeType,
    size: params.data.length,
    sha256,
    uploadedAt: new Date().toISOString(),
    encrypted: true,
    blobUrl,
  }

  const records = await readIndex(params.tenantId)
  records.push(record)
  await writeIndex(params.tenantId, records)

  return { record }
}

export async function readFileDecrypted(tenantId: string, id: string): Promise<{ record: VaultRecord; data: Buffer } | null> {
  const records = await readIndex(tenantId)
  const record = records.find((r) => r.id === id)
  if (!record) return null
  try {
    const response = await fetch(record.blobUrl)
    if (!response.ok) return null
    const raw = Buffer.from(await response.arrayBuffer())
    const blob = deserialize(raw)
    const data = decrypt(blob)
    return { record, data }
  } catch {
    return null
  }
}

export async function deleteFile(tenantId: string, id: string): Promise<boolean> {
  const records = await readIndex(tenantId)
  const record = records.find((r) => r.id === id)
  if (!record) return false
  try {
    await del(record.blobUrl)
  } catch {
    /* already gone */
  }
  await writeIndex(tenantId, records.filter((r) => r.id !== id))
  return true
}
