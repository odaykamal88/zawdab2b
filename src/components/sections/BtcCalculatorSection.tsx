'use client'

import { useState, useMemo } from 'react'

const EXCHANGE_RATES = [
  { name: 'Retail Exchange (avg)', makerFee: 0.0025, takerFee: 0.0030, spread: 0.005, withdrawal: 25 },
  { name: 'OTC Desk (standard)', makerFee: 0, takerFee: 0.001, spread: 0.002, withdrawal: 0 },
  { name: 'OTC Desk (institutional)', makerFee: 0, takerFee: 0.0005, spread: 0.001, withdrawal: 0 },
]

/* Source: approximate BTC price — used for illustrative calculations only */
const DEFAULT_BTC_PRICE = 84000

export function BtcCalculatorSection() {
  const [amount, setAmount] = useState(1000000)
  const [btcPrice, setBtcPrice] = useState(DEFAULT_BTC_PRICE)

  const results = useMemo(() => {
    return EXCHANGE_RATES.map((rate) => {
      const tradingFee = amount * rate.takerFee
      const spreadCost = amount * rate.spread
      const totalCost = tradingFee + spreadCost + rate.withdrawal
      const netBtc = (amount - totalCost) / btcPrice
      return {
        ...rate,
        tradingFee,
        spreadCost,
        totalCost,
        netBtc,
        effectiveRate: (totalCost / amount) * 100,
      }
    })
  }, [amount, btcPrice])

  const savings = results[0].totalCost - results[2].totalCost

  function formatUsd(n: number) {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(n)
  }

  function formatBtc(n: number) {
    return n.toFixed(4)
  }

  return (
    <section id="btc-calculator" className="py-20 sm:py-28" aria-labelledby="calc-heading">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <p className="font-mono text-gold uppercase tracking-widest text-[length:var(--text-xs)] mb-4">
          BTC Acquisition Calculator
        </p>
        <h2
          id="calc-heading"
          className="font-display font-bold text-text tracking-tight max-w-2xl"
          style={{ fontSize: 'var(--text-xl)' }}
        >
          See what institutional rates actually save you.
        </h2>
        <p className="text-text-muted text-[length:var(--text-base)] mt-3 max-w-xl">
          Compare real costs across retail exchanges and OTC desks. Input your acquisition size to see the difference.
        </p>

        {/* Inputs */}
        <div className="grid sm:grid-cols-2 gap-4 mt-8 max-w-xl">
          <div>
            <label htmlFor="calc-amount" className="block text-text-muted text-[length:var(--text-sm)] mb-1.5">
              Acquisition Amount (USD)
            </label>
            <input
              id="calc-amount"
              type="number"
              value={amount}
              onChange={(e) => setAmount(Math.max(0, Number(e.target.value)))}
              className="w-full rounded-lg border border-border bg-bg-surface px-4 py-2.5 font-mono text-text text-[length:var(--text-base)] focus:outline-none focus:border-gold"
            />
          </div>
          <div>
            <label htmlFor="calc-price" className="block text-text-muted text-[length:var(--text-sm)] mb-1.5">
              BTC Price (USD)
            </label>
            <input
              id="calc-price"
              type="number"
              value={btcPrice}
              onChange={(e) => setBtcPrice(Math.max(1, Number(e.target.value)))}
              className="w-full rounded-lg border border-border bg-bg-surface px-4 py-2.5 font-mono text-text text-[length:var(--text-base)] focus:outline-none focus:border-gold"
            />
          </div>
        </div>

        {/* Results table */}
        <div className="mt-8 overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b-2 border-border">
                <th className="py-3 pr-4 text-text text-[length:var(--text-sm)] font-semibold">Channel</th>
                <th className="py-3 px-4 text-text text-[length:var(--text-sm)] font-semibold text-right">Trading Fee</th>
                <th className="py-3 px-4 text-text text-[length:var(--text-sm)] font-semibold text-right">Spread Cost</th>
                <th className="py-3 px-4 text-text text-[length:var(--text-sm)] font-semibold text-right">Total Cost</th>
                <th className="py-3 px-4 text-text text-[length:var(--text-sm)] font-semibold text-right">Effective Rate</th>
                <th className="py-3 pl-4 text-text text-[length:var(--text-sm)] font-semibold text-right">BTC Received</th>
              </tr>
            </thead>
            <tbody>
              {results.map((r, i) => (
                <tr
                  key={r.name}
                  className={`border-b border-border ${i === 2 ? 'bg-gold-light' : ''}`}
                >
                  <td className="py-3 pr-4 text-text text-[length:var(--text-sm)] font-medium">
                    {r.name}
                    {i === 2 && <span className="ml-2 text-gold text-[length:var(--text-xs)] font-bold">★ Best</span>}
                  </td>
                  <td className="py-3 px-4 font-mono text-text-muted text-[length:var(--text-sm)] text-right">{formatUsd(r.tradingFee)}</td>
                  <td className="py-3 px-4 font-mono text-text-muted text-[length:var(--text-sm)] text-right">{formatUsd(r.spreadCost)}</td>
                  <td className="py-3 px-4 font-mono text-text text-[length:var(--text-sm)] text-right font-medium">{formatUsd(r.totalCost)}</td>
                  <td className="py-3 px-4 font-mono text-text-muted text-[length:var(--text-sm)] text-right">{r.effectiveRate.toFixed(2)}%</td>
                  <td className="py-3 pl-4 font-mono text-text text-[length:var(--text-sm)] text-right font-medium">{formatBtc(r.netBtc)} BTC</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Savings callout */}
        <div className="mt-6 bg-bg-surface border border-border rounded-xl p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 max-w-2xl">
          <div>
            <p className="text-text font-medium text-[length:var(--text-base)]">
              Institutional OTC saves you <span className="text-gold font-bold font-mono">{formatUsd(savings)}</span> on this acquisition.
            </p>
            <p className="text-text-muted text-[length:var(--text-sm)] mt-0.5">
              That&rsquo;s <span className="font-mono">{formatBtc(savings / btcPrice)}</span> more BTC in your treasury.
            </p>
          </div>
        </div>

        <p className="text-text-faint text-[length:var(--text-xs)] mt-4">
          Fees shown are illustrative based on publicly available fee schedules. Actual rates vary by volume and relationship. Contact us for verified institutional quotes.
        </p>
      </div>
    </section>
  )
}
