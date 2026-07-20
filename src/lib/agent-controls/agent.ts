import type { ProposedTransaction } from './types'

/**
 * An agent proposes transactions; the PolicyEngine authorizes or blocks each
 * one BEFORE it is signed.
 *
 * `ScriptedAgent` replays a fixed list (no API keys, fully reproducible).
 *
 * To drive this with a real LLM (Claude), implement AgentClient.next() using the
 * Anthropic Messages API with tool-use: the model emits a "propose_transaction"
 * tool call, you map it to a ProposedTransaction, and this engine gates it
 * before any signing happens.
 */
export interface AgentClient {
  readonly name: string
  next(): ProposedTransaction | null
}

export class ScriptedAgent implements AgentClient {
  readonly name: string
  private readonly queue: ProposedTransaction[]
  private i = 0

  constructor(name: string, transactions: ProposedTransaction[]) {
    this.name = name
    this.queue = transactions
  }

  next(): ProposedTransaction | null {
    return this.i < this.queue.length ? this.queue[this.i++] : null
  }
}
