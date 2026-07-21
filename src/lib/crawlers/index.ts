/**
 * Regulatory source crawler.
 *
 * Strategy per feed:
 *   1. Try RSS/Atom (rss-parser) — zero-cost structured data
 *   2. Fall back to HTML (cheerio) — extract news items by common patterns
 *
 * Assessment pipeline per item:
 *   classifyType  → what kind of update is this?
 *   scoreSeverity → how urgent? (critical/high/medium/low)
 *   extractFine   → is there a fine amount mentioned?
 *
 * Deduplication: URL SHA-256 hash (first 12 chars) as part of the ID.
 * A URL seen in existing updates is never emitted again.
 *
 * Politeness: 2-3 s delay between requests to the same domain.
 * If a source returns 429 or 403 it is skipped for this run, not retried.
 */

import * as cheerio from 'cheerio'
import Parser from 'rss-parser'
import { createHash } from 'crypto'
import {
  type RegulatorySource,
  type RegulatoryUpdate,
  type UpdateType,
  type Severity,
  REGULATORY_SOURCES,
  scoreSeverity,
} from '../regulatory-sources'

const rssParser = new Parser({
  timeout: 12_000,
  headers: { 'User-Agent': 'Mozilla/5.0 (compatible; ZawdaBot/1.0; +https://zawda.me/bot)' },
})

// ── Keyword tables ────────────────────────────────────────────────────────────

const TYPE_KEYWORDS: Record<UpdateType, string[]> = {
  enforcement:  ['fine', 'penalt', 'sanction', 'cease and desist', 'enforcement', 'revok', 'suspend', 'prohibited', 'action taken', 'disciplinary'],
  regulation:   ['regulation', 'framework', 'rulebook', 'rule', 'mandatory', 'requirement', 'legislation', 'amendment', 'revised rules'],
  consultation: ['consultation', 'draft', 'public comment', 'discussion paper', 'consultation paper', 'feedback'],
  guidance:     ['guidance', 'circular', 'advisory', 'bulletin', 'faq', 'guidance note'],
  deadline:     ['deadline', 'compliance date', 'effective date', 'must comply by', 'last date to'],
  licensing:    ['license granted', 'licence granted', 'licensed', 'new registration', 'authorization granted', 'approval granted'],
  sanction:     ['blacklist', 'greylist', 'grey list', 'black list', 'fatf list', 'designated', 'watchlist'],
}

const FINE_PATTERNS = [
  /AED\s*[\d,.]+(?:\s*(?:million|m|thousand|k))?/i,
  /USD?\s*[\d,.]+(?:\s*(?:million|m|thousand|k))?/i,
  /\$\s*[\d,.]+(?:\s*(?:million|m|thousand|k))?/i,
  /BHD\s*[\d,.]+(?:\s*(?:million|m|thousand|k))?/i,
  /SAR\s*[\d,.]+(?:\s*(?:million|m|thousand|k))?/i,
  /QAR\s*[\d,.]+(?:\s*(?:million|m|thousand|k))?/i,
  /KWD\s*[\d,.]+(?:\s*(?:million|m|thousand|k))?/i,
  /OMR\s*[\d,.]+(?:\s*(?:million|m|thousand|k))?/i,
]

// ── Assessment helpers ────────────────────────────────────────────────────────

function urlHash(url: string): string {
  return createHash('sha256').update(url).digest('hex').slice(0, 12)
}

function classifyType(text: string, defaultType: UpdateType): UpdateType {
  const lower = text.toLowerCase()
  for (const [type, keywords] of Object.entries(TYPE_KEYWORDS) as [UpdateType, string[]][]) {
    if (keywords.some(kw => lower.includes(kw))) return type
  }
  return defaultType
}

function extractFineAmount(text: string): string | undefined {
  for (const pattern of FINE_PATTERNS) {
    const match = text.match(pattern)
    if (match) return match[0].trim()
  }
  return undefined
}

