// Honest coverage/provenance report for the regulatory corpus.
//   npx tsx scripts/corpus-coverage.ts

import { corpusCoverage, CORPUS } from '../src/lib/corpus'

const c = corpusCoverage()
const bar = '─'.repeat(60)

console.log(bar)
console.log('ZAWDA REGULATORY CORPUS — coverage')
console.log(bar)
console.log(`Total items: ${c.total}`)
console.log(`Jurisdictions covered: ${c.jurisdictionsCovered} / ${c.jurisdictionsInTaxonomy} in taxonomy`)
console.log(`With provenance (source URL): ${c.withProvenance}/${c.total}`)
console.log(`Arabic-normalized (title/regulator): ${c.arabicNormalized}/${c.total}`)
console.log('')
console.log('By verification:')
for (const [k, v] of Object.entries(c.byVerification)) console.log(`  ${k.padEnd(20)} ${v}`)
console.log('')
console.log('By type:')
for (const [k, v] of Object.entries(c.byType)) console.log(`  ${k.padEnd(20)} ${v}`)
console.log('')
console.log('By jurisdiction:')
for (const [k, v] of Object.entries(c.byJurisdiction)) console.log(`  ${k.padEnd(20)} ${v}`)
console.log('')
const needs = CORPUS.filter((i) => i.verification === 'needs-verification')
console.log(`⚠ ${needs.length} item(s) need primary-source verification before enterprise use:`)
for (const i of needs) console.log(`  - ${i.id}: ${i.titleEn}`)
console.log(bar)
console.log('Note: this is a SEED corpus. Full coverage (every circular, paragraph-level')
console.log('change history, Arabic normalization) requires the documented ingestion pipeline.')
console.log(bar)
