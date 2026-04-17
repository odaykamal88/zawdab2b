export interface LicenseStep {
  id: string
  step: number
  title: string
  description: string
  documents: string[]
  timeline: string
  riskWarning?: string
  category: 'pre-application' | 'application' | 'post-license'
}

export interface JurisdictionRisk {
  title: string
  severity: 'critical' | 'high' | 'medium'
  description: string
}

export interface JurisdictionData {
  id: string
  name: string
  regulator: string
  flag: string
  steps: LicenseStep[]
  hiddenRisks: JurisdictionRisk[]
  auditFrequency: string
  avgTimeline: string
  minCapital: string
}

export const JURISDICTIONS: JurisdictionData[] = [
  {
    id: 'vara',
    name: 'UAE — Dubai (VARA)',
    regulator: 'Virtual Assets Regulatory Authority',
    flag: '🇦🇪',
    avgTimeline: '6–12 months',
    minCapital: 'AED 1M–15M (varies by activity)',
    auditFrequency: 'Quarterly compliance reviews + random audits at VARA\'s discretion',
    hiddenRisks: [
      {
        title: 'Central Bank can freeze operations overnight',
        severity: 'critical',
        description: 'The UAE Central Bank retains overriding authority over payment and banking relationships. Even with a valid VARA license, the Central Bank can instruct banks to freeze your accounts if they suspect non-compliance with AML/CFT regulations. This has happened to licensed firms with no prior warning.',
      },
      {
        title: 'Wrong license category = forced shutdown',
        severity: 'critical',
        description: 'VARA licenses are activity-specific. If you are operating a custody service under a broker-dealer license, you are unlicensed for that activity. VARA has issued cease-and-desist orders to firms that expanded beyond their licensed scope. You must apply for each activity separately.',
      },
      {
        title: 'Marketing before license = immediate enforcement',
        severity: 'high',
        description: 'VARA actively monitors social media, websites, and events for unlicensed promotion of virtual asset services in Dubai. Publishing a landing page, running ads, or speaking at a conference about your services before your license is granted can trigger enforcement action — even if your application is pending.',
      },
      {
        title: 'Random audits with no advance notice',
        severity: 'high',
        description: 'VARA conducts unannounced compliance audits. Firms have reported receiving audit requests with 48-hour response windows. If your AML/CFT documentation, transaction monitoring records, or SAR filing history is not audit-ready at all times, you risk findings that escalate to enforcement.',
      },
      {
        title: 'MVP license is not a full license',
        severity: 'medium',
        description: 'The MVP (Minimum Viable Product) provisional license has strict operational limits — restricted user onboarding, transaction volume caps, and mandatory milestone reviews. Firms that treat an MVP as a full license and scale prematurely have had their MVP revoked.',
      },
      {
        title: 'Banking relationship loss cascades',
        severity: 'high',
        description: 'UAE banks are extremely cautious with VASP clients. If one bank terminates your relationship due to compliance concerns, other banks in the market will learn of it quickly. Losing banking access effectively halts operations regardless of your license status.',
      },
      {
        title: 'Stablecoin issuance requires dual regulatory approval',
        severity: 'critical',
        description: 'VARA regulates virtual asset activities, but AED-pegged stablecoins also fall under Central Bank of the UAE (CBUAE) jurisdiction. Issuers need approval from both. CBUAE requires 1:1 fiat reserves in segregated UAE bank accounts with independent monthly attestation. The minimum capital for issuance is AED 50M — the highest of any VARA activity. Operating without dual approval risks enforcement from both regulators simultaneously.',
      },
      {
        title: 'Stablecoin reserve management under constant scrutiny',
        severity: 'high',
        description: 'Reserve composition is audited: only cash and short-term sovereign debt (UAE T-bills or equivalent) are accepted. Crypto-collateralized or algorithmic stablecoins are explicitly prohibited under current VARA rules. Reserve attestation reports must be published monthly. Any shortfall triggers immediate supervisory intervention.',
      },
    ],
    steps: [
      {
        id: 'vara-entity', step: 1, category: 'pre-application',
        title: 'Entity Establishment in Dubai',
        description: 'Incorporate a legal entity in Dubai (mainland or DIFC/free zone) designated as the VASP applicant. The entity must be purpose-built — regulators scrutinize existing entities repurposed for VASP activities.',
        documents: ['Trade license', 'Memorandum of Association', 'Shareholder register', 'Board resolution authorizing VASP application', 'Proof of registered office in Dubai'],
        timeline: '2–4 weeks',
        riskWarning: 'Using a free zone entity that is not approved for VASP activities will result in automatic rejection. Confirm with VARA which free zones are eligible.',
      },
      {
        id: 'vara-scope', step: 2, category: 'pre-application',
        title: 'Define Licensed Activity Scope',
        description: 'Identify exactly which VARA-regulated activities you will conduct: Exchange, Broker-Dealer, Custody, Lending & Borrowing, Advisory, or Transfer & Settlement. Each activity requires a separate license application.',
        documents: ['Business plan detailing each activity', 'Revenue model per activity', 'Product roadmap'],
        timeline: '1–2 weeks',
        riskWarning: 'Do NOT apply for activities you are not ready to operate. VARA tracks your declared scope against actual operations. Operating outside your licensed scope triggers cease-and-desist.',
      },
      {
        id: 'vara-compliance-team', step: 3, category: 'pre-application',
        title: 'Appoint Compliance Officer & MLRO',
        description: 'Designate a qualified Compliance Officer and Money Laundering Reporting Officer (MLRO). Both must be UAE-resident and pass VARA fit-and-proper assessment. The MLRO cannot be the same person as the CEO.',
        documents: ['CV and qualifications of CO and MLRO', 'CAMS or equivalent AML certification', 'UAE residency proof', 'Background check consent forms'],
        timeline: '2–4 weeks (hiring + relocation if needed)',
        riskWarning: 'VARA requires the MLRO to be a dedicated role, not a part-time addition to another job. Firms that appointed an MLRO without genuine AML experience have had their applications returned.',
      },
      {
        id: 'vara-aml', step: 4, category: 'pre-application',
        title: 'Develop AML/CFT Framework',
        description: 'Draft comprehensive AML/CFT policies covering: Customer Due Diligence (CDD), Enhanced Due Diligence (EDD), transaction monitoring procedures, suspicious activity reporting, sanctions screening, and record-keeping.',
        documents: ['AML/CFT Policy Manual', 'CDD/EDD procedures', 'Transaction monitoring rulebook', 'SAR filing procedures', 'Sanctions screening policy', 'Staff training plan'],
        timeline: '4–8 weeks',
        riskWarning: 'Generic AML policies copied from templates will be rejected. VARA reviewers check that your policies are specific to your business model, customer base, and risk profile. Hire a MENA-experienced AML consultant.',
      },
      {
        id: 'vara-application', step: 5, category: 'application',
        title: 'Submit Initial Application to VARA',
        description: 'File the VARA Initial Application with all required documents: business plan, financial projections (3-year), organizational chart, shareholder details (including UBOs), and compliance framework.',
        documents: ['VARA application form', '3-year financial projections', 'Organizational chart', 'UBO declarations', 'Source of funds documentation', 'All pre-application documents'],
        timeline: '1–2 weeks to prepare, 4–8 weeks for VARA initial review',
      },
      {
        id: 'vara-fit-proper', step: 6, category: 'application',
        title: 'Fit & Proper Assessment',
        description: 'All controllers, directors, senior management, and significant shareholders undergo VARA fit-and-proper assessment: criminal background checks, financial probity checks, and competency evaluation.',
        documents: ['Personal questionnaires for all key persons', 'Police clearance certificates', 'Financial disclosure forms', 'Professional references'],
        timeline: '4–8 weeks',
        riskWarning: 'Any undisclosed criminal record, bankruptcy, or regulatory action against a key person will result in rejection. VARA cross-references with international databases. Disclose everything proactively.',
      },
      {
        id: 'vara-tech-audit', step: 7, category: 'application',
        title: 'Technology & Security Audit',
        description: 'Complete VARA-mandated technology audit: cybersecurity framework, data protection measures, business continuity plan, IT governance, penetration testing results, and smart contract audits (if applicable).',
        documents: ['Cybersecurity policy', 'Penetration test report (from VARA-approved auditor)', 'Business continuity plan', 'Data protection policy', 'IT governance framework', 'Smart contract audit (if applicable)'],
        timeline: '4–8 weeks',
      },
      {
        id: 'vara-capital', step: 8, category: 'application',
        title: 'Meet Minimum Capital Requirements',
        description: 'Demonstrate compliance with VARA minimum capital for your activity: Exchange (AED 15M), Broker-Dealer (AED 5M), Custody (AED 10M), Advisory (AED 1M). Capital must be unencumbered and held in a UAE bank account.',
        documents: ['Bank statements showing capital adequacy', 'Auditor confirmation letter', 'Source of capital documentation'],
        timeline: '2–4 weeks',
        riskWarning: 'Capital must be maintained at all times, not just at application. VARA monitors ongoing capital adequacy. Falling below the minimum triggers supervisory action.',
      },
      {
        id: 'vara-mvp', step: 9, category: 'application',
        title: 'Obtain MVP / Provisional License',
        description: 'Receive VARA MVP license allowing limited operations: restricted user onboarding, transaction volume caps, and mandatory quarterly milestone reviews. This is NOT a full license.',
        documents: ['MVP conditions acceptance', 'Milestone commitment plan'],
        timeline: '2–4 weeks after capital verification',
        riskWarning: 'MVP has hard limits on operations. Exceeding user caps or transaction volumes during MVP is a license violation. Plan your go-to-market around these constraints.',
      },
      {
        id: 'vara-travel-rule', step: 10, category: 'post-license',
        title: 'Implement Travel Rule Solution',
        description: 'Deploy a FATF-compliant Travel Rule solution (IVMS 101 format) for originator/beneficiary data on transfers above the threshold. Must be operational before March 2026 deadline.',
        documents: ['Travel Rule solution vendor contract', 'IVMS 101 integration documentation', 'Testing results with counterparty VASPs'],
        timeline: '4–8 weeks',
        riskWarning: '37% of VASPs globally have never received a Travel Rule transfer. If your counterparties are not compliant, you bear the risk. Document your due diligence on counterparty compliance.',
      },
      {
        id: 'vara-full', step: 11, category: 'post-license',
        title: 'Full VASP License Issuance',
        description: 'Complete all MVP milestone conditions and apply for upgrade to full VASP license. Full license removes operational restrictions but increases ongoing compliance obligations.',
        documents: ['MVP milestone completion report', 'Updated compliance documentation', 'External audit report'],
        timeline: '4–8 weeks after MVP milestones complete',
      },
      {
        id: 'vara-ongoing', step: 12, category: 'post-license',
        title: 'Ongoing Compliance & Reporting',
        description: 'Maintain continuous compliance: quarterly regulatory returns to VARA, annual external audit, incident reporting within 24 hours, and adherence to all VARA rulebook updates.',
        documents: ['Quarterly compliance returns', 'Annual audited financial statements', 'Annual MLRO report', 'Incident reports (as needed)'],
        timeline: 'Ongoing — quarterly cadence',
        riskWarning: 'VARA conducts random unannounced audits. Your compliance documentation must be audit-ready at all times. Late quarterly returns trigger supervisory escalation.',
      },
    ],
  },
  {
    id: 'adgm',
    name: 'UAE — Abu Dhabi (ADGM)',
    regulator: 'Financial Services Regulatory Authority (FSRA)',
    flag: '🇦🇪',
    avgTimeline: '6–12 months',
    minCapital: '$250K–$10M (varies by activity)',
    auditFrequency: 'Annual compliance audit + ad-hoc FSRA examinations',
    hiddenRisks: [
      {
        title: 'ADGM is a common law jurisdiction — different legal framework',
        severity: 'medium',
        description: 'ADGM operates under English common law, not UAE civil law. Your legal contracts, dispute resolution, and regulatory interactions follow different principles than mainland UAE. Ensure your legal counsel is qualified in ADGM jurisdiction specifically.',
      },
      {
        title: '$8.85M in penalties already imposed',
        severity: 'critical',
        description: 'ADGM has demonstrated willingness to impose large financial penalties. Public censures are published on the ADGM website, creating permanent reputational damage in a small market where everyone knows everyone.',
      },
      {
        title: 'Enhanced capital requirements with no phase-in',
        severity: 'high',
        description: 'FSRA updated capital requirements for digital asset firms in June 2025. These apply immediately to existing licensees — there is no grandfathering period. Firms that cannot meet the new requirements face license conditions or withdrawal.',
      },
      {
        title: 'Fiat-Referenced Token (FRT) framework is the strictest in the region',
        severity: 'high',
        description: 'ADGM\'s FRT framework requires stablecoin issuers to maintain reserves in a combination of cash and high-quality liquid assets (HQLA) at ADGM-recognized banks. Algorithmic stablecoins are banned outright. FRT issuers face ongoing obligations including real-time reserve monitoring, quarterly stress testing, and immediate redemption guarantees at par value.',
      },
    ],
    steps: [
      {
        id: 'adgm-entity', step: 1, category: 'pre-application',
        title: 'Register Entity in ADGM',
        description: 'Establish a company within Abu Dhabi Global Market. This requires ADGM Registration Authority approval and a physical presence in ADGM.',
        documents: ['ADGM company registration application', 'Constitutional documents', 'Registered office lease in ADGM'],
        timeline: '2–4 weeks',
      },
      {
        id: 'adgm-fsp', step: 2, category: 'application',
        title: 'Apply for Financial Services Permission (FSP)',
        description: 'Submit FSP application to FSRA specifying regulated activities: Dealing in Investments, Managing Investments, Advising on Investments, Providing Custody, or Operating a Crypto Asset Business.',
        documents: ['FSP application form', 'Regulatory business plan', 'Compliance arrangements', 'Risk management framework', 'Financial resources assessment'],
        timeline: '8–16 weeks for FSRA review',
      },
      {
        id: 'adgm-compliance', step: 3, category: 'application',
        title: 'Compliance Framework & AML Program',
        description: 'Establish compliance monitoring arrangements, AML/CFT program, and appoint Compliance Officer, MLRO, and Finance Officer as required by FSRA.',
        documents: ['AML/CFT program', 'Compliance monitoring plan', 'Key person appointments', 'Outsourcing arrangements (if any)'],
        timeline: '4–8 weeks',
        riskWarning: 'FSRA expects the compliance function to be independent of business operations. The CO cannot report to the CEO — they must report to the board.',
      },
      {
        id: 'adgm-capital', step: 4, category: 'application',
        title: 'Meet Financial Resources Requirements',
        description: 'Demonstrate capital adequacy per FSRA requirements. These were updated in June 2025 and are higher than previous thresholds.',
        documents: ['Capital adequacy calculations', 'Bank statements', 'Auditor verification'],
        timeline: '2–4 weeks',
      },
      {
        id: 'adgm-license', step: 5, category: 'application',
        title: 'Receive FSP & Commence Operations',
        description: 'Upon FSRA approval, receive your Financial Services Permission with any conditions. Begin operations within the scope of your authorized activities.',
        documents: ['Conditions compliance plan', 'Operational readiness confirmation'],
        timeline: '2–4 weeks post-approval',
      },
      {
        id: 'adgm-ongoing', step: 6, category: 'post-license',
        title: 'Ongoing Obligations & Reporting',
        description: 'Annual compliance return, audited financials, and immediate notification of material changes. FSRA conducts periodic examinations.',
        documents: ['Annual compliance return', 'Audited financial statements', 'Material change notifications'],
        timeline: 'Ongoing — annual cadence',
      },
    ],
  },
  {
    id: 'cbb',
    name: 'Bahrain (CBB)',
    regulator: 'Central Bank of Bahrain',
    flag: '🇧🇭',
    avgTimeline: '6–18 months (including sandbox)',
    minCapital: 'BHD 25K–500K (varies by category)',
    auditFrequency: 'Annual audit + CBB inspections',
    hiddenRisks: [
      {
        title: 'Sandbox exit is not guaranteed',
        severity: 'high',
        description: 'CBB operates a regulatory sandbox with a defined period (typically 12–24 months). At the end of the sandbox, the CBB may decide not to grant a full license if your sandbox performance does not meet their expectations. You must plan for the possibility of having to wind down.',
      },
      {
        title: 'Small market, high regulator attention',
        severity: 'medium',
        description: 'Bahrain is a small jurisdiction. The CBB knows every licensee by name. This means faster decisions but also more scrutiny per firm. Any compliance lapse will be noticed quickly.',
      },
      {
        title: 'Cross-border operations require separate approvals',
        severity: 'high',
        description: 'A CBB license does not authorize you to operate in the UAE or other GCC countries. Serving UAE customers from Bahrain without a VARA license is unlicensed activity in the UAE.',
      },
      {
        title: 'Payment token services require CBB pre-approval',
        severity: 'high',
        description: 'CBB treats stablecoins as "payment tokens" under the Payment Services Directive. Issuance requires a separate Payment Token Service License with minimum BHD 1M capital. The BHD-pegged stablecoin market is nascent — CBB scrutinizes every application individually and may impose bespoke conditions.',
      },
    ],
    steps: [
      {
        id: 'cbb-sandbox', step: 1, category: 'pre-application',
        title: 'Apply for CBB Regulatory Sandbox',
        description: 'Most crypto-asset firms enter through the CBB sandbox. Submit sandbox application with business plan, risk assessment, and proposed testing parameters.',
        documents: ['Sandbox application form', 'Business plan', 'Risk assessment', 'Testing plan with KPIs'],
        timeline: '4–8 weeks for sandbox admission',
      },
      {
        id: 'cbb-category', step: 2, category: 'application',
        title: 'Determine License Category',
        description: 'CBB crypto-asset licenses fall under Category 3 (dealing/managing) or Category 4 (advisory). Your category determines capital requirements and operational scope.',
        documents: ['Activity scope documentation', 'Category assessment'],
        timeline: '2–4 weeks',
      },
      {
        id: 'cbb-aml', step: 3, category: 'application',
        title: 'AML/CFT Compliance Framework',
        description: 'Develop AML/CFT program compliant with CBB\'s Financial Crime Module and Crypto-Asset Module (CRA).',
        documents: ['AML/CFT policy', 'CDD procedures', 'Transaction monitoring framework', 'SAR procedures'],
        timeline: '4–8 weeks',
      },
      {
        id: 'cbb-sandbox-ops', step: 4, category: 'application',
        title: 'Sandbox Operations Period',
        description: 'Operate within sandbox parameters for 12–24 months. CBB monitors your performance against agreed KPIs.',
        documents: ['Monthly sandbox reports', 'KPI tracking', 'Incident reports'],
        timeline: '12–24 months',
        riskWarning: 'The sandbox has hard limits on customers, transaction volumes, and product features. Exceeding these is grounds for immediate sandbox termination.',
      },
      {
        id: 'cbb-full', step: 5, category: 'post-license',
        title: 'Apply for Full CRA License',
        description: 'After successful sandbox completion, apply for full Crypto-Asset Module license. CBB will review your sandbox track record.',
        documents: ['Sandbox completion report', 'Updated business plan', 'Full license application'],
        timeline: '4–12 weeks',
      },
      {
        id: 'cbb-ongoing', step: 6, category: 'post-license',
        title: 'Ongoing Compliance',
        description: 'Annual compliance audits, CBB reporting requirements, and ongoing adherence to the Crypto-Asset Module.',
        documents: ['Annual audited accounts', 'Compliance returns', 'MLRO annual report'],
        timeline: 'Ongoing',
      },
    ],
  },
]

export const CATEGORY_LABELS: Record<string, string> = {
  'pre-application': 'Pre-Application',
  'application': 'Application & Licensing',
  'post-license': 'Post-License',
}