function parseFineNumber(text: string): number | undefined {
  const amount = extractFineAmount(text)
  if (!amount) return undefined
  const digits = parseFloat(amount.replace(/[^0-9.]/g, ''))
  if (isNaN(digits)) return undefined
  const lower = amount.toLowerCase()
  if (lower.includes('million') || lower.match(/\d\s*m\b/)) return digits * 1_000_000
  if (lower.includes('thousand') || lower.match(/\d\s*k\b/)) return digits * 1_000
  return digits
}

function assessSeverity(text: string, type: UpdateType): Severity {
  return scoreSeverity(type, parseFineNumber(text))
}

function parseDate(dateStr: string | null | undefined): string {
  if (!dateStr) return new Date().toISOString().split('T')[0]
  try {
    const d = new Date(dateStr)
    if (!isNaN(d.getTime())) return d.toISOString().split('T')[0]
  } catch { /* fall through */ }
  return new Date().toISOString().split('T')[0]
}

function stripHtml(html: string): string {
  return html.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim()
}

function truncate(text: string, max = 350): string {
  const clean = stripHtml(text)
  return clean.length > max ? clean.slice(0, max - 1) + '…' : clean
}

function sleep(ms: number) {
  return new Promise(r => setTimeout(r, ms))
}

// ── RSS fetcher ───────────────────────────────────────────────────────────────

interface RawItem {
  title: string
  link: string
  pubDate?: string
  snippet: string
}

async function fetchRss(url: string): Promise<RawItem[] | null> {
  try {
    const feed = await rssParser.parseURL(url)
    return feed.items.map(item => ({
      title: (item.title ?? '').trim(),
      link: item.link ?? url,
      pubDate: item.pubDate ?? item.isoDate,
      snippet: stripHtml(item.contentSnippet ?? item.summary ?? item.content ?? ''),
    })).filter(i => i.title.length > 10)
  } catch {
    return null
  }
}

// ── HTML fetcher ──────────────────────────────────────────────────────────────

async function fetchHtml(url: string, feedType: UpdateType): Promise<RawItem[]> {
  const res = await fetch(url, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (compatible; ZawdaBot/1.0; +https://zawda.me/bot)',
      'Accept': 'text/html,application/xhtml+xml;q=0.9,*/*;q=0.8',
      'Accept-Language': 'en-US,en;q=0.5',
    },
    signal: AbortSignal.timeout(15_000),
  })

  if (!res.ok) throw new Error(`HTTP ${res.status} from ${url}`)
  const html = await res.text()
  const $ = cheerio.load(html)
  const items: RawItem[] = []
  const baseUrl = new URL(url).origin

  const resolveUrl = (href: string | undefined): string | null => {
    if (!href) return null
    if (href.startsWith('http')) return href
    try { return new URL(href, baseUrl).toString() } catch { return null }
  }

  // Common article/news container selectors
  const containers = [
    'article', '.news-item', '.press-release', '.announcement',
    '.post', '.entry', 'li.news', '.media-listing__item',
    '.listing-item', '.card', '[class*="news-"]', '[class*="post-"]',
  ]

  for (const sel of containers) {
    const found = $(sel)
    if (!found.length) continue

    found.each((_, el) => {
      const $el = $(el)
      const headings = $el.find('h1,h2,h3,h4').first()
      const linkEl = headings.find('a').length ? headings.find('a') : $el.find('a').first()
      const title = (headings.text() || linkEl.text()).trim()
      if (!title || title.length < 15) return

      const href = resolveUrl(linkEl.attr('href') ?? $el.find('a').first().attr('href'))
      if (!href) return

      const timeEl = $el.find('time,[class*="date"],[class*="Date"]').first()
      const pubDate = timeEl.attr('datetime') ?? timeEl.text().trim() ?? undefined

      const snippet = truncate($el.find('p').first().text() || $el.text())
      items.push({ title, link: href, pubDate: pubDate || undefined, snippet })
    })

    if (items.length >= 15) break
  }

  // Last resort: extract meaningful links from the page
  if (items.length === 0) {
    $('a[href]').each((_, el) => {
      const $el = $(el)
      const title = $el.text().trim()
      if (title.length < 20) return
      const href = resolveUrl($el.attr('href'))
      if (!href || href === url) return
      const snippet = truncate($el.parent().text())
      items.push({ title, link: href, snippet })
    })
  }

  // Filter: keep only items relevant to this feed's update type
  const typeKws = TYPE_KEYWORDS[feedType]
  const relevant = items.filter(item => {
    const combined = (item.title + ' ' + item.snippet).toLowerCase()
    return (
      typeKws.some(kw => combined.includes(kw)) ||
      // Always keep if strong enforcement/deadline signals present
      ['fine', 'penalt', 'enforcement', 'deadline', 'mandatory', 'revok'].some(kw => combined.includes(kw))
    )
  })

  return relevant.slice(0, 10)
}

