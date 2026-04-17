import { UpgradeBanner } from './UpgradeBanner'

interface Props { jurisdictions: string[] }

const CALENDLY_URL = process.env.NEXT_PUBLIC_CALENDLY_URL ?? 'https://calendly.com/odey-qemal/zawda-advisory'

const CREDENTIALS = [
  'Founder, Zawda — MENA regulatory intelligence',
  'Authored compliance frameworks for VARA, ADGM, and CBB-licensed entities',
  'Direct working relationships with regulators across the UAE, Bahrain, Saudi Arabia, and Qatar',
  'Prior work: fintech licensing strategy, AML/CFT program design, enforcement response',
]

const SESSION_TYPES = [
  { length: '45 min', label: 'Licensing Strategy', detail: 'Jurisdiction selection, license scoping, capital and activity perimeter.' },
  { length: '45 min', label: 'Enforcement Response', detail: 'Respond to regulator inquiries, Section 83 notices, or supervisory findings.' },
  { length: '60 min', label: 'Pre-Submission Review', detail: 'Line-by-line review of an application file before you submit.' },
]

export function AdvisorySessionsView(_props: Props) {
  return (
    <div className="space-y-6">
      <div>
        <div className="inline-block px-2.5 py-1 bg-gold/10 text-gold text-[length:var(--text-xs)] font-bold uppercase rounded mb-3">Exclusive Tier</div>
        <h1 className="font-display font-bold text-text text-[length:var(--text-lg)]">Advisory Sessions</h1>
        <p className="text-text-muted text-[length:var(--text-sm)] mt-1">One line to the founder. No delegation, no juniors, no handoffs.</p>
      </div>

      <UpgradeBanner title="Advisory Sessions" />

      <div className="bg-bg-primary border border-border rounded-2xl p-6 sm:p-8">
        <div className="flex items-start gap-5">
          <div className="w-14 h-14 rounded-full bg-gold-light flex items-center justify-center shrink-0">
            <span className="text-gold font-display font-bold text-[length:var(--text-lg)]">OQ</span>
          </div>
          <div className="min-w-0">
            <p className="font-mono text-gold uppercase tracking-widest text-[length:var(--text-xs)]">Your Advisor</p>
            <p className="text-text font-display font-bold text-[length:var(--text-base)] mt-1">Odey Qemal</p>
            <p className="text-text-muted text-[length:var(--text-xs)]">Founder, Zawda</p>
          </div>
        </div>

        <ul className="mt-6 space-y-2.5">
          {CREDENTIALS.map((c) => (
            <li key={c} className="flex items-start gap-2.5 text-text-muted text-[length:var(--text-sm)] leading-relaxed">
              <span className="text-gold mt-0.5 shrink-0" aria-hidden="true">◆</span>
              <span>{c}</span>
            </li>
          ))}
        </ul>

        <div className="mt-7 pt-6 border-t border-border">
          <p className="font-mono text-text-faint uppercase tracking-widest text-[length:var(--text-xs)] mb-4">Book a session</p>
          <div className="grid sm:grid-cols-3 gap-3 mb-5">
            {SESSION_TYPES.map((s) => (
              <div key={s.label} className="bg-bg-surface rounded-xl p-4">
                <p className="font-mono text-gold text-[length:var(--text-xs)]">{s.length}</p>
                <p className="text-text font-medium text-[length:var(--text-sm)] mt-1">{s.label}</p>
                <p className="text-text-faint text-[length:var(--text-xs)] mt-1.5 leading-relaxed">{s.detail}</p>
              </div>
            ))}
          </div>
          <a
            href={CALENDLY_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-gold text-white text-[length:var(--text-sm)] font-medium rounded-xl hover:brightness-110 transition-all"
          >
            Open Calendar &rarr;
          </a>
          <p className="text-text-faint text-[length:var(--text-xs)] mt-3 leading-relaxed">
            Availability is limited. Sessions are held on Calendly and run as private 1:1 video calls.
          </p>
        </div>
      </div>
    </div>
  )
}
