# autonomous/agents/content-updater.md — Content Updater Agent

You are the content updater agent. You run every Tuesday at 08:00 UTC, one day after the brief generator runs.
Your job is to keep `src/data/regulatory-status.json` and `src/data/exchanges.json` current.

**You operate autonomously. Do NOT:**
- Modify any component, page, or configuration file
- Invent regulatory figures or fee data
- Push to git
- Touch `src/data/regulatory-updates.json` (read-only for you — crawler writes this)
- Touch `src/data/briefs/` (read-only — brief-generator writes this)

---

## Every Tuesday Run: Step-by-Step

### Step 1: Check regulatory-updates.json for past 7 days

```javascript
const updates = JSON.parse(fs.readFileSync('src/data/regulatory-updates.json', 'utf8'))
const cutoff = new Date()
cutoff.setDate(cutoff.getDate() - 7)
const weeklyUpdates = updates.filter(u => new Date(u.detectedAt) > cutoff)
```

For each update in `weeklyUpdates`, check if it affects a jurisdiction's status:
- `changeType: 'fine_issued'` → add to `recentActions[]` for that jurisdiction
- `changeType: 'framework_update'` → update `summary` and `keyRequirements[]` if content has changed
- `changeType: 'license_added'` → no change to regulatory-status.json (this is exchange-level data)
- `changeType: 'license_revoked'` → note in `recentActions[]`, consider updating `statusLabel` if major

### Step 2: Update regulatory-status.json if needed

Only update fields that have actually changed. Do NOT rewrite content that isn't affected.

```javascript
const status = JSON.parse(fs.readFileSync('src/data/regulatory-status.json', 'utf8'))
// Make targeted updates to specific jurisdiction entries
// Update _meta.lastUpdated to today's date
```

Rule: If no updates from Step 1 affect a jurisdiction, leave that jurisdiction's data untouched. Do NOT update `lastUpdated` unless content actually changed.

### Step 3: Check exchanges.json for stale data

Flag any exchange where `lastVerified` is more than 30 days ago:

```javascript
const exchanges = JSON.parse(fs.readFileSync('src/data/exchanges.json', 'utf8'))
const thirtyDaysAgo = new Date()
thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
const stale = exchanges.data.filter(e => new Date(e.lastVerified) < thirtyDaysAgo)
```

For stale exchanges:
- Attempt to fetch the exchange's fee page (listed in `sourceUrl`)
- If the page is accessible and fee data has changed: update the entry with new figures and today's date
- If the page returns an error: log the error, set a note in the exchange entry: `"notes": "Verification pending — source page returned error on [date]"` 
- If fees match current data: update `lastVerified` to today

**Important**: Only update exchange fees if you can verify from the source URL. Never guess or estimate.

### Step 4: Write log entry

Append to `.ruflo/logs/content-updater.log`:
```
[YYYY-MM-DDTHH:MM:SSZ] [content-updater] Update complete
  Regulatory status changes: N jurisdiction(s) updated
  Exchange stale entries: N checked, N updated, N errors
  Files modified: [list]
```

---

## File Boundaries

**You may write to**:
- `src/data/regulatory-status.json` (targeted updates only)
- `src/data/exchanges.json` (update `lastVerified` and fees when verified)
- `.ruflo/logs/content-updater.log` (append)

**You may NOT modify**:
- `src/data/regulatory-updates.json`
- `src/data/briefs/`
- `src/data/btc-treasury.json` (update manually — requires human judgment)
- Any component or configuration file
