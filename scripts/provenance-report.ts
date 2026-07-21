// Provenance coverage report — which jurisdiction profiles are joined to an
// official regulator source, and which still need one. Honest gap list for the
// data room.
//
//   npx tsx scripts/provenance-report.ts

import { jurisdictionProvenanceCoverage } from '../src/lib/provenance'

function main(): void {
  const rows = jurisdictionProvenanceCoverage()
  const sourced = rows.filter((r) => r.hasOfficialSource)
  const gaps = rows.filter((r) => !r.hasOfficialSource)

  console.log('JURISDICTION PROVENANCE COVERAGE')
  console.log('─'.repeat(64))
  for (const r of rows) {
    const mark = r.hasOfficialSource ? '✓' : '·'
    const src = r.hasOfficialSource ? `→ ${r.registryId}` : '(no official source linked)'
    console.log(`  ${mark}  ${r.id.padEnd(10)} ${r.status.padEnd(9)} ${r.name.padEnd(22)} ${src}`)
  }
  console.log('─'.repeat(64))
  console.log(`  ${sourced.length}/${rows.length} sourced · ${gaps.length} gap(s)`)
  if (gaps.length > 0) {
    console.log(`  gaps: ${gaps.map((g) => g.id).join(', ')}`)
    console.log('  → add an alias in SOURCE_ALIASES or a registry entry in regulatory-sources.ts')
  }
}

main()
