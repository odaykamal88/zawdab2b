import { index, pgTable, text, timestamp, uniqueIndex, uuid } from 'drizzle-orm/pg-core'

import { organizations } from './tenancy'
import {
  createdAtColumn,
  jsonbObject,
  uuidPrimaryKey,
} from './shared'

export type WebhookProvider = 'chargebee' | 'clerk'
export type WebhookEventStatus = 'received' | 'processed' | 'ignored' | 'failed'

export const webhookEvents = pgTable(
  'webhook_events',
  {
    id: uuidPrimaryKey(),
    provider: text('provider').$type<WebhookProvider>().notNull(),
    externalEventId: text('external_event_id').notNull(),
    eventType: text('event_type').notNull(),
    status: text('status')
      .$type<WebhookEventStatus>()
      .notNull()
      .default('received'),
    receivedAt: createdAtColumn('received_at'),
    processedAt: timestamp('processed_at', {
      withTimezone: true,
      mode: 'date',
    }),
    organizationId: uuid('organization_id').references(() => organizations.id, {
      onDelete: 'set null',
    }),
    payload: jsonbObject<Record<string, unknown>>('payload'),
    errorText: text('error_text'),
  },
  (table) => ({
    providerExternalUnique: uniqueIndex(
      'webhook_events_provider_external_uidx',
    ).on(
      table.provider,
      table.externalEventId,
    ),
    providerStatusIdx: index('webhook_events_provider_status_idx').on(
      table.provider,
      table.status,
      table.receivedAt,
    ),
    organizationReceivedIdx: index('webhook_events_organization_received_idx').on(
      table.organizationId,
      table.receivedAt,
    ),
  }),
)

export type WebhookEvent = typeof webhookEvents.$inferSelect
export type NewWebhookEvent = typeof webhookEvents.$inferInsert
