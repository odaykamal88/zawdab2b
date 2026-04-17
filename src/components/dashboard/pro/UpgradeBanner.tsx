import Link from 'next/link'

// Slug -> Regulator label mapping used by Pro views to filter hardcoded demo data
// against the user's selected jurisdictions from onboarding.
export const JURISDICTION_LABELS: Record<string, string> = {
  'vara': 'VARA',
  'adgm': 'ADGM',
  'rak-dao': 'RAK-DAO',
  'cbb': 'CBB',
  'cbuae': 'CBUAE',
  'cma-sa': 'CMA-SA',
  'qfcra': 'QFC',
  'cma-om': 'CMA-OM',
  'cma-kw': 'CMA-KW',
  'cbe-eg': 'CBE',
  'bam-ma': 'BAM',
  'cbj-jo': 'CBJ',
  'bct-tn': 'BCT',
  'bdl-lb': 'BDL',
  'cbi-iq': 'CBI',
  'cbl-ly': 'CBL',
}

export function mapJurisdictionsToLabels(jurisdictions: string[]): string[] {
  return jurisdictions.map((j) => JURISDICTION_LABELS[j]).filter(Boolean)
}

export function UpgradeBanner({ title }: { title: string }) {
  return (
    <div className="bg-gradient-to-br from-gold/10 to-gold/5 border border-gold/20 rounded-xl p-5 flex flex-col sm:flex-row items-center justify-between gap-4">
      <div>
        <p className="font-display font-bold text-text text-[length:var(--text-sm)]">Upgrade to unlock {title}</p>
        <p className="text-text-muted text-[length:var(--text-xs)] mt-0.5">Available on Professional ($799/mo) or Navigator ($2,999/mo)</p>
      </div>
      <Link href="/#pricing" className="shrink-0 px-5 py-2 bg-gold text-white text-[length:var(--text-xs)] font-medium rounded-lg hover:brightness-110 transition-all">
        View Plans &#8594;
      </Link>
    </div>
  )
}

export function GenericUpgradeView({ title = 'Pro Feature' }: { title?: string }) {
  return (
    <div className="space-y-6">
      <div>
        <div className="inline-block px-2.5 py-1 bg-gold/10 text-gold text-[length:var(--text-xs)] font-bold uppercase rounded mb-3">Preview</div>
        <h1 className="font-display font-bold text-text text-[length:var(--text-lg)]">{title}</h1>
        <p className="text-text-muted text-[length:var(--text-sm)] mt-1">This feature is available on Professional and Navigator plans.</p>
      </div>
      <UpgradeBanner title={title} />
    </div>
  )
}
