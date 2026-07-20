import { createHash } from 'crypto'
import type { Verdict } from './types'

export interface AuditEntry {
  seq: number
  at: string
  prevHash: string
  hash: string
  verdict: Verdict
}

/**
 * Append-only, hash-chained audit log. Each entry commits to the previous
 * entry's hash, so any edit, deletion, or reordering breaks the chain and is
 * detectable via verify(). This is the tamper-evident record a regulator asks
 * for during an audit.
 */
export class AuditLog {
  private readonly entries_: AuditEntry[] = []

  append(verdict: Verdict): AuditEntry {
    const seq = this.entries_.length
    const prevHash = seq === 0 ? 'GENESIS' : this.entries_[seq - 1].hash
    const at = new Date().toISOString()
    const hash = AuditLog.digest(prevHash, at, verdict)
    const entry: AuditEntry = { seq, at, prevHash, hash, verdict }
    this.entries_.push(entry)
    return entry
  }

  entries(): readonly AuditEntry[] {
    return this.entries_
  }

  /** Returns true only if the whole chain is internally consistent. */
  verify(): boolean {
    for (let i = 0; i < this.entries_.length; i++) {
      const e = this.entries_[i]
      const prevHash = i === 0 ? 'GENESIS' : this.entries_[i - 1].hash
      if (e.prevHash !== prevHash) return false
      if (e.hash !== AuditLog.digest(prevHash, e.at, e.verdict)) return false
    }
    return true
  }

  private static digest(prevHash: string, at: string, verdict: Verdict): string {
    return createHash('sha256').update(`${prevHash}|${at}|${JSON.stringify(verdict)}`).digest('hex')
  }
}
