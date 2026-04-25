import { loadEnvConfig } from '@next/env'
import { defineConfig } from 'drizzle-kit'

loadEnvConfig(process.cwd())

const connectionString =
  process.env.DATABASE_URL_DIRECT ?? process.env.DATABASE_URL

export default defineConfig({
  dialect: 'postgresql',
  schema: './src/db/schema/index.ts',
  out: './drizzle',
  strict: true,
  verbose: true,
  ...(connectionString
    ? {
        dbCredentials: {
          url: connectionString,
        },
      }
    : {}),
})
