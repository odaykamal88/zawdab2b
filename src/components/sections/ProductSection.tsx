import { BrandName } from '@/components/ui/BrandName'

const PILLARS = [
  {
    title: 'Enforcement Early Warning',
    tagline: 'Know before the letter arrives.',
    description: 'Real-time monitoring of VARA, ADGM, CBB, and FSRA enforcement actions, regulatory changes, and licensing circulars. Get alerts the day a rule changes — not the day you get fined.',
    icon: (
      <svg width="32" height="32" viewBox="0 0 32 32" fill="none" stroke="var(--gold)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <rect x="4" y="6" width="24" height="20" rx="3" />
        <path d="M4 12h24" /><circle cx="16" cy="20" r="3" /><path d="M16 17v-2" />
      </svg>
    ),
  },
  {
    title: 'Licensing Roadmap',
    tagline: 'From application to approval.',
    description: 'Step-by-step VARA, ADGM, and CBB licensing checklists. Track your application progress, know what documents to prepare, and avoid the delays that cost firms months of revenue.',
    icon: (
      <svg width="32" height="32" viewBox="0 0 32 32" fill="none" stroke="var(--gold)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="8" width="28" height="18" rx="3" />
        <path d="M10 14h12M10 18h8" /><circle cx="24" cy="18" r="2" />
      </svg>
    ),
  },
  {
    title: 'Compliance Benchmarking',
    tagline: 'Prove it to the board.',
    description: 'Exchange fee transparency, vendor comparisons, and jurisdiction-by-jurisdiction compliance status. The data your CFO, legal counsel, and board need for audit-ready reporting.',
    icon: (
      <svg width="32" height="32" viewBox="0 0 32 32" fill="none" stroke="var(--gold)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M8 28V18M16 28V10M24 28V16" />
        <circle cx="8" cy="18" r="2" /><circle cx="16" cy="10" r="2" /><circle cx="24" cy="16" r="2" />
      </svg>
    ),
  },
]

export function ProductSection() {
  return (
    <section id="product" className="py-20 sm:py-28" aria-labelledby="product-heading">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <p className="font-mono text-gold uppercase tracking-widest text-[length:var(--text-xs)] mb-4">
          What <BrandName /> Does
        </p>
        <h2
          id="product-heading"
          className="font-display font-bold text-text tracking-tight max-w-2xl"
          style={{ fontSize: 'var(--text-xl)' }}
        >
          Intelligence before enforcement. Not after.
        </h2>

        <div className="grid sm:grid-cols-3 gap-6 mt-12">
          {PILLARS.map((pillar) => (
            <div
              key={pillar.title}
              className="bg-bg-surface border border-border rounded-lg p-8 transition-all hover:border-gold hover:shadow-[0_0_40px_rgba(214,152,40,0.08)] group"
            >
              <div className="mb-4">{pillar.icon}</div>
              <h3 className="font-display font-bold text-text text-[length:var(--text-lg)]">{pillar.title}</h3>
              <p className="italic text-gold text-[length:var(--text-sm)] mt-1">{pillar.tagline}</p>
              <p className="text-text-muted text-[length:var(--text-base)] mt-3 leading-relaxed">{pillar.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
