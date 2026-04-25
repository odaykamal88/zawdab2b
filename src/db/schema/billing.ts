import {
  index,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  uuid,
} from 'drizzle-orm/pg-core'

import { organizations } from './tenancy'
import { createdAtColumn, updatedAtColumn, uuidPrimaryKey } from './shared'

export type BillingProvider = 'chargebee'
export type BillingAccountStatus = 'active' | 'inactive'
export type SubscriptionStatus =
  | 'free'
  | 'trialing'
  | 'active'
  | 'non_renewing'
  | 'paused'
  | 'cancelled'

export const billingAccounts = pgTable(
  'billing_accounts',
  {
    id: uuidPrimaryKey(),
    organizationId: uuid('organization_id')
      .notNull()
      .references(() => organizations.id, { onDelete: 'cascade' }),
    provider: text('provider').$type<BillingProvider>().notNull(),
    providerCustomerId: text('provider_customer_id').notNull(),
    billingEmail: text('billing_email'),
    currencyCode: text('currency_code'),
    status: text('status')
      .$type<BillingAccountStatus>()
      .notNull()
      .default('active'),
    createdAt: createdAtColumn(),
    updatedAt: updatedAtColumn(),
  },
  (table) => ({
    organizationUnique: uniqueIndex('billing_accounts_org_uidx').on(
      table.organizationId,
    ),
    providerCustomerUnique: uniqueIndex(
      'billing_accounts_provider_customer_uidx',
    ).on(table.provider, table.providerCustomerId),
  }),
)

export const subscriptions = pgTable(
  'subscriptions',
  {
    id: uuidPrimaryKey(),
    organizationId: uuid('organization_id')
      .notNull()
      .references(() => organizations.id, { onDelete: 'cascade' }),
    billingAccountId: uuid('billing_account_id')
      .notNull()
      .references(() => billingAccounts.id, { onDelete: 'cascade' }),
    provider: text('provider').$type<BillingProvider>().notNull(),
    providerSubscriptionId: text('provider_subscription_id'),
    planId: text('plan_id').notNull(),
    status: text('status').$type<SubscriptionStatus>().notNull(),
    currentPeriodStart: timestamp('current_period_start', {
      withTimezone: true,
      mode: 'date',
    }),
    currentPeriodEnd: timestamp('current_period_end', {
      withTimezone: true,
      mode: 'date',
    }),
    trialEnd: timestamp('trial_end', { withTimezone: true, mode: 'date' }),
    cancelAt: timestamp('cancel_at', { withTimezone: true, mode: 'date' }),
    providerUpdatedAt: timestamp('provider_updated_at', {
      withTimezone: true,
      mode: 'date',
    }),
    updatedAt: updatedAtColumn(),
  },
  (table) => ({
    providerSubscriptionUnique: uniqueIndex(
      'subscriptions_provider_subscription_uidx',
    ).on(table.provider, table.providerSubscriptionId),
    organizationStatusIdx: index('subscriptions_org_status_idx').on(
      table.organizationId,
      table.status,
    ),
    planStatusIdx: index('subscriptions_plan_status_idx').on(
      table.planId,
      table.status,
    ),
  }),
)

export type BillingAccount = typeof billingAccounts.$inferSelect
export type NewBillingAccount = typeof billingAccounts.$inferInsert
export type Subscription = typeof subscriptions.$inferSelect
export type NewSubscription = typeof subscriptions.$inferInsert
