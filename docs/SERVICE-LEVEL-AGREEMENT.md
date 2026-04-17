# Service Level Agreement (SLA)

**Effective Date:** April 13, 2026
**Last Updated:** April 13, 2026
**Applies To:** Professional, Navigator, Enterprise Intelligence, and Enterprise Subscribers

---

## 1. Overview

This Service Level Agreement ("SLA") defines the service commitments, response times, and remedies applicable to paid subscribers of the Zawda platform. This SLA is incorporated by reference into the Zawda Terms of Service.

Free-tier users (Watchlist, Assessment) are not covered by this SLA and receive support on a best-effort basis only.

---

## 2. Platform Availability

### 2.1 Uptime Commitment

| Tier | Monthly Uptime Target |
|---|---|
| Professional / Navigator | 99.5% |
| Enterprise Intelligence / Enterprise | 99.9% |

**"Uptime"** is measured as the percentage of total minutes in a calendar month during which the Platform's core services (dashboard, alerts, API) are operational and accessible, excluding Excluded Downtime as defined below.

**Calculation:** Uptime % = ((Total minutes in month - Unscheduled downtime minutes) / Total minutes in month) x 100

### 2.2 Excluded Downtime

The following are excluded from uptime calculations:

- Scheduled maintenance windows (communicated at least 48 hours in advance)
- Force majeure events (as defined in Section 8.1)
- Third-party service outages beyond Zawda's reasonable control (cloud providers, DNS, CDNs)
- Issues caused by User's equipment, network, or software
- Regulatory authority website outages affecting data collection
- Downtime resulting from User's actions or requests

### 2.3 Scheduled Maintenance

- Maintenance windows are scheduled during low-usage periods (typically Fridays 00:00-06:00 GST)
- Advance notice: minimum 48 hours for routine maintenance, 24 hours for urgent security patches
- Maximum scheduled downtime: 4 hours per calendar month
- Emergency security patches may be applied outside scheduled windows with best-effort advance notice

---

## 3. Alert Delivery

### 3.1 Regulatory Alert Timeliness

| Alert Type | Delivery Target | Channel |
|---|---|---|
| Critical enforcement actions | Within 4 hours of source publication | Telegram + Dashboard |
| Regulatory changes (new rules, amendments) | Within 24 hours of source publication | Telegram + Dashboard |
| Filing deadline reminders | 7 days before due date | Telegram + Dashboard |
| Weekly digest | Every Monday by 09:00 GST | Email |

### 3.2 Alert Delivery Disclaimer

**Alert delivery targets are best-effort commitments, not guarantees.** Actual delivery times depend on:

- When the source regulatory authority publishes the information
- Availability and accessibility of regulator websites
- Translation requirements for non-English publications
- Volume of simultaneous regulatory activity

Zawda is not liable for delays caused by late publication by regulators, regulator website outages, or changes communicated through informal or non-public channels.

### 3.3 Alert Accuracy

- Alerts are **informational summaries** derived from official regulator publications, not official regulatory text
- Zawda endeavors to ensure alerts are accurate but does not warrant completeness or error-free content
- Users must verify all alerts against primary regulatory sources before taking action
- Alerts do not constitute regulatory advice and should not be relied upon as such

### 3.4 Jurisdictions Covered

Alert coverage includes the following MENA jurisdictions (as of the effective date):

- Dubai (VARA)
- Abu Dhabi (ADGM / FSRA)
- UAE Federal (CBUAE, SCA)
- Bahrain (CBB)
- Saudi Arabia (CMA, SAMA)
- Qatar (QFC, QFCRA)
- Oman (CMA-OM)
- Kuwait (CMA-KW, CBK)

Additional jurisdictions may be added over time. Zawda does not guarantee coverage of every regulatory action in every jurisdiction at all times.

---

## 4. Support

### 4.1 Response Time Commitments

| Severity | Description | Professional / Navigator | Enterprise |
|---|---|---|---|
| **Critical** | Platform inaccessible, confirmed data loss | 24 hours | 4 hours |
| **High** | Major feature degraded, alerts delayed >4h | 48 hours | 8 hours |
| **Medium** | Non-critical feature issue, minor defect | 72 hours | 24 hours |
| **Low** | General inquiry, feature request, feedback | 5 business days | 48 hours |

