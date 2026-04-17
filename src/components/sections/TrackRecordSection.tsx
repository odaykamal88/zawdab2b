export function TrackRecordSection() {
  const TIMELINE = [
    { title: 'Wolf Accelerator + Axiom Capital', description: '$450K raised. First institutional-grade digital asset advisory in the region.' },
    { title: 'CBB Category 3 Provisional License', description: 'Application submitted for Central Bank of Bahrain Category 3 provisional license — one of the first in the digital asset advisory space.' },
    { title: 'THNDR — Early Conversations', description: 'Engaged with THNDR on institutional Bitcoin infrastructure for the GCC market.' },
    { title: '3 Companies Licensed', description: 'Guided three companies through the MENA digital asset licensing process — VARA, ADGM, and CBB frameworks.' },
    { title: '21+ Institutional Buyers', description: '21+ institutional buyers facilitated with approximately 100 BTC acquired at institutional OTC rates.' },
    { title: '15–20% OTC Cost Reduction', description: 'Achieved 15–20% cost reduction vs retail exchange rates through institutional OTC desk relationships.' },
  ]

  return (
    <section id="track-record" className="py-20 sm:py-28 bg-bg-surface" aria-labelledby="track-heading">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <p className="font-mono text-gold uppercase tracking-widest text-[length:var(--text-xs)] mb-4">Track Record</p>
        <h2 id="track-heading" className="font-display font-bold text-text tracking-tight max-w-2xl" style={{ fontSize: 'var(--text-xl)' }}>
          Built in the Trenches, Not the Classroom.
        </h2>

        <div className="relative mt-12 ml-4 sm:ml-8">
          <div className="absolute left-0 top-0 bottom-0 w-0.5 bg-gold/30" aria-hidden="true" />
          <div className="space-y-10">
            {TIMELINE.map((item, i) => (
              <div key={i} className="relative pl-8">
                <div className="absolute left-[-5px] top-1.5 w-[10px] h-[10px] rounded-full bg-gold border-2 border-bg-surface" aria-hidden="true" />
                <h3 className="font-display font-bold text-text text-[length:var(--text-base)]">{item.title}</h3>
                <p className="text-text-muted text-[length:var(--text-sm)] mt-1 leading-relaxed">{item.description}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-12 border-l-4 border-l-gold bg-bg-primary rounded-lg p-6 max-w-3xl">
          <p className="text-text text-[length:var(--text-base)] leading-relaxed italic">
            &ldquo;This is not a compliance firm that read about VARA in a blog post. This is a team that has filed
            the applications, negotiated the OTC rates, and sat in the regulator&rsquo;s office.&rdquo;
          </p>
        </div>
      </div>
    </section>
  )
}
