import {
  boolean,
  index,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  uuid,
} from 'drizzle-orm/pg-core'

import { regulatoryUpdates } from './regulatory'
import { organizations, users } from './tenancy'
import { createdAtColumn, jsonbObject, uuidPrimaryKey } from './shared'

export type AlertChannel = 'telegram' | 'email'
export type AlertDeliveryStatus = 'queued' | 'sent' | 'failed' | 'skipped'

export const alertSubscriptions = pgTable(
  'alert_subscriptions',
  {
    id: uuidPrimaryKey(),
    organizationId: uuid('organization_id').references(() => organizations.id, {
      onDelete: 'set null',
    }),
    userId: uuid('user_id').references(() => users.id, {
      onDelete: 'set null',
    }),
    channel: text('channel').$type<AlertChannel>().notNull(),
    destination: text('destination').notNull(),
    active: boolean('active').notNull().default(true),
    preferences: jsonbObject<Record<string, unknown>>('preferences'),
    lastSentAt: timestamp('last_sent_at', { withTimezone: true, mode: 'date' }),
    createdAt: createdAtColumn(),
  },
  (table) => ({
    channelDestinationUnique: uniqueIndex(
      'alert_subscriptions_channel_destination_uidx',
    ).on(table.channel, table.destination),
    organizationActiveIdx: index('alert_subscriptions_organization_active_idx').on(
      table.organizationId,
      table.active,
    ),
  }),
)

export const alertDeliveries = pgTable(
  'alert_deliveries',
  {
    id: uuidPrimaryKey(),
    regulatoryUpdateId: uuid('regulatory_update_id')
      .notNull()
      .references(() => regulatoryUpdates.id, { onDelete: 'cascade' }),
    subscriptionId: uuid('subscription_id')
      .notNull()
      .references(() => alertSubscriptions.id, { onDelete: 'cascade' }),
    channel: text('channel').$type<AlertChannel>().notNull(),
    status: text('status').$type<AlertDeliveryStatus>().notNull(),
    attemptedAt: createdAtColumn('attempted_at'),
    deliveredAt: timestamp('delivered_at', {
      withTimezone: true,
      mode: 'date',
    }),
    providerMessageId: text('provider_message_id'),
    errorText: text('error_text'),
  },
  (table) => ({
    updateSubscriptionChannelUnique: uniqueIndex(
      'alert_deliveries_update_subscription_channel_uidx',
    ).on(table.regulatoryUpdateId, table.subscriptionId, table.channel),
    statusAttemptedIdx: index('alert_deliveries_status_attempted_idx').on(
      table.status,
      table.attemptedAt,
    ),
  }),
)

export type AlertSubscription = typeof alertSubscriptions.$inferSelect
export type NewAlertSubscription = typeof alertSubscriptions.$inferInsert
export type AlertDelivery = typeof alertDeliveries.$inferSelect
export type NewAlertDelivery = typeof alertDeliveries.$inferInsert