### 4.2 Definitions

- **"Response"** means an initial acknowledgement from Zawda's support team confirming receipt of the issue and providing an estimated timeframe for resolution. Response does not mean the issue is resolved.
- **"Resolution"** means the issue is resolved or a reasonable workaround is provided.
- **"Business hours"** are Sunday through Thursday, 09:00-18:00 Gulf Standard Time (GST/UTC+4), excluding UAE public holidays. The response time clock starts when a request is received during business hours. Requests received outside business hours are treated as received at the start of the next business day.

### 4.3 Support Channels

| Tier | Channels |
|---|---|
| Professional / Navigator | Email (support@zawda.com) |
| Enterprise Intelligence | Email + Priority queue |
| Enterprise | Email + Dedicated Slack/Teams channel + Phone |

### 4.4 Escalation

If a support request is not resolved within the committed timeframe, Users may escalate by:

1. Replying to the support thread with "ESCALATE" in the subject line
2. Escalated issues are acknowledged by senior management within 4 business hours
3. A revised resolution timeline is provided within 1 business day of escalation

---

## 5. Advisory Services (Navigator and Enterprise Tiers)

### 5.1 Advisory Access

| Tier | Advisory Access |
|---|---|
| Navigator | Asynchronous advisory via Platform (48-hour response during business hours) |
| Enterprise | Dedicated compliance liaison + scheduled calls |

### 5.2 Advisory Scope

Advisory services are limited to **operational guidance, regulatory interpretation at a general level, document review feedback, and process recommendations**. Specifically, advisory services include:

- Licensing roadmap guidance and milestone tracking
- Document review feedback (operational feedback, not legal review)
- Compliance framework recommendations
- Jurisdiction selection guidance based on publicly available information
- General regulatory interpretation and plain-language summaries

Advisory services do not include legal review, formal sign-off, professional certification, or any form of binding opinion.

### 5.3 Advisory Exclusions

Advisory services **do not include** and shall not be construed as providing:

- Legal advice, legal opinions, or legal representation
- Direct communication with regulators on the User's behalf
- Drafting of legal documents (contracts, agreements, legal submissions)
- Representation in enforcement proceedings or regulatory hearings
- Tax advice, tax structuring, or tax planning recommendations
- Guaranteed regulatory outcomes or approval assurances
- Acting as the User's compliance officer of record, MLRO, or outsourced governance function
- Formal audit services or audit certification

### 5.4 User Responsibility

Users acknowledge that advisory services are supplementary to, and not a replacement for, the User's own internal compliance function and independent professional advisors. All decisions based on advisory input remain the sole responsibility of the User.

---

## 6. Data and Security

### 6.1 Encryption

- All data in transit: TLS 1.2+ encryption
- All data at rest: AES-256 encryption
- Document vault: End-to-end encryption (Enterprise tier)

### 6.2 Access Controls

- Role-based access controls for all Platform features
- Multi-factor authentication (MFA) available for all accounts, required for Enterprise
- Audit logging of access events and material changes

### 6.3 Data Backup

- Daily automated backups with 30-day retention
- Point-in-time recovery capability
- Backup data encrypted to the same standard as production data

### 6.4 Data Segregation

User data is logically segregated. No User can access another User's data through the Platform.

### 6.5 Incident Response

In the event of a confirmed security incident affecting User data:

- Initial notification to affected Users within 72 hours of confirmation
- Detailed incident report within 14 days, including scope, impact, root cause, and remediation steps
- Remediation plan shared with affected Users
- Cooperation with User's own incident response processes upon reasonable request

### 6.6 Security Testing

Zawda conducts regular security assessments, including:

- Annual third-party penetration testing
- Continuous automated vulnerability scanning
- Security review of material code changes

Results of security assessments are available to Enterprise subscribers upon request under NDA.

---

## 7. Service Credits

### 7.1 Eligibility

