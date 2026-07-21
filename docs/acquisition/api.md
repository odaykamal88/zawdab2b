# Zawda API — v1 (data-room reference)

The MENA regulatory-intelligence dataset and recommendation engine, packaged as
a versioned HTTP API. Read endpoints are public reference data; the scoring
engine is gated behind an API key (Defense Principle 1 — the proprietary engine
is never exposed to unauthenticated callers).

Base path: `/api/v1`

---

## `GET /api/v1/jurisdictions`

Every jurisdiction profile, each joined to its authoritative regulator source.

Response:
```jsonc
{
  "apiVersion": "v1",
  "generatedAt": "2026-07-21T...Z",
  "attribution": { "note": "...", "registry": "src/lib/regulatory-sources.ts" },
  "count": 15,
  "jurisdictions": [
    {
      "profile": { "id": "vara", "regulator": "Virtual Assets Regulatory Authority", "status": "active", "licenses": [ ... ], ... },
      "provenance": {
        "regulator": "Virtual Assets Regulatory Authority",
        "regulatorShort": "VARA",
        "registryId": "vara",
        "urls": { "regulation": "https://www.vara.ae/en/regulations/", "guidance": "...", "enforcement": "..." }
      }
    }
  ]
}
```
`provenance` is `null` where no official source is yet linked — see the coverage
report (`npx tsx scripts/provenance-report.ts`) for the honest gap list.

Rate limit: 60 req/min per IP.

---

## `GET /api/v1/jurisdictions/{id}`

One jurisdiction (e.g. `vara`, `adgm`, `cbb`). `404` if unknown. Same shape as a
single element above. Rate limit: 60 req/min per IP.

---

## `POST /api/v1/assess`  🔒

The proprietary recommendation engine. Requires header `x-api-key: <ZAWDA_API_KEY>`.

Request body:
```json
{ "activities": ["Custody & Safeguarding", "Exchange / Trading Platform"], "excludeId": "vara" }
```

Response: ranked jurisdiction recommendations with matched license, match score,
and reason. Rate limit: 30 req/min per key.

Status codes: `503` API key not configured · `401` bad/missing key · `400`
`activities[]` missing or empty · `200` results.

---

## Notes for diligence
- The engine and dataset run server-side only; the client receives results, never
  the scoring weights or decision trees.
- Provenance links to real regulator pages. Per-figure (capital, timeline)
  citations are a documented follow-up, not fabricated.
- Verified live: `GET /jurisdictions` → 200 (count 15), `GET /jurisdictions/cbb`
  → 200 with real CBB source URLs, `POST /assess` → 503 until a key is set.
