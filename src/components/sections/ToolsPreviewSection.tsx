import { LinkButton } from '@/components/ui/Button'

const TOOLS = [
  {
    title: 'Regulatory Map',
    description: 'Visual overview of licensing status across 6 MENA jurisdictions.',
    mockData: ['UAE — VARA: Active', 'Bahrain — CBB: Active', 'Saudi — CMA: Developing', 'Egypt — FRA/CBE: Early', 'Kuwait — CMA: Limited', 'Qatar — QFCRA: Emerging'],
  },
  {
    title: 'Exchange True Cost Calculator',
    description: 'Compare real trading costs across MENA exchanges — including hidden fees and spreads.',
    mockData: ['Rain: 0.25% / 0.25%', 'BitOasis: 0.30% / 0.30%', 'OKX UAE: 0.08% / 0.10%', 'Binance UAE: 0.10% / 0.10%', 'CoinMENA: 0.15% / 0.25%', 'Bybit Dubai: 0.10% / 0.10%'],
  },
  {
    title: 'BTC Treasury Tracker',
    description: 'Track which MENA institutions hold Bitcoin on their balance sheet.',
    mockData: ['21+ institutional buyers tracked', '~100 BTC total acquired', 'OTC institutional rates', 'Disclosure verified quarterly'],
  },
]

export function ToolsPreviewSection() {
  return (
    <section id="tools" className="py-20 sm:py-28 bg-bg-surface" aria-labelledby="tools-heading">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <p className="font-mono text-gold uppercase tracking-widest text-[length:var(--text-xs)] mb-4">
          Free Tools for the Region
        </p>
        <h2 id="tools-heading" className="font-display font-bold text-text tracking-tight max-w-2xl" style={{ fontSize: 'var(--text-xl)' }}>
          Before you buy intelligence, use the intelligence.
        </h2>

        <div className="grid sm:grid-cols-3 gap-6 mt-12">
          {TOOLS.map((tool) => (
            <div key={tool.title} className="bg-bg-primary border border-border rounded-lg p-6 flex flex-col">
              <h3 className="font-display font-bold text-text text-[length:var(--text-lg)] mb-2">{tool.title}</h3>
              <p className="text-text-muted text-[length:var(--text-sm)] mb-4">{tool.description}</p>
              <div className="bg-bg-surface-2 rounded p-4 mt-auto space-y-1.5">
                {tool.mockData.map((line, i) => (
                  <p key={i} className="font-mono text-text-muted text-[length:var(--text-xs)]">{line}</p>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-10 text-center">
          <LinkButton href="/tools" variant="ghost">Explore free tools →</LinkButton>
        </div>
      </div>
    </section>
  )
}
