export function PainSection() {
  return (
    <section id="pain" className="py-20 sm:py-28 bg-bg-surface" aria-labelledby="pain-heading">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <p className="font-mono text-gold uppercase tracking-widest text-[length:var(--text-xs)] mb-4">
          The Cost of Getting It Wrong
        </p>
        <h2
          id="pain-heading"
          className="font-display font-bold text-text tracking-tight max-w-3xl"
          style={{ fontSize: 'var(--text-xl)' }}
        >
          Cease and desist. Fines. License revocation. MENA regulators are enforcing — not warning.
        </h2>
        <p className="text-text-muted text-[length:var(--text-base)] mt-3 max-w-2xl">
          Across Dubai, Abu Dhabi, and Bahrain, regulators have moved from frameworks to enforcement. If your firm handles virtual assets without full compliance, the question is not <em>if</em> enforcement reaches you — it&rsquo;s <em>when</em>.
        </p>

        {/* Enforcement stat cards */}
        <div className="grid sm:grid-cols-4 gap-5 mt-12">
          {/* Source: ADGM FSRA (HAYVN Group $8.85M, Apr 2025) + VARA enforcement notices (AED 7.5M marketing fines Jun 2025; 19 firms penalised Oct 2025) */}
          <div className="bg-bg-primary border border-border border-l-4 border-l-alert rounded-lg p-6">
            <span className="font-mono text-alert font-bold text-[length:var(--text-xl)]">
              $12M+
            </span>
            <p className="text-text mt-2 font-medium text-[length:var(--text-sm)]">Aggregate MENA fines</p>
            <p className="text-text-muted text-[length:var(--text-xs)] mt-1">
              Combined VARA and ADGM penalties since 2025 — including an $8.85M ADGM fine and 19 firms sanctioned by VARA in a single action.
            </p>
          </div>

          <div className="bg-bg-primary border border-border border-l-4 border-l-alert rounded-lg p-6">
            <span className="font-mono text-alert font-bold text-[length:var(--text-xl)]">
              40+ Firms
            </span>
            <p className="text-text mt-2 font-medium text-[length:var(--text-sm)]">Enforcement actions</p>
            <p className="text-text-muted text-[length:var(--text-xs)] mt-1">
              Over 40 firms across MENA received cease-and-desist orders, public censures, or had licenses suspended in the last year.
            </p>
          </div>

          {/* Source: fatf-gafi.org — Travel Rule deadline */}
          <div className="bg-bg-primary border border-border border-l-4 border-l-gold rounded-lg p-6">
            <span className="font-mono text-gold font-bold text-[length:var(--text-xl)]">
              In effect
            </span>
            <p className="text-text mt-2 font-medium text-[length:var(--text-sm)]">Travel Rule enforcement</p>
            <p className="text-text-muted text-[length:var(--text-xs)] mt-1">
              The FATF Travel Rule has been enforced across MENA jurisdictions since March 2026. Non-compliant VASPs face license suspension or revocation.
            </p>
          </div>

          {/* Source: Notabene State of Crypto Travel Rule Compliance 2024 */}
          <div className="bg-bg-primary border border-border border-l-4 border-l-gold rounded-lg p-6">
            <span className="font-mono text-gold font-bold text-[length:var(--text-xl)]">
              37%
            </span>
            <p className="text-text mt-2 font-medium text-[length:var(--text-sm)]">VASPs unprepared</p>
            <p className="text-text-muted text-[length:var(--text-xs)] mt-1">
              37% of VASPs have never received a Travel Rule transfer. Most have no IVMS 101 solution in place.
            </p>
          </div>
        </div>

        {/* Enforcement escalation timeline */}
        <div className="mt-12 bg-bg-primary border border-border rounded-2xl p-8">
          <h3 className="font-display font-bold text-text text-[length:var(--text-lg)] mb-6">
            How MENA enforcement escalates — and what it costs
          </h3>
          <div className="grid sm:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="w-10 h-10 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center mx-auto font-mono font-bold text-[length:var(--text-sm)]">1</div>
              <p className="text-text font-medium text-[length:var(--text-sm)] mt-3">Warning Letter</p>
              <p className="text-text-muted text-[length:var(--text-xs)] mt-1">Formal notice to cease unlicensed activity within a stated period.</p>
            </div>
            <div className="text-center">
              <div className="w-10 h-10 rounded-full bg-orange-50 text-orange-600 flex items-center justify-center mx-auto font-mono font-bold text-[length:var(--text-sm)]">2</div>
              <p className="text-text font-medium text-[length:var(--text-sm)] mt-3">Financial Penalty</p>
              <p className="text-text-muted text-[length:var(--text-xs)] mt-1">Fines up to AED 10M (VARA), $25M (ADGM), or BHD 1M (CBB) per violation.</p>
            </div>
            <div className="text-center">
              <div className="w-10 h-10 rounded-full bg-red-50 text-red-600 flex items-center justify-center mx-auto font-mono font-bold text-[length:var(--text-sm)]">3</div>
              <p className="text-text font-medium text-[length:var(--text-sm)] mt-3">License Suspension</p>
              <p className="text-text-muted text-[length:var(--text-xs)] mt-1">Operations halted. Client funds frozen. Revenue stops immediately.</p>
            </div>
            <div className="text-center">
              <div className="w-10 h-10 rounded-full bg-red-100 text-red-700 flex items-center justify-center mx-auto font-mono font-bold text-[length:var(--text-sm)]">4</div>
              <p className="text-text font-medium text-[length:var(--text-sm)] mt-3">License Revocation</p>
              <p className="text-text-muted text-[length:var(--text-xs)] mt-1">Permanent ban. Public censure. Directors may face personal liability.</p>
            </div>
          </div>
        </div>

        {/* Who's exposed */}
        <div className="grid md:grid-cols-2 gap-8 mt-10">
          <div className="bg-bg-primary border border-border rounded-lg p-8">
            <h3 className="font-display font-bold text-text text-[length:var(--text-lg)] mb-4">
              If this is you, you&rsquo;re exposed
            </h3>
            <ul className="space-y-3 text-text-muted text-[length:var(--text-base)]">
              <li className="flex items-start gap-3"><span className="text-alert mt-1">&#9679;</span>Operating a VASP without a full license in any MENA jurisdiction</li>
              <li className="flex items-start gap-3"><span className="text-alert mt-1">&#9679;</span>Marketing virtual asset services without regulator-approved materials</li>
              <li className="flex items-start gap-3"><span className="text-alert mt-1">&#9679;</span>No Travel Rule solution now that enforcement is in effect (since March 2026)</li>
              <li className="flex items-start gap-3"><span className="text-alert mt-1">&#9679;</span>Board reporting that doesn&rsquo;t cover digital asset regulatory risk</li>
              <li className="flex items-start gap-3"><span className="text-alert mt-1">&#9679;</span>Holding digital assets on balance sheet without compliant custody and AML framework</li>
            </ul>
          </div>
          <div className="bg-bg-primary border border-border rounded-lg p-8">
            <h3 className="font-display font-bold text-text text-[length:var(--text-lg)] mb-4">
              What MENA regulators are actively auditing
            </h3>
            <ul className="space-y-3 text-text-muted text-[length:var(--text-base)]">
              <li className="flex items-start gap-3"><span className="text-gold mt-1">&#9679;</span><strong>Travel Rule readiness</strong> — originator/beneficiary data on every transfer above threshold</li>
              <li className="flex items-start gap-3"><span className="text-gold mt-1">&#9679;</span><strong>Unlicensed promotion</strong> — regulators across the region are targeting social media, websites, and events</li>
              <li className="flex items-start gap-3"><span className="text-gold mt-1">&#9679;</span><strong>Custody segregation</strong> — proof that client assets are separated and auditable</li>
              <li className="flex items-start gap-3"><span className="text-gold mt-1">&#9679;</span><strong>SAR filing cadence</strong> — regulators expect timely suspicious activity reports, not batch filings</li>
              <li className="flex items-start gap-3"><span className="text-gold mt-1">&#9679;</span><strong>MLRO appointment</strong> — named, qualified Money Laundering Reporting Officer on record</li>
            </ul>
          </div>
        </div>
      </div>
    </section>
  )
}