If Zawda fails to meet the uptime commitments in Section 2, affected paid subscribers in good standing (no overdue invoices) may request service credits as described below.

### 7.2 Credit Schedule — Professional / Navigator Tiers

| Monthly Uptime Achieved | Service Credit (% of monthly fee) |
|---|---|
| 99.0% to below 99.5% | 10% |
| 95.0% to below 99.0% | 25% |
| Below 95.0% | 50% |

### 7.3 Credit Schedule — Enterprise Tiers

| Monthly Uptime Achieved | Service Credit (% of monthly fee) |
|---|---|
| 99.5% to below 99.9% | 10% |
| 99.0% to below 99.5% | 25% |
| 95.0% to below 99.0% | 50% |
| Below 95.0% | 100% |

### 7.4 Credit Limitations

- Service credits are the **sole and exclusive remedy** for failure to meet uptime commitments
- Credits are applied to future billing periods and are not redeemable for cash or refund
- Maximum credit in any single calendar month: 100% of that month's subscription fee
- Credits must be requested within 30 calendar days of the end of the affected month
- Credits do not apply to free-tier users or accounts with overdue invoices
- Credits do not carry over beyond 12 months

### 7.5 Credit Request Process

To request a service credit:

1. Email support@zawda.com with subject line **"SLA Credit Request — [Month/Year]"**
2. Include in your request:
   - Account email address and organization name
   - Affected dates and times (with timezone)
   - Description of the service disruption experienced
   - Screenshots, error messages, or logs where available
3. Zawda will review the request and respond within **10 business days**
4. If approved, the credit will be applied to the next billing cycle

---

## 8. Exclusions and Limitations

### 8.1 Force Majeure

Zawda shall not be liable for any failure to meet SLA commitments due to circumstances beyond its reasonable control, including but not limited to:

- Natural disasters, epidemics, pandemics
- Government orders, sanctions, embargoes, or regulatory actions
- War, terrorism, civil unrest, or armed conflict
- Internet or telecommunications infrastructure failures affecting multiple providers
- Cyberattacks against third-party infrastructure (cloud providers, DNS, CDN)
- Regulatory authority website unavailability or delayed publication

### 8.2 User Responsibilities

This SLA assumes that Users:

- Use the Platform in accordance with the Terms of Service
- Maintain adequate internet connectivity and compatible devices
- Keep their account credentials secure and enable MFA where recommended
- Report issues promptly through designated support channels
- Provide accurate information when submitting support requests

### 8.3 Regulatory Intelligence Limitations

Zawda's regulatory intelligence is derived from monitoring publicly available regulatory sources. This SLA does not guarantee:

- Discovery of every regulatory action, consultation, or guidance document across all jurisdictions
- Real-time monitoring of regulators that do not publish information online
- Coverage of informal regulatory guidance, verbal communications, or non-public directives
- Translation accuracy for non-English regulatory publications
- Coverage of regulatory changes published exclusively in Arabic or other non-English languages, where translation delays may apply

---

## 9. Separation of Commitments

### 9.1 Platform Uptime vs. Advisory Response

Platform uptime commitments (Section 2) and advisory response commitments (Section 5) are separate and independent. An advisory response delay does not constitute a platform availability failure, and vice versa.

### 9.2 Alert Delivery vs. Platform Uptime

Alert delivery targets (Section 3) are best-effort commitments that depend on third-party source availability. Alert delivery delays caused by source-side issues do not constitute a platform availability failure for the purposes of service credits.

---

## 10. SLA Modifications

Zawda reserves the right to modify this SLA with 30 days' written notice to affected subscribers. Changes that materially reduce service commitments will not apply to existing subscribers until their next subscription renewal period. Continued use of the Platform after the effective date of any SLA modification constitutes acceptance of the updated SLA.

---

## 11. Contact

For SLA-related inquiries or credit requests:

- **Support:** support@zawda.com
- **Enterprise Hotline:** Provided directly to Enterprise subscribers upon onboarding

---

*This Service Level Agreement is a draft prepared for internal review. It should be reviewed and finalized by qualified legal counsel licensed in the DIFC and/or relevant MENA jurisdictions before publication.*
