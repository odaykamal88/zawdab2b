import { BrandName } from '@/components/ui/BrandName'
import Link from 'next/link'

export const metadata = {
  title: 'Terms of Service | Zawda',
  description: 'Terms of Service for the Zawda regulatory intelligence and compliance platform.',
}

export default function TermsPage() {
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
        <h1 className="font-display font-bold text-text tracking-tight text-[length:var(--text-xl)] mb-2">Terms of Service</h1>
        <p className="text-text-muted text-[length:var(--text-sm)] mb-10">Effective Date: April 13, 2026 &middot; Last Updated: April 13, 2026</p>

        <div className="prose-zawda space-y-10">
          {/* Section 1 */}
          <Section title="1. Definitions">
            <ul className="list-disc pl-5 space-y-1.5 text-text-muted text-[length:var(--text-sm)] leading-relaxed">
              <li><strong className="text-text">&quot;Zawda&quot;</strong>, <strong className="text-text">&quot;we&quot;</strong>, <strong className="text-text">&quot;us&quot;</strong>, or <strong className="text-text">&quot;our&quot;</strong> refers to the entity operating the Zawda platform.</li>
              <li><strong className="text-text">&quot;Platform&quot;</strong> refers to the Zawda web application, APIs, Telegram bot, email digests, and all related services.</li>
              <li><strong className="text-text">&quot;User&quot;</strong>, <strong className="text-text">&quot;you&quot;</strong>, or <strong className="text-text">&quot;your&quot;</strong> refers to any individual or entity accessing or using the Platform.</li>
              <li><strong className="text-text">&quot;Subscription&quot;</strong> refers to any paid or free tier of the Platform&#39;s services.</li>
              <li><strong className="text-text">&quot;Content&quot;</strong> refers to regulatory intelligence, alerts, assessments, reports, templates, roadmaps, summaries, and any other information provided through the Platform.</li>
              <li><strong className="text-text">&quot;User Content&quot;</strong> refers to documents, data, and materials uploaded to the Platform by Users.</li>
              <li><strong className="text-text">&quot;Advisory Services&quot;</strong> refers to the operational guidance, document review feedback, and compliance process support available to Navigator and Enterprise subscribers as described in the Service Level Agreement.</li>
            </ul>
          </Section>

          {/* Section 2 */}
          <Section title="2. What Zawda Is">
            <H3>2.1 Service Description</H3>
            <P>
              Zawda is a regulatory intelligence, operational compliance support, and licensing workflow platform designed for internal business use by regulated and prospective virtual asset service providers (VASPs), compliance teams, and related entities operating in the Middle East and North Africa (MENA) region. Our services include:
            </P>
            <ul className="list-disc pl-5 space-y-1 text-text-muted text-[length:var(--text-sm)]">
              <li>Real-time regulatory change monitoring across MENA jurisdictions</li>
              <li>Enforcement action tracking and alerts</li>
              <li>Compliance calendar and deadline management</li>
              <li>Licensing roadmap support and document preparation assistance</li>
              <li>Compliance process support tools</li>
              <li>Telegram and email-based regulatory alerts</li>
            </ul>

            <H3>2.2 Scope of Support</H3>
            <P>
              Zawda provides workflow and intelligence support to assist Users in managing their own compliance obligations. Zawda does not replace the User&#39;s internal compliance function, legal counsel, audit function, or regulatory filings responsibility. Users remain solely responsible for their own regulatory compliance, filings, and submissions.
            </P>
          </Section>

          {/* Section 3 */}
          <Section title="3. What Zawda Is Not">
            <H3>3.1 Not Legal, Financial, or Regulatory Advice</H3>
            <P>
              <strong className="text-text">Zawda is not a law firm, licensed financial advisor, licensed broker-dealer, regulated financial institution, registered auditor, or compliance officer of record.</strong> Nothing provided through the Platform constitutes:
            </P>
            <ul className="list-disc pl-5 space-y-1 text-text-muted text-[length:var(--text-sm)]">
              <li>Legal advice, legal opinion, or legal representation</li>
              <li>Financial advice or investment recommendations</li>
              <li>Regulatory advice or formal guidance from any regulator</li>
              <li>A formal audit or compliance certification</li>
              <li>A substitute for jurisdiction-specific advice from qualified legal counsel</li>
              <li>An assurance or guarantee of any regulatory outcome</li>
            </ul>

            <H3>3.2 Content Is Informational Only</H3>
            <P>
              All Content is <strong className="text-text">informational in nature</strong> and is provided on an &quot;as-is&quot; basis. Any reports, templates, summaries, assessments, or roadmap guidance provided through the Platform are general informational tools only and do not constitute legal advice, legal opinion, regulatory clearance, or a substitute for jurisdiction-specific advice from qualified counsel. Users must independently verify all Content and engage appropriately licensed professionals in the relevant jurisdiction before taking any regulatory, financial, or legal action.
            </P>

            <H3>3.3 No Guarantee of Regulatory Outcomes</H3>
            <P>Zawda does not guarantee, represent, or warrant that:</P>
            <ul className="list-disc pl-5 space-y-1 text-text-muted text-[length:var(--text-sm)]">
              <li>Any licensing application will be approved by any regulatory authority</li>
              <li>Any compliance program will satisfy a regulator&#39;s requirements or standards</li>
              <li>Any document, assessment, or recommendation will be accepted by any regulatory authority</li>
              <li>Users will avoid enforcement actions, fines, penalties, or sanctions</li>
              <li>Any filing prepared using the Platform will be deemed sufficient by a regulator</li>
              <li>Any activity will be classified as compliant in any particular jurisdiction</li>
              <li>Any audit will be passed or approved based on Platform guidance</li>
            </ul>
          </Section>

          {/* Section 4 */}
          <Section title="4. User Accounts and Eligibility">
            <H3>4.1 Eligibility</H3>
            <P>You must be at least 18 years old and have the legal authority to bind the entity you represent. By creating an account, you represent and warrant that you have such authority.</P>

            <H3>4.2 Account Security</H3>
            <P>You are responsible for maintaining the confidentiality of your account credentials and for all activity under your account. You must notify us immediately of any unauthorized access or suspected security breach.</P>

            <H3>4.3 Accurate Information</H3>
            <P>You agree to provide accurate, current, and complete information during registration and to keep your account information up to date. Providing false or misleading information is grounds for immediate account termination.</P>
          </Section>

          {/* Section 5 */}
          <Section title="5. Subscriptions and Billing">
            <H3>5.1 Subscription Tiers</H3>
            <P>Zawda offers multiple subscription tiers across two product lines:</P>
            <ul className="list-disc pl-5 space-y-1 text-text-muted text-[length:var(--text-sm)]">
              <li><strong className="text-text">Compliance Intelligence:</strong> Watchlist (Free), Professional, Enterprise Intelligence</li>
              <li><strong className="text-text">Licensing Navigator:</strong> Assessment (Free), Navigator, Enterprise</li>
            </ul>
            <P>Features, pricing, and limits for each tier are as described on the Platform&#39;s pricing page and may be updated from time to time.</P>

            <H3>5.2 Billing</H3>
            <ul className="list-disc pl-5 space-y-1 text-text-muted text-[length:var(--text-sm)]">
              <li>Paid subscriptions are billed monthly or annually, as selected at the time of purchase.</li>
              <li>All fees are quoted in US Dollars (USD) unless otherwise stated.</li>
              <li>Fees are non-refundable except as required by applicable law or as described in our refund policy.</li>
              <li>Payment is due at the start of each billing period. Failure to pay may result in suspension or termination of access.</li>
            </ul>

            <H3>5.3 Free Tiers</H3>
            <P>Free tier access is provided at Zawda&#39;s discretion and may be modified, limited, or discontinued at any time without notice.</P>

            <H3>5.4 Price Changes</H3>
            <P>We reserve the right to change subscription pricing. Existing subscribers will receive at least 30 days&#39; notice before any price increase takes effect on their subscription. Continued use after the effective date constitutes acceptance of the new pricing.</P>

            <H3>5.5 Cancellation</H3>
            <P>You may cancel your subscription at any time. Cancellation takes effect at the end of the current billing period. No partial refunds are provided for unused portions of a billing period.</P>
          </Section>

          {/* Section 6 */}
          <Section title="6. Acceptable Use">
            <H3>6.1 Permitted Use</H3>
            <P>You may use the Platform solely for your organization&#39;s internal compliance monitoring, regulatory intelligence, licensing support, and related legitimate business purposes.</P>

            <H3>6.2 Prohibited Use</H3>
            <P>You may not:</P>
            <ul className="list-disc pl-5 space-y-1 text-text-muted text-[length:var(--text-sm)]">
              <li>Resell, redistribute, or sublicense Platform Content to third parties</li>
              <li>Scrape, crawl, or systematically extract data from the Platform</li>
              <li>Use the Platform for any unlawful purpose or in violation of any applicable regulation</li>
              <li>Attempt to circumvent access controls, subscription limits, or security measures</li>
              <li>Upload malicious code, malware, or any content that could harm the Platform</li>
              <li>Impersonate any person, entity, or regulator</li>
              <li>Use Platform Content to create a competing product or service</li>
            </ul>

            <H3>6.3 Regulated Activity Restrictions</H3>
            <P>In addition to the general prohibitions above, you may not use the Platform to:</P>
            <ul className="list-disc pl-5 space-y-1 text-text-muted text-[length:var(--text-sm)]">
              <li>Evade or circumvent anti-money laundering (AML) or counter-terrorism financing (CFT) obligations</li>
              <li>Submit false, misleading, or fraudulent information to any regulatory authority</li>
              <li>Facilitate sanctions evasion, fraud, or unlawful structuring of activities</li>
              <li>Circumvent licensing requirements in any jurisdiction</li>
              <li>Represent Zawda Content as official regulatory guidance or legal opinion to any third party, regulator, or court</li>
            </ul>
          </Section>

          {/* Section 7 */}
          <Section title="7. Intellectual Property">
            <H3>7.1 Platform Content</H3>
            <P>All Content, software, designs, trademarks, and materials on the Platform are owned by or licensed to Zawda. Your subscription grants you a limited, non-exclusive, non-transferable license to access and use Platform Content for your internal business purposes only.</P>

            <H3>7.2 User Content</H3>
            <P>You retain ownership of documents, data, and materials you upload to the Platform. By uploading, you grant Zawda a limited license to store, process, and display such content solely to provide the Platform&#39;s services to you. This license terminates upon deletion of the User Content or termination of your account, subject to any legally required retention periods.</P>

            <H3>7.3 Feedback</H3>
            <P>Any suggestions, feedback, or ideas you provide about the Platform may be used by Zawda without obligation or compensation.</P>
          </Section>

          {/* Section 8 */}
          <Section title="8. Data Protection and Privacy">
            <H3>8.1 Data Roles</H3>
            <ul className="list-disc pl-5 space-y-1.5 text-text-muted text-[length:var(--text-sm)]">
              <li>The User is the <strong className="text-text">data controller</strong> (or data owner, where applicable) for any personal data or organizational data uploaded to the Platform.</li>
              <li>Zawda acts as a <strong className="text-text">data processor</strong> (or service provider) with respect to User Content uploaded to the Platform.</li>
              <li>Zawda acts as a <strong className="text-text">data controller</strong> for account registration data, usage analytics, and data collected to operate and improve the Platform.</li>
            </ul>

            <H3>8.2 Applicable Law</H3>
            <P>We handle personal data and organizational data in accordance with our Privacy Policy and applicable data protection laws, including:</P>
            <ul className="list-disc pl-5 space-y-1 text-text-muted text-[length:var(--text-sm)]">
              <li>UAE Federal Decree-Law No. 45 of 2021 (UAE Personal Data Protection Law)</li>
              <li>ADGM Data Protection Regulations 2021 (where applicable)</li>
              <li>DIFC Data Protection Law No. 5 of 2020 (where applicable)</li>
            </ul>

            <H3>8.3 Document Storage and Security</H3>
            <ul className="list-disc pl-5 space-y-1 text-text-muted text-[length:var(--text-sm)]">
              <li>Documents uploaded to the Platform are encrypted at rest (AES-256) and in transit (TLS 1.2+).</li>
              <li>Zawda implements reasonable technical and organizational measures to protect stored data, including access controls, audit logging, and multi-factor authentication.</li>
              <li>Zawda does not guarantee absolute security. No system is completely immune to unauthorized access.</li>
            </ul>

            <H3>8.4 Sub-processors</H3>
            <P>Zawda may engage sub-processors (third-party service providers) to operate parts of the Platform, including cloud infrastructure providers. A list of current sub-processors is available upon request. We will notify Users of material changes to sub-processors with reasonable advance notice.</P>

            <H3>8.5 Cross-Border Data Transfers</H3>
            <P>User data may be processed in jurisdictions outside the User&#39;s country of residence. Any cross-border data transfers are conducted in compliance with applicable data protection laws and using appropriate safeguards.</P>

            <H3>8.6 Data Retention and Deletion</H3>
            <P>We retain User data for the duration of the subscription and for a period of ninety (90) days thereafter, unless longer retention is required by applicable law or regulation. Users may request deletion of their data at any time by contacting support@zawda.com, subject to any legally mandated retention requirements.</P>

            <H3>8.7 Data Subject Requests</H3>
            <P>Users may exercise data subject rights (access, correction, deletion, portability, objection) by contacting privacy@zawda.com. Zawda will respond to valid requests within thirty (30) days.</P>
          </Section>

          {/* Section 9 */}
          <Section title="9. Limitation of Liability">
            <H3>9.1 No Liability for Regulatory Outcomes</H3>
            <P><strong className="text-text">To the maximum extent permitted by applicable law, Zawda shall have no liability whatsoever for:</strong></P>
            <ul className="list-disc pl-5 space-y-1 text-text-muted text-[length:var(--text-sm)]">
              <li>Any regulatory decision, licensing outcome, enforcement action, fine, penalty, or sanction</li>
              <li>Any loss arising from reliance on Platform Content without independent professional verification</li>
              <li>Any decision made or action taken (or not taken) based on information provided through the Platform</li>
              <li>Delays or failures in regulatory processes</li>
              <li>Actions or omissions of any regulatory authority</li>
              <li>The sufficiency or completeness of any compliance program developed using the Platform</li>
            </ul>

            <H3>9.2 General Limitation</H3>
            <P><strong className="text-text">To the maximum extent permitted by applicable law, Zawda&#39;s total aggregate liability for any and all claims arising out of or related to these Terms or the Platform shall not exceed the total fees actually paid by you in the twelve (12) months immediately preceding the event giving rise to the claim.</strong></P>
            <P>For Enterprise subscribers, the liability cap shall be the greater of (a) fees paid in the preceding twelve (12) months, or (b) the amount specified in the applicable Enterprise agreement.</P>

            <H3>9.3 Carve-outs</H3>
            <P>The limitations in Sections 9.1 and 9.2 shall not apply to liability arising from:</P>
            <ul className="list-disc pl-5 space-y-1 text-text-muted text-[length:var(--text-sm)]">
              <li>Zawda&#39;s willful misconduct or fraud</li>
              <li>Zawda&#39;s breach of its confidentiality obligations resulting in unauthorized disclosure of User Content</li>
              <li>Zawda&#39;s breach of applicable data protection laws to the extent such liability cannot be contractually limited</li>
            </ul>

            <H3>9.4 Exclusion of Consequential Damages</H3>
            <P>In no event shall Zawda be liable for any indirect, incidental, special, consequential, or punitive damages, including but not limited to loss of profits, revenue, data, business opportunities, or goodwill, regardless of the cause of action or theory of liability, even if Zawda has been advised of the possibility of such damages.</P>

            <H3>9.5 Basis of the Bargain</H3>
            <P>You acknowledge that the limitations in this Section 9 are a fundamental element of the bargain between you and Zawda, and that Zawda would not provide the Platform without these limitations.</P>
          </Section>

          {/* Section 10 */}
          <Section title="10. Indemnification">
            <H3>10.1 User Indemnification</H3>
            <P>You agree to indemnify, defend, and hold harmless Zawda, its officers, directors, employees, and agents from and against any claims, damages, losses, liabilities, costs, and expenses (including reasonable legal fees) arising out of or related to:</P>
            <ul className="list-disc pl-5 space-y-1 text-text-muted text-[length:var(--text-sm)]">
              <li>Your use of the Platform in violation of these Terms or applicable law</li>
              <li>Your violation of any applicable law, regulation, or regulatory requirement</li>
              <li>User Content that infringes third-party rights or violates applicable law</li>
              <li>False, misleading, or inaccurate information you provide through the Platform</li>
              <li>Regulatory actions taken against you or your organization where such actions do not arise from Zawda&#39;s willful misconduct</li>
              <li>Your misrepresentation of Platform Content as legal advice, regulatory guidance, or professional certification to any third party</li>
            </ul>

            <H3>10.2 Indemnification Process</H3>
            <P>Zawda will provide prompt notice of any claim subject to indemnification, cooperate with the User&#39;s defense at the User&#39;s expense, and not settle any claim without the indemnifying party&#39;s consent (not to be unreasonably withheld).</P>
          </Section>

          {/* Section 11 */}
          <Section title="11. Disclaimers">
            <H3>11.1 &quot;As Is&quot; Basis</H3>
            <P>The Platform and all Content are provided on an <strong className="text-text">&quot;AS IS&quot; and &quot;AS AVAILABLE&quot;</strong> basis without warranties of any kind, whether express, implied, or statutory, including but not limited to warranties of merchantability, fitness for a particular purpose, accuracy, completeness, or non-infringement.</P>

            <H3>11.2 Regulatory Information Accuracy</H3>
            <P>While Zawda endeavors to provide accurate and timely regulatory intelligence, we do not warrant that:</P>
            <ul className="list-disc pl-5 space-y-1 text-text-muted text-[length:var(--text-sm)]">
              <li>All regulatory changes will be captured or reported</li>
              <li>Information will be error-free or complete</li>
              <li>Alerts will be delivered within any specific timeframe</li>
              <li>The Platform will be available without interruption</li>
            </ul>

            <H3>11.3 Third-Party Information</H3>
            <P>The Platform may reference, summarize, or link to information from third-party sources including regulatory authorities, news outlets, and data providers. Zawda does not control and is not responsible for the accuracy, completeness, or timeliness of third-party information.</P>
          </Section>

          {/* Section 12 */}
          <Section title="12. Service Modifications and Discontinuation">
            <P>Zawda reserves the right to:</P>
            <ul className="list-disc pl-5 space-y-1 text-text-muted text-[length:var(--text-sm)]">
              <li>Modify, suspend, or discontinue any feature or service at any time</li>
              <li>Update these Terms with reasonable notice</li>
              <li>Terminate accounts that violate these Terms</li>
            </ul>
            <P>Material changes to these Terms will be communicated via email or Platform notification at least 30 days before taking effect. Continued use of the Platform after the effective date of any changes constitutes acceptance of the updated Terms.</P>
          </Section>

          {/* Section 13 */}
          <Section title="13. Governing Law and Dispute Resolution">
            <H3>13.1 Governing Law</H3>
            <P>These Terms shall be governed by and construed in accordance with the laws of the Dubai International Financial Centre (DIFC), without regard to conflict of law principles.</P>

            <H3>13.2 Dispute Resolution</H3>
            <P>Any dispute arising out of or in connection with these Terms shall first be subject to good-faith negotiation for a period of thirty (30) days. If unresolved, disputes shall be submitted to the exclusive jurisdiction of the DIFC Courts for resolution.</P>

            <H3>13.3 Waiver of Class Action</H3>
            <P>To the extent permitted by applicable law, all claims must be brought on an individual basis. You waive any right to participate in a class action or representative proceeding.</P>
          </Section>

          {/* Section 14 */}
          <Section title="14. General Provisions">
            <H3>14.1 Entire Agreement</H3>
            <P>These Terms, together with the Privacy Policy, <Link href="/sla" className="text-gold hover:underline">Service Level Agreement</Link>, and any applicable Enterprise agreement or order form, constitute the entire agreement between you and Zawda regarding the Platform.</P>

            <H3>14.2 Severability</H3>
            <P>If any provision of these Terms is held to be unenforceable, the remaining provisions shall continue in full force and effect.</P>

            <H3>14.3 No Waiver</H3>
            <P>Failure to enforce any provision of these Terms shall not constitute a waiver of that provision or any other provision.</P>

            <H3>14.4 Assignment</H3>
            <P>You may not assign your rights under these Terms without Zawda&#39;s prior written consent. Zawda may assign its rights and obligations without restriction, including in connection with a merger, acquisition, or sale of assets.</P>

            <H3>14.5 Notices</H3>
            <P>All notices under these Terms shall be sent to the email address associated with the User&#39;s account (for notices to the User) or to legal@zawda.com (for notices to Zawda).</P>
          </Section>

          {/* Section 15 */}
          <Section title="15. Contact">
            <ul className="space-y-1 text-text-muted text-[length:var(--text-sm)]">
              <li><strong className="text-text">Legal:</strong> legal@zawda.com</li>
              <li><strong className="text-text">Privacy:</strong> privacy@zawda.com</li>
              <li><strong className="text-text">Support:</strong> support@zawda.com</li>
            </ul>
          </Section>
        </div>

        {/* Related links */}
        <div className="mt-16 pt-8 border-t border-border flex flex-col sm:flex-row gap-4">
          <Link href="/sla" className="text-gold hover:underline text-[length:var(--text-sm)] font-medium">
            Service Level Agreement &#8594;
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
