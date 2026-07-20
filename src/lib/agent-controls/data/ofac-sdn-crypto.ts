// Real snapshot of OFAC Specially Designated Nationals (SDN) digital-currency
// addresses, used as the AUTHORITATIVE sanctions block-list for this PoC.
//
// Source:   OFAC SDN List — Digital Currency Addresses
// URL:      https://sanctionslist.ofac.treas.gov/Home/SdnList
// Snapshot: 2026-07-20 (DEMO SNAPSHOT — not exhaustive)
//
// PRODUCTION: refresh from the live SDN feed (sdn.xml / SDN_ENHANCED) on a
// schedule and treat every match as authoritative. Do not rely on this static
// snapshot for real screening — it exists so the PoC blocks on a *real* listed
// address rather than a fabricated one.

export interface OfacEntry {
  address: string
  chain: string
  entity: string
  program: string
  addedByOFAC: string
}

export const OFAC_SDN_CRYPTO_SNAPSHOT = {
  source: 'OFAC Specially Designated Nationals (SDN) List — Digital Currency Addresses',
  sourceUrl: 'https://sanctionslist.ofac.treas.gov/Home/SdnList',
  snapshotDate: '2026-07-20',
  entries: [
    {
      // First Ethereum address added to the SDN list (Lazarus Group / DPRK),
      // linked to the Ronin Bridge exploit. Added 2022-04-14.
      address: '0x098B716B8Aaf21512996dC57EB0615e2383E2f96',
      chain: 'ETH',
      entity: 'Lazarus Group (DPRK) — Ronin Bridge exploit',
      program: 'DPRK3 / CYBER2',
      addedByOFAC: '2022-04-14',
    },
  ] as OfacEntry[],
}
