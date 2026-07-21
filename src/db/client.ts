import { neon } from '@neondatabase/serverless'
import { drizzle, type NeonHttpDatabase } from 'drizzle-orm/neon-http'

import * as schema from './schema'

let db: NeonHttpDatabase<typeof schema> | null = null

function getDatabaseUrl(): string {
  const url = process.env.DATABASE_URL

  if (!url) {
    throw new Error(
      'DATABASE_URL is required before calling getDb(). ' +
        'Set it in Vercel project settings or .env.local.',
    )
  }

  return url
}

export function getDb(): NeonHttpDatabase<typeof schema> {
  // Lazy init keeps module evaluation build-safe in Next.js.
  if (!db) {
    db = drizzle(neon(getDatabaseUrl()), { schema })
  }

  return db
}

export type Db = ReturnType<typeof getDb>
