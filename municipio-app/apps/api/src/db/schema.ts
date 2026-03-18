import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core'

// ── Usuarios ──────────────────────────────────────────────
// role: 'ciudadano' | 'empresa' | 'municipio'
export const users = sqliteTable('users', {
  id:        text('id').primaryKey(),            // cuid
  name:      text('name').notNull(),
  email:     text('email').notNull().unique(),
  role:      text('role', { enum: ['ciudadano', 'empresa', 'municipio'] }).notNull(),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
})

// ── Conversaciones ────────────────────────────────────────
export const conversations = sqliteTable('conversations', {
  id:        text('id').primaryKey(),
  userId:    text('user_id').notNull().references(() => users.id),
  title:     text('title'),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull(),
})

// ── Mensajes ──────────────────────────────────────────────
// role: 'user' | 'assistant' | 'system'
export const messages = sqliteTable('messages', {
  id:             text('id').primaryKey(),
  conversationId: text('conversation_id').notNull().references(() => conversations.id),
  role:           text('role', { enum: ['user', 'assistant', 'system'] }).notNull(),
  content:        text('content').notNull(),
  createdAt:      integer('created_at', { mode: 'timestamp' }).notNull(),
})

// ── Tickets (ciudadanía) ───────────────────────────────────
// status: 'abierto' | 'en_proceso' | 'cerrado'
export const tickets = sqliteTable('tickets', {
  id:          text('id').primaryKey(),
  userId:      text('user_id').notNull().references(() => users.id),
  subject:     text('subject').notNull(),
  description: text('description').notNull(),
  status:      text('status', { enum: ['abierto', 'en_proceso', 'cerrado'] }).notNull().default('abierto'),
  category:    text('category').notNull(),       // ej: 'alumbrado', 'baches', 'trámites'
  createdAt:   integer('created_at', { mode: 'timestamp' }).notNull(),
  updatedAt:   integer('updated_at', { mode: 'timestamp' }).notNull(),
})

// ── Reportes (empresas) ───────────────────────────────────
export const reports = sqliteTable('reports', {
  id:          text('id').primaryKey(),
  companyId:   text('company_id').notNull().references(() => users.id),
  title:       text('title').notNull(),
  period:      text('period').notNull(),          // ej: '2024-Q2'
  data:        text('data').notNull(),             // JSON stringify de métricas
  createdAt:   integer('created_at', { mode: 'timestamp' }).notNull(),
})
