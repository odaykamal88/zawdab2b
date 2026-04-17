import { BrandName } from '@/components/ui/BrandName'
import Link from 'next/link'

export const metadata = {
  title: 'Service Level Agreement | Zawda',
  description: 'Service Level Agreement for the Zawda regulatory intelligence and compliance platform.',
}

export default function SlaPage() {
  return (
    <div className="min-h-screen bg-bg-primary">
      {/* Nav */}
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

      {/* Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-12 sm:py-16">
        <h1 className="font-display font-bold text-text tracking-tight text-[length:var(--text-xl)] mb-2">Service Level Agreement</h1>
        <p className="text-text-muted text-[length:var(--text-sm)] mb-1">Effective Date: April 13, 2026 &middot; Last Updated: April 13, 2026</p>
        <p className="text-text-muted text-[length:var(--text-sm)] mb-10">Applies To: Professional, Navigator, Enterprise Intelligence, and Enterprise Subscribers</p>

        <div className="prose-zawda space-y-10">
          {/* Section 1 */}
          <Section title="1. Overview">
            <P>This Service Level Agreement (&quot;SLA&quot;) defines the service commitments, response times, and remedies applicable to paid subscribers of the Zawda platform. This SLA is incorporated by reference into the Zawda <Link href="/terms" className="text-gold hover:underline">Terms of Service</Link>.</P>
            <P>Free-tier users (Watchlist, Assessment) are not covered by this SLA and receive support on a best-effort basis only.</P>
          </Section>

          {/* Section 2 */}
          <Section title="2. Platform Availability">
            <H3>2.1 Uptime Commitment</H3>
            <Table headers={['Tier', 'Monthly Uptime Target']} rows={[
              ['Professional / Navigator', '99.5%'],
              ['Enterprise Intelligence / Enterprise', '99.9%'],
            ]} />
            <P><strong className="text-text">&quot;Uptime&quot;</strong> is measured as the percentage of total minutes in a calendar month during which the Platform&#39;s core services (dashboard, alerts, API) are operational and accessible, excluding Excluded Downtime as defined below.</P>
            <P><strong className="text-text">Calculation:</strong> Uptime % = ((Total minutes in month - Unscheduled downtime minutes) / Total minutes in month) x 100</P>

            <H3>2.2 Excluded Downtime</H3>
            <P>The following are excluded from uptime calculations:</P>
            <ul className="list-disc pl-5 space-y-1 text-text-muted text-[length:var(--text-sm)]">
              <li>Scheduled maintenance windows (communicated at least 48 hours in advance)</li>
              <li>Force majeure events (as defined in Section 8.1)</li>
              <li>Third-party service outages beyond Zawda&#39;s reasonable control (cloud providers, DNS, CDNs)</li>
              <li>Issues caused by User&#39;s equipment, network, or software</li>
              <li>Regulatory authority website outages affecting data collection</li>
              <li>Downtime resulting from User&#39;s actions or requests</li>
            </ul>

            <H3>2.3 Scheduled Maintenance</H3>
            <ul className="list-disc pl-5 space-y-1 text-text-muted text-[length:var(--text-sm)]">
              <li>Maintenance windows are scheduled during low-usage periods (typically Fridays 00:00&#8211;06:00 GST)</li>
              <li>Advance notice: minimum 48 hours for routine maintenance, 24 hours for urgent security patches</li>
              <li>Maximum scheduled downtime: 4 hours per calendar month</li>
              <li>Emergency security patches may be applied outside scheduled windows with best-effort advance notice</li>
            </ul>
          </Section>

          {/* Section 3 */}
          <Section title="3. Alert Delivery">
            <H3>3.1 Regulatory Alert Timeliness</H3>
            <Table headers={['Alert Type', 'Delivery Target', 'Channel']} rows={[
              ['Critical enforcement actions', 'Within 4 hours of source publication', 'Telegram + Dashboard'],
              ['Regulatory changes (new rules, amendments)', 'Within 24 hours of source publication', 'Telegram + Dashboard'],
              ['Filing deadline reminders', '7 days before due date', 'Telegram + Dashboard'],
              ['Weekly digest', 'Every Monday by 09:00 GST', 'Email'],
            ]} />

            <H3>3.2 Alert Delivery Disclaimer</H3>
            <div className="bg-bg-surface border border-border rounded-xl p-4">
              <P><strong className="text-text">Alert delivery targets are best-effort commitments, not guarantees.</strong> Actual delivery times depend on when the source regulatory authority publishes the information, availability and accessibility of regulator websites, translation requirements for non-English publications, and volume of simultaneous regulatory activity.</P>
              <P>Zawda is not liable for delays caused by late publication by regulators, regulator website outages, or changes communicated through informal or non-public channels.</P>
            </div>

            <H3>3.3 Alert Accuracy</H3>
            <ul className="list-disc pl-5 space-y-1 text-text-muted text-[length:var(--text-sm)]">
              <li>Alerts are <strong className="text-text">informational summaries</strong> derived from official regulator publications, not official regulatory text</li>
              <li>Zawda endeavors to ensure alerts are accurate but does not warrant completeness or error-free content</li>
              <li>Users must verify all alerts against primary regulatory sources before taking action</li>
              <li>Alerts do not constitute regulatory advice and should not be relied upon as such</li>
            </ul>

            <H3>3.4 Jurisdictions Covered</H3>
            <P>Alert coverage includes the following MENA jurisdictions (as of the effective date):</P>
            <div className="grid sm:grid-cols-2 gap-1">
              {[
                'Dubai (VARA)', 'Abu Dhabi (ADGM / FSRA)', 'UAE Federal (CBUAE, SCA)', 'Bahrain (CBB)',
                'Saudi Arabia (CMA, SAMA)', 'Qatar (QFC, QFCRA)', 'Oman (CMA-OM)', 'Kuwait (CMA-KW, CBK)',
              ].map(j => (
                <p key={j} className="text-text-muted text-[length:var(--text-sm)]">&bull; {j}</p>
              ))}
            </div>
            <P>Additional jurisdictions may be added over time. Zawda does not guarantee coverage of every regulatory action in every jurisdiction at all times.</P>
          </Section>

          {/* Section 4 */}
          <Section title="4. Support">
            <H3>4.1 Response Time Commitments</H3>
            <Table headers={['Severity', 'Description', 'Professional / Navigator', 'Enterprise']} rows={[
              ['Critical', 'Platform inaccessible, confirmed data loss', '24 hours', '4 hours'],
              ['High', 'Major feature degraded, alerts delayed >4h', '48 hours', '8 hours'],
              ['Medium', 'Non-critical feature issue, minor defect', '72 hours', '24 hours'],
              ['Low', 'General inquiry, feature request, feedback', '5 business days', '48 hours'],
            ]} />

            <H3>4.2 Definitions</H3>
            <ul className="list-disc pl-5 space-y-2 text-text-muted text-[length:var(--text-sm)]">
              <li><strong className="text-text">&quot;Response&quot;</strong> means an initial acknowledgement from Zawda&#39;s support team confirming receipt of the issue and providing an estimated timeframe for resolution. Response does not mean the issue is resolved.</li>
              <li><strong className="text-text">&quot;Resolution&quot;</strong> means the issue is resolved or a reasonable workaround is provided.</li>
              <li><strong className="text-text">&quot;Business hours&quot;</strong> are Sunday through Thursday, 09:00&#8211;18:00 Gulf Standard Time (GST/UTC+4), excluding UAE public holidays. The response time clock starts when a request is received during business hours. Requests received outside business hours are treated as received at the start of the next business day.</li>
            </ul>

            <H3>4.3 Support Channels</H3>
            <Table headers={['Tier', 'Channels']} rows={[
              ['Professional / Navigator', 'Email (support@zawda.com)'],
              ['Enterprise Intelligence', 'Email + Priority queue'],
              ['Enterprise', 'Email + Dedicated Slack/Teams channel + Phone'],
            ]} />

            <H3>4.4 Escalation</H3>
            <P>If a support request is not resolved within the committed timeframe, Users may escalate by:</P>
            <ol className="list-decimal pl-5 space-y-1 text-text-muted text-[length:var(--text-sm)]">
              <li>Replying to the support thread with &quot;ESCALATE&quot; in the subject line</li>
              <li>Escalated issues are acknowledged by senior management within 4 business hours</li>
              <li>A revised resolution timeline is provided within 1 business day of escalation</li>
            </ol>
          </Section>

          {/* Section 5 */}
          <Section title="5. Advisory Services (Navigator and Enterprise Tiers)">
            <H3>5.1 Advisory Access</H3>
            <Table headers={['Tier', 'Advisory Access']} rows={[
              ['Navigator', 'Asynchronous advisory via Platform (48-hour response during business hours)'],
              ['Enterprise', 'Dedicated compliance liaison + scheduled calls'],
            ]} />

            <H3>5.2 Advisory Scope</H3>
            <P><strong className="text-text">Advisory services are limited to operational guidance, regulatory interpretation at a general level, document review feedback, and process recommendations.</strong> Specifically, advisory services include:</P>
            <ul className="list-disc pl-5 space-y-1 text-text-muted text-[length:var(--text-sm)]">
              <li>Licensing roadmap guidance and milestone tracking</li>
              <li>Document review feedback (operational feedback, not legal review)</li>
              <li>Compliance framework recommendations</li>
              <li>Jurisdiction selection guidance based on publicly available information</li>
              <li>General regulatory interpretation and plain-language summaries</li>
            </ul>
            <P>Advisory services do not include legal review, formal sign-off, professional certification, or any form of binding opinion.</P>

            <H3>5.3 Advisory Exclusions</H3>
            <P>Advisory services <strong className="text-text">do not include</strong> and shall not be construed as providing:</P>
            <ul className="list-disc pl-5 space-y-1 text-text-muted text-[length:var(--text-sm)]">
              <li>Legal advice, legal opinions, or legal representation</li>
              <li>Direct communication with regulators on the User&#39;s behalf</li>
              <li>Drafting of legal documents (contracts, agreements, legal submissions)</li>
              <li>Representation in enforcement proceedings or regulatory hearings</li>
              <li>Tax advice, tax structuring, or tax planning recommendations</li>
              <li>Guaranteed regulatory outcomes or approval assurances</li>
              <li>Acting as the User&#39;s compliance officer of record, MLRO, or outsourced governance function</li>
              <li>Formal audit services or audit certification</li>
            </ul>

            <H3>5.4 User Responsibility</H3>
            <P>Users acknowledge that advisory services are supplementary to, and not a replacement for, the User&#39;s own internal compliance function and independent professional advisors. All decisions based on advisory input remain the sole responsibility of the User.</P>
          </Section>

          {/* Section 6 */}
          <Section title="6. Data and Security">
            <H3>6.1 Encryption</H3>
            <ul className="list-disc pl-5 space-y-1 text-text-muted text-[length:var(--text-sm)]">
              <li>All data in transit: TLS 1.2+ encryption</li>
              <li>All data at rest: AES-256 encryption</li>
              <li>Document vault: End-to-end encryption (Enterprise tier)</li>
            </ul>

            <H3>6.2 Access Controls</H3>
            <ul className="list-disc pl-5 space-y-1 text-text-muted text-[length:var(--text-sm)]">
              <li>Role-based access controls for all Platform features</li>
              <li>Multi-factor authentication (MFA) available for all accounts, required for Enterprise</li>
              <li>Audit logging of access events and material changes</li>
            </ul>

            <H3>6.3 Data Backup</H3>
            <ul className="list-disc pl-5 space-y-1 text-text-muted text-[length:var(--text-sm)]">
              <li>Daily automated backups with 30-day retention</li>
              <li>Point-in-time recovery capability</li>
              <li>Backup data encrypted to the same standard as production data</li>
            </ul>

            <H3>6.4 Data Segregation</H3>
            <P>User data is logically segregated. No User can access another User&#39;s data through the Platform.</P>

            <H3>6.5 Incident Response</H3>
            <P>In the event of a confirmed security incident affecting User data:</P>
            <ul className="list-disc pl-5 space-y-1 text-text-muted text-[length:var(--text-sm)]">
              <li>Initial notification to affected Users within 72 hours of confirmation</li>
              <li>Detailed incident report within 14 days, including scope, impact, root cause, and remediation steps</li>
              <li>Remediation plan shared with affected Users</li>
              <li>Cooperation with User&#39;s own incident response processes upon reasonable request</li>
            </ul>

            <H3>6.6 Security Testing</H3>
            <P>Zawda conducts regular security assessments, including:</P>
            <ul className="list-disc pl-5 space-y-1 text-text-muted text-[length:var(--text-sm)]">
              <li>Annual third-party penetration testing</li>
              <li>Continuous automated vulnerability scanning</li>
              <li>Security review of material code changes</li>
            </ul>
            <P>Results of security assessments are available to Enterprise subscribers upon request under NDA.</P>
          </Section>

          {/* Section 7 */}
          <Section title="7. Service Credits">
            <H3>7.1 Eligibility</H3>
            <P>If Zawda fails to meet the uptime commitments in Section 2, affected paid subscribers in good standing (no overdue invoices) may request service credits as described below.</P>

            <H3>7.2 Credit Schedule &#8212; Professional / Navigator Tiers</H3>
            <Table headers={['Monthly Uptime Achieved', 'Service Credit (% of monthly fee)']} rows={[
              ['99.0% to below 99.5%', '10%'],
              ['95.0% to below 99.0%', '25%'],
              ['Below 95.0%', '50%'],
            ]} />

            <H3>7.3 Credit Schedule &#8212; Enterprise Tiers</H3>
            <Table headers={['Monthly Uptime Achieved', 'Service Credit (% of monthly fee)']} rows={[
              ['99.5% to below 99.9%', '10%'],
              ['99.0% to below 99.5%', '25%'],
              ['95.0% to below 99.0%', '50%'],
              ['Below 95.0%', '100%'],
            ]} />

            <H3>7.4 Credit Limitations</H3>
            <ul className="list-disc pl-5 space-y-1 text-text-muted text-[length:var(--text-sm)]">
              <li>Service credits are the <strong className="text-text">sole and exclusive remedy</strong> for failure to meet uptime commitments</li>
              <li>Credits are applied to future billing periods and are not redeemable for cash or refund</li>
              <li>Maximum credit in any single calendar month: 100% of that month&#39;s subscription fee</li>
              <li>Credits must be requested within 30 calendar days of the end of the affected month</li>
              <li>Credits do not apply to free-tier users or accounts with overdue invoices</li>
              <li>Credits do not carry over beyond 12 months</li>
            </ul>

            <H3>7.5 Credit Request Process</H3>
            <P>To request a service credit:</P>
            <ol className="list-decimal pl-5 space-y-1.5 text-text-muted text-[length:var(--text-sm)]">
              <li>Email support@zawda.com with subject line <strong className="text-text">&quot;SLA Credit Request &#8212; [Month/Year]&quot;</strong></li>
              <li>
                Include in your request:
                <ul className="list-disc pl-5 mt-1 space-y-0.5">
                  <li>Account email address and organization name</li>
                  <li>Affected dates and times (with timezone)</li>
                  <li>Description of the service disruption experienced</li>
                  <li>Screenshots, error messages, or logs where available</li>
                </ul>
              </li>
              <li>Zawda will review the request and respond within <strong className="text-text">10 business days</strong></li>
              <li>If approved, the credit will be applied to the next billing cycle</li>
            </ol>
          </Section>

          {/* Section 8 */}
          <Section title="8. Exclusions and Limitations">
            <H3>8.1 Force Majeure</H3>
            <P>Zawda shall not be liable for any failure to meet SLA commitments due to circumstances beyond its reasonable control, including but not limited to:</P>
            <ul className="list-disc pl-5 space-y-1 text-text-muted text-[length:var(--text-sm)]">
              <li>Natural disasters, epidemics, pandemics</li>
              <li>Government orders, sanctions, embargoes, or regulatory actions</li>
              <li>War, terrorism, civil unrest, or armed conflict</li>
              <li>Internet or telecommunications infrastructure failures affecting multiple providers</li>
              <li>Cyberattacks against third-party infrastructure (cloud providers, DNS, CDN)</li>
              <li>Regulatory authority website unavailability or delayed publication</li>
            </ul>

            <H3>8.2 User Responsibilities</H3>
            <P>This SLA assumes that Users:</P>
            <ul className="list-disc pl-5 space-y-1 text-text-muted text-[length:var(--text-sm)]">
              <li>Use the Platform in accordance with the Terms of Service</li>
              <li>Maintain adequate internet connectivity and compatible devices</li>
              <li>Keep their account credentials secure and enable MFA where recommended</li>
              <li>Report issues promptly through designated support channels</li>
              <li>Provide accurate information when submitting support requests</li>
            </ul>

            <H3>8.3 Regulatory Intelligence Limitations</H3>
            <P>Zawda&#39;s regulatory intelligence is derived from monitoring publicly available regulatory sources. This SLA does not guarantee:</P>
            <ul className="list-disc pl-5 space-y-1 text-text-muted text-[length:var(--text-sm)]">
              <li>Discovery of every regulatory action, consultation, or guidance document across all jurisdictions</li>
              <li>Real-time monitoring of regulators that do not publish information online</li>
              <li>Coverage of informal regulatory guidance, verbal communications, or non-public directives</li>
              <li>Translation accuracy for non-English regulatory publications</li>
              <li>Coverage of regulatory changes published exclusively in Arabic or other non-English languages, where translation delays may apply</li>
            </ul>
          </Section>

          {/* Section 9 */}
          <Section title="9. Separation of Commitments">
            <H3>9.1 Platform Uptime vs. Advisory Response</H3>
            <P>Platform uptime commitments (Section 2) and advisory response commitments (Section 5) are separate and independent. An advisory response delay does not constitute a platform availability failure, and vice versa.</P>

            <H3>9.2 Alert Delivery vs. Platform Uptime</H3>
            <P>Alert delivery targets (Section 3) are best-effort commitments that depend on third-party source availability. Alert delivery delays caused by source-side issues do not constitute a platform availability failure for the purposes of service credits.</P>
          </Section>

          {/* Section 10 */}
          <Section title="10. SLA Modifications">
            <P>Zawda reserves the right to modify this SLA with 30 days&#39; written notice to affected subscribers. Changes that materially reduce service commitments will not apply to existing subscribers until their next subscription renewal period. Continued use of the Platform after the effective date of any SLA modification constitutes acceptance of the updated SLA.</P>
          </Section>

          {/* Section 11 */}
          <Section title="11. Contact">
            <ul className="space-y-1 text-text-muted text-[length:var(--text-sm)]">
              <li><strong className="text-text">Support:</strong> support@zawda.com</li>
              <li><strong className="text-text">Enterprise Hotline:</strong> Provided directly to Enterprise subscribers upon onboarding</li>
            </ul>
          </Section>
        </div>

        {/* Related links */}
        <div className="mt-16 pt-8 border-t border-border flex flex-col sm:flex-row gap-4">
          <Link href="/terms" className="text-gold hover:underline text-[length:var(--text-sm)] font-medium">
            Terms of Service &#8594;
          </Link>
          <Link href="/" className="text-text-muted hover:text-text text-[length:var(--text-sm)] transition-colors">
            Back to Home
          </Link>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-border py-8 bg-bg-surface">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center">
          <p className="text-text-faint text-[length:var(--text-xs)]">
            &copy; {new Date().getFullYear()} <BrandName />. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  )
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="space-y-4">
      <h2 className="font-display font-bold text-text text-[length:var(--text-lg)] pt-2">{title}</h2>
      {children}
    </section>
  )
}

function H3({ children }: { children: React.ReactNode }) {
  return <h3 className="font-display font-semibold text-text text-[length:var(--text-base)] mt-5 mb-1">{children}</h3>
}

function P({ children }: { children: React.ReactNode }) {
  return <p className="text-text-muted text-[length:var(--text-sm)] leading-relaxed">{children}</p>
}

function Table({ headers, rows }: { headers: string[]; rows: string[][] }) {
  return (
    <div className="overflow-x-auto rounded-xl border border-border">
      <table className="w-full text-[length:var(--text-sm)]">
        <thead>
          <tr className="bg-bg-surface">
            {headers.map((h, i) => (
              <th key={i} className="text-left text-text font-semibold px-4 py-2.5 border-b border-border">{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, ri) => (
            <tr key={ri} className={ri % 2 === 1 ? 'bg-bg-surface/50' : ''}>
              {row.map((cell, ci) => (
                <td key={ci} className="text-text-muted px-4 py-2.5 border-b border-border last:border-b-0">{cell}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
