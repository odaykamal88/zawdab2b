import { BrandName } from '@/components/ui/BrandName'
import { BrandMark } from '@/components/ui/BrandMark'


const NAV_LINKS = [
  { label: 'Services', href: '#product' },
  { label: 'Pricing', href: '#pricing' },
  { label: 'Track Record', href: '#track-record' },
  { label: 'Weekly Brief', href: '#brief' },
  { label: 'Free Tools', href: '#tools' },
]

export function FooterSection() {
  return (
    <footer className="border-t border-border py-12 bg-bg-surface" aria-label="Site footer">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-8">
          <div className="space-y-3">
            <div className="flex items-center gap-2.5">
              <BrandMark size={28} className="text-gold shrink-0" />
              <BrandName className="font-display text-base font-bold tracking-[0.08em] text-text uppercase" />
            </div>
            <p className="text-text-faint text-[length:var(--text-xs)] max-w-sm">
              <BrandName /> provides regulatory intelligence and advisory services. This is not
              financial advice, legal counsel, or a licensed brokerage.
            </p>
          </div>

          <nav className="flex flex-wrap gap-x-6 gap-y-2" aria-label="Footer navigation">
            {NAV_LINKS.map((link) => (
              <a key={link.href} href={link.href} className="text-text-muted hover:text-text text-[length:var(--text-sm)] transition-colors">
                {link.label}
              </a>
            ))}
          </nav>

          <div className="flex gap-4">
            <a href="https://www.linkedin.com/company/zawdabtc" target="_blank" rel="noopener noreferrer" className="text-text-muted hover:text-text transition-colors" aria-label="LinkedIn">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" /></svg>
            </a>
            <a href="https://x.com" target="_blank" rel="noopener noreferrer" className="text-text-muted hover:text-text transition-colors" aria-label="X (formerly Twitter)">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" /></svg>
            </a>
          </div>
        </div>

        {/* Disclaimer */}
        <div className="mt-8 pt-6 border-t border-border">
          <p className="text-text-faint text-[length:var(--text-xs)] leading-relaxed max-w-4xl">
            <strong className="text-text-muted">Disclaimer:</strong>{' '}
            <BrandName className="font-semibold" /> is a regulatory facilitation and intelligence platform. We are not a law firm, licensed financial advisor, or regulated entity.
            Our services do not constitute legal advice, financial advice, or regulatory guidance. All recommendations, assessments, and compliance tools are informational in nature
            and must be validated by appropriately licensed professionals in the relevant jurisdiction. By using our services, you agree to our{' '}
            <a href="/terms" className="text-gold hover:underline">Terms of Service</a> and acknowledge that{' '}
            <BrandName className="font-semibold" /> bears no liability for regulatory outcomes, licensing decisions, or enforcement actions.
            SLA commitments are subject to our <a href="/sla" className="text-gold hover:underline">Service Level Agreement</a>.
          </p>
        </div>

        <div className="mt-6 pt-4 border-t border-border text-center">
          <p className="text-text-faint text-[length:var(--text-xs)]">
            &copy; {new Date().getFullYear()} <BrandName />. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  )
}
