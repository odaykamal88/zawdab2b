import { index, pgTable, text, timestamp, uniqueIndex } from 'drizzle-orm/pg-core'

import { createdAtColumn, uuidPrimaryKey } from './shared'

export const marketingSubscribers = pgTable(
  'marketing_subscribers',
  {
    id: uuidPrimaryKey(),
    email: text('email').notNull(),
    source: text('source').notNull(),
    subscribedAt: createdAtColumn('subscribed_at'),
    unsubscribedAt: timestamp('unsubscribed_at', {
      withTimezone: true,
      mode: 'date',
    }),
    createdAt: createdAtColumn(),
  },
  (table) => ({
    emailUnique: uniqueIndex('marketing_subscribers_email_uidx').on(table.email),
    sourceSubscribedIdx: index('marketing_subscribers_source_subscribed_idx').on(
      table.source,
      table.subscribedAt,
    ),
  }),
)

export type MarketingSubscriber = typeof marketingSubscribers.$inferSelect
export type NewMarketingSubscriber = typeof marketingSubscribers.$inferInsert
