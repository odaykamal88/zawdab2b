# BACKLOG: Licensing Dashboard (Separate Swarm — Post Landing Page)

## Concept
A secure, gated workspace for companies going through the digital asset licensing process in MENA. Not a brief — a working environment.

## Core Features

### 1. Licensing Roadmap
- Step-by-step checklist per jurisdiction (VARA, CBB, ADGM, FSRA)
- Each step: description, required documents, estimated timeline, current status
- Progress tracker: % complete per phase (Pre-application, Application, Review, Grant)

### 2. Document Vault (Secure)
- Upload and store: board resolutions, AML policies, corporate documents, business plans
- End-to-end encrypted storage (communicate clearly: "Your documents are encrypted at rest and in transit. Only you can access them.")
- Document status: Draft / Under Review / Submitted / Approved
- Version history per document

### 3. AI Summary Function
- "Summarize my current status" — generates a board/investor-ready summary of where the application stands
- Delivered to inbox on demand or weekly
- Covers: completed steps, outstanding items, estimated timeline to license, key risks

### 4. Regulator Communication Log
- Track all communications with VARA/CBB/ADGM
- Notes from calls, emails received, queries raised
- Timeline view

### 5. Team Collaboration
- Invite CFO, legal counsel, compliance officer
- Role-based access (view-only vs edit)
- Comments on documents and tasks

## Security Messaging (Critical)
Users will be putting sensitive pre-license materials in here. Must communicate:
- "Documents encrypted with AES-256 at rest" (accurate — matches vault-crypto.ts)
- "AES-256 encryption in transit (TLS 1.3) and at rest, with managed keys"
- **Do NOT claim "zero-knowledge" or "Zawda cannot read your documents."** The current vault (`src/lib/vault-crypto.ts`) derives its key from a server-side `VAULT_MASTER_KEY`, so Zawda can technically decrypt. Zero-knowledge is only truthful once client-held keys are implemented.
- "SOC 2 Type II compliance roadmap" — only state this if a SOC 2 engagement is actually underway; otherwise omit. Never imply a certification you don't hold.
- "Data residency: UAE/EU servers only" and "GDPR / UAE PDPL compliant" — claim only if the deployment and DPAs actually back it.

## Monetization
- Included in Advisory tier ($2,499/mo) and Enterprise
- Potentially standalone product later: "Zawda Vault" at $299/mo

## Tech Stack Considerations
- Document storage: AWS S3 with client-side encryption OR Supabase Storage
- Auth: Clerk with organization support (multi-user per company)
- Encryption: Use crypto-js for client-side encryption before upload
- Database: Supabase (Postgres) for task/status tracking

## Agent Swarm Needed
- be-vault: S3 encrypted storage, upload/download APIs
- be-roadmap: Jurisdiction-specific roadmap data, task tracking
- fe-dashboard: The workspace UI (kanban-style roadmap, document list, summary panel)
- content-roadmap: Write the actual step-by-step requirements per jurisdiction (VARA 14-step process, CBB 11-step process, etc.)

## Priority
**After landing page and compliance assessment flow are validated.**
Do not build until: (1) landing page is live, (2) assessment generates leads, (3) at least 3 paying Advisory clients to validate the dashboard need.
