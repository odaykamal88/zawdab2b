import Link from 'next/link'
import { BrandName } from '@/components/ui/BrandName'
import {
  PolicyEngine,
  OfacSanctionsProvider,
  MockKytRiskProvider,
  ScriptedAgent,
  DEMO_AGENT_ID,
  DEMO_POLICY,
  DEMO_TRANSACTIONS,
  RISK_OVERRIDES,
  type Verdict,
  type ProposedTransaction,
} from '@/lib/agent-controls'

export const dynamic = 'force-dynamic'

export const metadata = {
  title: 'Agent Controls — enforcement PoC | Zawda',
  description:
    'Programmatic policy enforcement for autonomous agent crypto transactions: authorize or intercept before signing, using real OFAC screening and KYT-style risk.',
}

const BADGE: Record<Verdict['enforcement'], { label: string; cls: string }> = {
  executed: { label: 'Executed', cls: 'bg-green-50 text-green-700 border-green-200' },
  intercepted: { label: 'Intercepted', cls: 'bg-red-50 text-red-700 border-red-200' },
  'held-for-review': { label: 'Held for review', cls: 'bg-amber-50 text-amber-700 border-amber-200' },
}

export default function AgentControlsPage() {
  const engine = new PolicyEngine(() => DEMO_POLICY, {
    sanctions: new OfacSanctionsProvider(),
    risk: new MockKytRiskProvider(RISK_OVERRIDES),
  })
  const agent = new ScriptedAgent(DEMO_AGENT_ID, DEMO_TRANSACTIONS)
  const rows: { tx: ProposedTransaction; verdict: Verdict }[] = []
  let next = agent.next()
  while (next) {
    rows.push({ tx: next, verdict: engine.evaluate(next) })
    next = agent.next()
  }
  const chainValid = engine.audit.verify()

  const executed = rows.filter((r) => r.verdict.enforcement === 'executed').length
  const intercepted = rows.filter((r) => r.verdict.enforcement === 'intercepted').length
  const review = rows.filter((r) => r.verdict.enforcement === 'held-for-review').length

  return (
    <div className="min-h-screen bg-bg-primary">
      <nav className="border-b border-border py-4">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <svg width="24" height="24" viewBox="0 0 32 32" fill="none" aria-hidden="true">
              <path d="M4 24L10 8L16 20L22 6L28 24" stroke="var(--gold)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <BrandName className="font-display text-base font-bold text-text" />
          </Link>
          <Link href="/" className="text-text-muted hover:text-text text-[length:var(--text-sm)] transition-colors">
            &#8592; Back to Home
          </Link>
        </div>
      </nav>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-12 sm:py-16">
        <div className="inline-block px-2.5 py-1 bg-gold/10 text-gold text-[length:var(--text-xs)] font-bold uppercase rounded mb-3">
          Proof of concept
        </div>
        <h1 className="font-display font-bold text-text tracking-tight text-[length:var(--text-xl)] mb-3">Agent Controls</h1>
        <p className="text-text-muted text-[length:var(--text-sm)] max-w-2xl leading-relaxed">
          The enforcement layer for autonomous agent crypto transactions. An AI agent proposes each transaction; the policy
          engine <strong className="text-text">authorizes or intercepts it before signing</strong>, using external risk
          intelligence as an input. This complements detection/monitoring tools — it is the programmatic control point where a
          transaction is allowed or blocked.
        </p>

        {/* Policy summary */}
        <div className="mt-8 bg-bg-surface border border-border rounded-2xl p-5">
          <p className="font-mono text-text-faint text-[length:var(--text-xs)] uppercase tracking-wide mb-2">Active agent policy</p>
          <div className="grid sm:grid-cols-3 gap-4 text-[length:var(--text-sm)]">
            <div><span className="text-text-muted">Per-tx limit</span><br /><span className="font-mono text-text">${DEMO_POLICY.perTxLimitUsd.toLocaleString()}</span></div>
            <div><span className="text-text-muted">Daily limit</span><br /><span className="font-mono text-text">${DEMO_POLICY.dailyLimitUsd.toLocaleString()}</span></div>
            <div><span className="text-text-muted">Licensed jurisdictions</span><br /><span className="font-mono text-text">{DEMO_POLICY.allowedJurisdictions.join(', ')}</span></div>
          </div>
        </div>

        {/* Summary counts */}
        <div className="grid grid-cols-3 gap-4 mt-6">
          <Stat value={executed} label="Executed" cls="text-green-600" />
          <Stat value={intercepted} label="Intercepted" cls="text-red-600" />
          <Stat value={review} label="Held for review" cls="text-amber-600" />
        </div>

        {/* Transactions */}
        <div className="mt-6 space-y-4">
          {rows.map(({ tx, verdict }) => {
            const badge = BADGE[verdict.enforcement]
            const s = verdict.intelligence.sanctions
            return (
              <div key={tx.id} className="bg-bg-surface border border-border rounded-2xl p-5">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-mono text-text-faint text-[length:var(--text-xs)]">{tx.id}</span>
                      <span className="font-mono text-text text-[length:var(--text-sm)] font-bold">${tx.amountUsd.toLocaleString()}</span>
                      <span className="text-text-faint text-[length:var(--text-xs)]">{tx.asset} · {tx.chain} · {tx.counterpartyJurisdiction}</span>
                    </div>
                    <p className="text-text-muted text-[length:var(--text-sm)]">{tx.memo}</p>
                  </div>
                  <span className={`shrink-0 text-[length:var(--text-xs)] px-2.5 py-1 rounded-full border font-medium ${badge.cls}`}>{badge.label}</span>
                </div>

                <div className="mt-3 flex flex-wrap gap-x-5 gap-y-1 text-[length:var(--text-xs)] font-mono text-text-faint">
                  <span>sanctions: {s ? <span className="text-red-600">MATCH — {s.entity}</span> : <span className="text-green-600">clear</span>}</span>
                  <span>risk: <span className="text-text-muted">{verdict.intelligence.risk.score}/100 · {verdict.intelligence.risk.band}{verdict.intelligence.risk.simulated ? ' (simulated)' : ''}</span></span>
                </div>

                {verdict.results.length > 0 && (
                  <ul className="mt-3 space-y-1.5 border-t border-border pt-3">
                    {verdict.results.map((r, i) => (
                      <li key={i} className="text-text-muted text-[length:var(--text-xs)]">
                        <span className="font-mono text-text">{r.policy}</span>
                        <span className="text-text-faint"> ({r.reasonCode})</span>: {r.reason}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            )
          })}
        </div>

        {/* Audit + provenance */}
        <div className="mt-6 bg-bg-surface border border-border rounded-2xl p-5 text-[length:var(--text-sm)]">
          <p className="text-text">
            <strong>Audit trail:</strong> {rows.length} tamper-evident, hash-chained entries · chain integrity ={' '}
            <span className={chainValid ? 'text-green-600' : 'text-red-600'}>{String(chainValid)}</span>
          </p>
          <p className="text-text-faint text-[length:var(--text-xs)] mt-2 leading-relaxed">
            Sanctions screening uses a real OFAC SDN digital-currency snapshot (blocks on a genuinely listed address). Risk
            scores are <strong>simulated</strong> for this PoC and marked as such; in production the same interface is served by a
            live KYT provider (e.g. Chainalysis). No funds move — this is a decision-and-audit layer.
          </p>
        </div>
      </main>
    </div>
  )
}

function Stat({ value, label, cls }: { value: number; label: string; cls: string }) {
  return (
    <div className="bg-bg-surface border border-border rounded-xl p-4 text-center">
      <p className={`font-mono font-bold text-[length:var(--text-xl)] ${cls}`}>{value}</p>
      <p className="text-text-faint text-[length:var(--text-xs)]">{label}</p>
    </div>
  )
}
