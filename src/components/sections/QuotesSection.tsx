const QUOTES = [
  {
    text: 'regulatory certainty that industry participants need, while addressing the evolving risks of the digital asset ecosystem',
    highlight: 'evolving risks of the digital asset ecosystem',
    author: 'Emmanuel Givanakis',
    title: 'CEO, FSRA (ADGM)',
    sourceUrl: 'https://www.adgm.com/media/announcements/adgm-fsra-implements-amendments-to-its-digital-asset-regulatory-framework',
  },
  {
    text: 'our regulatory framework for sustainable finance is the most comprehensive in the Middle East and South Asia region, and comparable in scope and content with the most comprehensive regulatory frameworks globally',
    highlight: 'most comprehensive in the Middle East and South Asia region',
    author: 'H.E. Ahmed Jasim Al Zaabi',
    title: 'Chairman, ADGM',
    sourceUrl: 'https://www.adgm.com/media/announcements/adgm-implements-its-sustainable-finance-regulatory-framework',
  },
  {
    text: 'strong relationships with local regulators has been a priority since day one',
    highlight: 'strong relationships with local regulators',
    author: "Dina Sam'an",
    title: 'Co-Founder, CoinMENA',
    sourceUrl: 'https://coingeek.com/coinmena-secures-dubai-vara-license-for-broker-dealer-services/',
  },
  {
    text: 'more stable banking relationships, better pricing, lower fees, and more reliable processes',
    highlight: 'more stable banking relationships, better pricing, lower fees',
    author: 'Rain Financial',
    title: 'Licensed Exchange (CBB)',
    sourceUrl: 'https://bitcoinmagazine.com/business/cryptocurrency-exchange-rain-granted-license-bahrains-central-bank',
  },
]

export function QuotesSection() {
  return (
    <section id="quotes" className="py-16 sm:py-20 bg-bg-surface" aria-labelledby="quotes-heading">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <p className="font-mono text-gold uppercase tracking-widest text-[length:var(--text-xs)] mb-4 text-center">
          What the Industry Says
        </p>
        <h2
          id="quotes-heading"
          className="font-display font-bold text-text tracking-tight text-center max-w-2xl mx-auto mb-10"
          style={{ fontSize: 'var(--text-xl)' }}
        >
          The regulators and the regulated agree: compliance is the moat.
        </h2>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {QUOTES.map((quote, i) => {
            const parts = quote.text.split(quote.highlight)
            return (
              <div
                key={i}
                className="bg-bg-primary border border-border rounded-xl p-5 flex flex-col"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="var(--gold)" className="mb-3 shrink-0" aria-hidden="true">
                  <path d="M4.583 17.321C3.553 16.227 3 15 3 13.011c0-3.5 2.457-6.637 6.03-8.188l.893 1.378c-3.335 1.804-3.987 4.145-4.247 5.621.537-.278 1.24-.375 1.929-.311 1.804.167 3.226 1.648 3.226 3.489a3.5 3.5 0 01-3.5 3.5c-1.073 0-2.099-.49-2.748-1.179zm10 0C13.553 16.227 13 15 13 13.011c0-3.5 2.457-6.637 6.03-8.188l.893 1.378c-3.335 1.804-3.987 4.145-4.247 5.621.537-.278 1.24-.375 1.929-.311 1.804.167 3.226 1.648 3.226 3.489a3.5 3.5 0 01-3.5 3.5c-1.073 0-2.099-.49-2.748-1.179z" />
                </svg>
                <p className="text-text-muted text-[length:var(--text-sm)] leading-relaxed flex-1">
                  &ldquo;...{parts[0]}<strong className="text-text font-semibold">{quote.highlight}</strong>{parts[1]}...&rdquo;
                </p>
                <div className="mt-3 pt-3 border-t border-border flex items-center justify-between gap-2">
                  <div>
                    <p className="text-text font-medium text-[length:var(--text-xs)]">{quote.author}</p>
                    <p className="text-text-faint text-[length:var(--text-xs)]">{quote.title}</p>
                  </div>
                  <a
                    href={quote.sourceUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-gold text-[length:var(--text-xs)] hover:underline shrink-0"
                    aria-label={`Source for ${quote.author} quote`}
                  >
                    &#8599;
                  </a>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
