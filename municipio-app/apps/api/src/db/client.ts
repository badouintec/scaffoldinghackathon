/**
 * DB Client
 * ─────────────────────────────────────────────────────────
 * Usamos Drizzle ORM sobre Turso (libSQL) para desarrollo local.
 * En producción se puede swapear a Cloudflare D1 pasando el binding
 * de Wrangler sin cambiar el esquema.
 *
 * Variables de entorno requeridas:
 *   DATABASE_URL   — libsql://tu-db.turso.io   (o "file:local.db" para local)
 *   DATABASE_TOKEN — token de Turso             (vacío en local)
 */

import { drizzle } from 'drizzle-orm/libsql'
import { createClient } from '@libsql/client'
import * as schema from './schema'

const client = createClient({
  url:       process.env.DATABASE_URL  ?? 'file:local.db',
  authToken: process.env.DATABASE_TOKEN ?? undefined,
})

export const db = drizzle(client, { schema })
export type DB = typeof db
