import { createHash } from 'crypto'

export interface AuditEntry<T = unknown> {
  seq: number
  at: string
  prevHash: string
  hash: string
  payload: T
}

/**
 * Append-only, hash-chained audit log. Each entry commits to the previous
 * entry's hash, so any edit, deletion, or reordering breaks the chain and is
 * detectable via verify(). Generic over the payload so it can record policy
 * verdicts (enforcement engine) or triage case records (analyst workflow).
 */
export class AuditLog<T = unknown> {
  private readonly entries_: AuditEntry<T>[] = []

  append(payload: T): AuditEntry<T> {
    const seq = this.entries_.length
    const prevHash = seq === 0 ? 'GENESIS' : this.entries_[seq - 1].hash
    const at = new Date().toISOString()
    const hash = AuditLog.digest(prevHash, at, payload)
    const entry: AuditEntry<T> = { seq, at, prevHash, hash, payload }
    this.entries_.push(entry)
    return entry
  }

  entries(): readonly AuditEntry<T>[] {
    return this.entries_
  }

  /** Returns true only if the whole chain is internally consistent. */
  verify(): boolean {
    for (let i = 0; i < this.entries_.length; i++) {
      const e = this.entries_[i]
      const prevHash = i === 0 ? 'GENESIS' : this.entries_[i - 1].hash
      if (e.prevHash !== prevHash) return false
      if (e.hash !== AuditLog.digest(prevHash, e.at, e.payload)) return false
    }
    return true
  }

  private static digest(prevHash: string, at: string, payload: unknown): string {
    return createHash('sha256').update(`${prevHash}|${at}|${JSON.stringify(payload)}`).digest('hex')
  }
}