// ── Per-source crawler ────────────────────────────────────────────────────────

export interface CrawlSourceResult {
  sourceId: string
  attempted: boolean
  succeeded: boolean
  newUpdates: number
  error?: string
}

async function crawlSource(
  source: RegulatorySource,
  existingUrls: Set<string>,
): Promise<RegulatoryUpdate[]> {
  const discovered: RegulatoryUpdate[] = []
  const seenThisRun = new Set<string>()

  for (const feed of source.feeds) {
    // Politeness delay between feeds from same domain
    await sleep(2_000 + Math.random() * 1_500)

    let rawItems: RawItem[] | null = null

    // Try RSS first
    rawItems = await fetchRss(feed.url)

    // Fall back to HTML
    if (!rawItems) {
      try {
        rawItems = await fetchHtml(feed.url, feed.type)
      } catch (err) {
        // Log but don't crash — skip this feed
        console.warn(`[crawler] ${source.id} ${feed.url}: ${err instanceof Error ? err.message : err}`)
        continue
      }
    }

    for (const item of rawItems) {
      const url = item.link
      if (!url || existingUrls.has(url) || seenThisRun.has(url)) continue

      const fullText = item.title + ' ' + item.snippet
      const type = classifyType(fullText, feed.type)
      const severity = assessSeverity(fullText, type)
      const fineAmount = extractFineAmount(fullText)
      const date = parseDate(item.pubDate)

      seenThisRun.add(url)
      existingUrls.add(url)

      discovered.push({
        id: `${source.id}-${urlHash(url)}`,
        sourceId: source.id,
        jurisdiction: source.jurisdiction,
        jurisdictionCode: source.jurisdictionCode,
        regulator: source.regulator,
        type,
        severity,
        title: item.title,
        summary: item.snippet || item.title,
        url,
        date,
        publishedAt: date,
        fineAmount,
        dispatched: false,
      })
    }
  }

  return discovered
}

// ── Public API ────────────────────────────────────────────────────────────────

export interface CrawlRunResult {
  crawledAt: string
  sources: CrawlSourceResult[]
  newUpdates: RegulatoryUpdate[]
  totalNew: number
  critical: number
  high: number
}

export async function crawlAllSources(
  existingUpdates: RegulatoryUpdate[] = [],
): Promise<CrawlRunResult> {
  const existingUrls = new Set(existingUpdates.map(u => u.url))
  const sources: CrawlSourceResult[] = []
  const allNew: RegulatoryUpdate[] = []

  for (const source of REGULATORY_SOURCES) {
    try {
      const updates = await crawlSource(source, existingUrls)
      sources.push({ sourceId: source.id, attempted: true, succeeded: true, newUpdates: updates.length })
      allNew.push(...updates)
    } catch (err) {
      sources.push({
        sourceId: source.id,
        attempted: true,
        succeeded: false,
        newUpdates: 0,
        error: err instanceof Error ? err.message : String(err),
      })
    }
  }

  return {
    crawledAt: new Date().toISOString(),
    sources,
    newUpdates: allNew,
    totalNew: allNew.length,
    critical: allNew.filter(u => u.severity === 'critical').length,
    high: allNew.filter(u => u.severity === 'high').length,
  }
}
