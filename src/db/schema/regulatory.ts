import { boolean, index, pgTable, text, timestamp, uniqueIndex } from 'drizzle-orm/pg-core'

import { createdAtColumn, jsonbObject, uuidPrimaryKey } from './shared'

export type RegulatoryUpdateType =
  | 'regulation'
  | 'deadline'
  | 'guidance'
  | 'consultation'
export type RegulatorySeverity = 'critical' | 'high' | 'medium' | 'low'

export const regulatorySources = pgTable('regulatory_sources', {
  id: text('id').primaryKey().notNull(),
  name: text('name').notNull(),
  jurisdictionCode: text('jurisdiction_code').notNull(),
  feedUrl: text('feed_url'),
  active: boolean('active').notNull().default(true),
  lastCrawledAt: timestamp('last_crawled_at', {
    withTimezone: true,
    mode: 'date',
  }),
  createdAt: createdAtColumn(),
})

export const regulatoryUpdates = pgTable(
  'regulatory_updates',
  {
    id: uuidPrimaryKey(),
    sourceId: text('source_id')
      .notNull()
      .references(() => regulatorySources.id, { onDelete: 'cascade' }),
    jurisdictionCode: text('jurisdiction_code').notNull(),
    regulator: text('regulator').notNull(),
    updateType: text('update_type').$type<RegulatoryUpdateType>().notNull(),
    severity: text('severity').$type<RegulatorySeverity>().notNull(),
    title: text('title').notNull(),
    summary: text('summary').notNull(),
    canonicalUrl: text('canonical_url').notNull(),
    sourcePublishedAt: timestamp('source_published_at', {
      withTimezone: true,
      mode: 'date',
    }).notNull(),
    effectiveAt: timestamp('effective_at', { withTimezone: true, mode: 'date' }),
    deadlineAt: timestamp('deadline_at', { withTimezone: true, mode: 'date' }),
    contentHash: text('content_hash').notNull(),
    metadata: jsonbObject<Record<string, unknown>>('metadata'),
    createdAt: createdAtColumn(),
  },
  (table) => ({
    sourceContentUnique: uniqueIndex('regulatory_updates_source_content_uidx').on(
      table.sourceId,
      table.contentHash,
    ),
    jurisdictionPublishedIdx: index(
      'regulatory_updates_jurisdiction_published_idx',
    ).on(table.jurisdictionCode, table.sourcePublishedAt),
    severityPublishedIdx: index('regulatory_updates_severity_published_idx').on(
      table.severity,
      table.sourcePublishedAt,
    ),
  }),
)

export type RegulatorySource = typeof regulatorySources.$inferSelect
export type NewRegulatorySource = typeof regulatorySources.$inferInsert
export type RegulatoryUpdate = typeof regulatoryUpdates.$inferSelect
export type NewRegulatoryUpdate = typeof regulatoryUpdates.$inferInsert
