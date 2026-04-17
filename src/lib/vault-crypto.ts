import { randomBytes, createCipheriv, createDecipheriv, scryptSync } from 'crypto'

const ALGO = 'aes-256-gcm'
const IV_LENGTH = 12
const TAG_LENGTH = 16
const SALT_LENGTH = 16

function getMasterKey(): string {
  const key = process.env.VAULT_MASTER_KEY
  if (!key || key.length < 32) {
    throw new Error('VAULT_MASTER_KEY environment variable is required (min 32 chars). Generate with: openssl rand -hex 32')
  }
  return key
}

function deriveKey(salt: Buffer): Buffer {
  return scryptSync(getMasterKey(), salt, 32)
}

export interface EncryptedBlob {
  ciphertext: Buffer
  iv: Buffer
  tag: Buffer
  salt: Buffer
}

export function encrypt(plaintext: Buffer): EncryptedBlob {
  const salt = randomBytes(SALT_LENGTH)
  const iv = randomBytes(IV_LENGTH)
  const key = deriveKey(salt)
  const cipher = createCipheriv(ALGO, key, iv)
  const ciphertext = Buffer.concat([cipher.update(plaintext), cipher.final()])
  const tag = cipher.getAuthTag()
  return { ciphertext, iv, tag, salt }
}

export function decrypt(blob: EncryptedBlob): Buffer {
  const key = deriveKey(blob.salt)
  const decipher = createDecipheriv(ALGO, key, blob.iv)
  decipher.setAuthTag(blob.tag)
  return Buffer.concat([decipher.update(blob.ciphertext), decipher.final()])
}

export function serialize(blob: EncryptedBlob): Buffer {
  return Buffer.concat([blob.salt, blob.iv, blob.tag, blob.ciphertext])
}

export function deserialize(raw: Buffer): EncryptedBlob {
  const salt = raw.subarray(0, SALT_LENGTH)
  const iv = raw.subarray(SALT_LENGTH, SALT_LENGTH + IV_LENGTH)
  const tag = raw.subarray(SALT_LENGTH + IV_LENGTH, SALT_LENGTH + IV_LENGTH + TAG_LENGTH)
  const ciphertext = raw.subarray(SALT_LENGTH + IV_LENGTH + TAG_LENGTH)
  return { salt, iv, tag, ciphertext }
}
