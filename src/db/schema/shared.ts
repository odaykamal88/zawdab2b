import { sql } from 'drizzle-orm'
import { jsonb, timestamp, uuid } from 'drizzle-orm/pg-core'

export const emptyJsonb = sql`'{}'::jsonb`

export function uuidPrimaryKey(name = 'id') {
  return uuid(name).primaryKey().notNull()
}

export function createdAtColumn(name = 'created_at') {
  return timestamp(name, { withTimezone: true, mode: 'date' })
    .defaultNow()
    .notNull()
}

export function updatedAtColumn(name = 'updated_at') {
  return timestamp(name, { withTimezone: true, mode: 'date' })
    .defaultNow()
    .notNull()
}

export function jsonbObject<T>(name: string) {
  return jsonb(name).$type<T>().notNull().default(emptyJsonb)
}
