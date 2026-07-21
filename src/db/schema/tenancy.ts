import {
  boolean,
  index,
  pgTable,
  primaryKey,
  text,
  timestamp,
  uniqueIndex,
  uuid,
} from 'drizzle-orm/pg-core'

import {
  createdAtColumn,
  updatedAtColumn,
  uuidPrimaryKey,
} from './shared'

export type UserStatus = 'active' | 'invited' | 'disabled'
export type OrganizationStatus = 'active' | 'trialing' | 'suspended' | 'closed'
export type OrganizationMemberRole =
  | 'owner'
  | 'admin'
  | 'member'
  | 'auditor'
  | 'billing'

export const users = pgTable(
  'users',
  {
    id: uuidPrimaryKey(),
    clerkUserId: text('clerk_user_id').notNull(),
    primaryEmail: text('primary_email'),
    firstName: text('first_name'),
    lastName: text('last_name'),
    status: text('status').$type<UserStatus>().notNull().default('active'),
    createdAt: createdAtColumn(),
    updatedAt: updatedAtColumn(),
  },
  (table) => ({
    clerkUserIdUnique: uniqueIndex('users_clerk_user_id_uidx').on(
      table.clerkUserId,
    ),
    primaryEmailIdx: index('users_primary_email_idx').on(table.primaryEmail),
  }),
)

export const organizations = pgTable(
  'organizations',
  {
    id: uuidPrimaryKey(),
    slug: text('slug').notNull(),
    legalName: text('legal_name').notNull(),
    displayName: text('display_name'),
    websiteUrl: text('website_url'),
    primaryJurisdictionCode: text('primary_jurisdiction_code'),
    status: text('status')
      .$type<OrganizationStatus>()
      .notNull()
      .default('active'),
    createdAt: createdAtColumn(),
    updatedAt: updatedAtColumn(),
  },
  (table) => ({
    slugUnique: uniqueIndex('organizations_slug_uidx').on(table.slug),
    primaryJurisdictionIdx: index('organizations_jurisdiction_idx').on(
      table.primaryJurisdictionCode,
    ),
  }),
)

export const organizationMembers = pgTable(
  'organization_members',
  {
    organizationId: uuid('organization_id')
      .notNull()
      .references(() => organizations.id, { onDelete: 'cascade' }),
    userId: uuid('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    role: text('role').$type<OrganizationMemberRole>().notNull(),
    isPrimaryContact: boolean('is_primary_contact').notNull().default(false),
    joinedAt: timestamp('joined_at', { withTimezone: true, mode: 'date' })
      .defaultNow()
      .notNull(),
    createdAt: createdAtColumn(),
  },
  (table) => ({
    pk: primaryKey({
      name: 'organization_members_pkey',
      columns: [table.organizationId, table.userId],
    }),
    userOrgIdx: index('organization_members_user_org_idx').on(
      table.userId,
      table.organizationId,
    ),
    orgRoleIdx: index('organization_members_org_role_idx').on(
      table.organizationId,
      table.role,
    ),
  }),
)

export type User = typeof users.$inferSelect
export type NewUser = typeof users.$inferInsert
export type Organization = typeof organizations.$inferSelect
export type NewOrganization = typeof organizations.$inferInsert
export type OrganizationMember = typeof organizationMembers.$inferSelect
export type NewOrganizationMember = typeof organizationMembers.$inferInsert
