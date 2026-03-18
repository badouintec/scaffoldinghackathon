# 🏛️ Scaffolding: App Municipio-Empresa-Ciudadanía
> Stack: Hono (API + DB via Hono) · Vite + React · TypeScript

---

## 📁 Estructura de Directorios

```
municipio-app/
├── package.json                    # Root (monorepo workspaces)
├── tsconfig.base.json
├── .env.example
│
├── apps/
│   ├── api/                        # Backend — Hono
│   │   ├── package.json
│   │   ├── tsconfig.json
│   │   ├── wrangler.toml           # Cloudflare Workers (opcional)
│   │   └── src/
│   │       ├── index.ts            # Entry point Hono
│   │       ├── db/
│   │       │   ├── client.ts       # Conexión a Hono DB (D1 / Turso)
│   │       │   ├── schema.ts       # Drizzle schema
│   │       │   └── migrations/
│   │       │       └── 0001_init.sql
│   │       ├── routes/
│   │       │   ├── chat.ts         # /api/chat
│   │       │   ├── messages.ts     # /api/messages
│   │       │   ├── users.ts        # /api/users
│   │       │   ├── tickets.ts      # /api/tickets (tablero ciudadanía)
│   │       │   └── reports.ts      # /api/reports (tablero empresas)
│   │       ├── middleware/
│   │       │   ├── auth.ts         # JWT / Bearer
│   │       │   └── cors.ts
│   │       └── lib/
│   │           └── ai.ts           # Claude SDK wrapper
│   │
│   └── web/                        # Frontend — Vite + React
│       ├── package.json
│       ├── vite.config.ts
│       ├── tsconfig.json
│       ├── index.html
│       └── src/
│           ├── main.tsx
│           ├── App.tsx
│           ├── api/
│           │   └── client.ts       # Fetch wrapper apuntando a Hono
│           ├── components/
│           │   ├── chat/
│           │   │   ├── ChatWindow.tsx
│           │   │   ├── MessageBubble.tsx
│           │   │   └── InputBar.tsx
│           │   └── ui/
│           │       ├── Button.tsx
│           │       ├── Badge.tsx
│           │       └── Card.tsx
│           ├── pages/
│           │   ├── ChatPage.tsx          # Chatbot principal
│           │   ├── DashboardCiudadania.tsx
│           │   └── DashboardEmpresas.tsx
│           ├── hooks/
│           │   ├── useChat.ts
│           │   └── useTickets.ts
│           └── types/
│               └── index.ts
│
└── packages/
    └── shared/                     # Tipos compartidos API ↔ Frontend
        ├── package.json
        └── src/
            └── types.ts
```

---

## 📦 Root `package.json`

```json
{
  "name": "municipio-app",
  "private": true,
  "workspaces": ["apps/*", "packages/*"],
  "scripts": {
    "dev": "concurrently \"npm run dev -w apps/api\" \"npm run dev -w apps/web\"",
    "build": "npm run build -w apps/api && npm run build -w apps/web",
    "db:migrate": "npm run migrate -w apps/api",
    "db:studio": "drizzle-kit studio"
  },
  "devDependencies": {
    "concurrently": "^8.2.2",
    "typescript": "^5.4.0"
  }
}
```

---

## 🔧 `tsconfig.base.json`

```json
{
  "compilerOptions": {
    "target": "ESNext",
    "module": "ESNext",
    "moduleResolution": "bundler",
    "strict": true,
    "skipLibCheck": true,
    "esModuleInterop": true,
    "resolveJsonModule": true,
    "paths": {
      "@municipio/shared": ["../../packages/shared/src/types.ts"]
    }
  }
}
```

---

## 🗄️ Backend — Hono API

### `apps/api/package.json`

```json
{
  "name": "@municipio/api",
  "version": "0.1.0",
  "type": "module",
  "scripts": {
    "dev": "tsx watch src/index.ts",
    "build": "tsc",
    "migrate": "drizzle-kit push"
  },
  "dependencies": {
    "@anthropic-ai/sdk": "^0.27.0",
    "@hono/node-server": "^1.12.0",
    "drizzle-orm": "^0.30.0",
    "hono": "^4.4.0",
    "@libsql/client": "^0.6.0"
  },
  "devDependencies": {
    "drizzle-kit": "^0.21.0",
    "tsx": "^4.7.0",
    "typescript": "^5.4.0"
  }
}
```

---

### `apps/api/src/index.ts` — Entry Point Hono

```typescript
import { Hono } from 'hono'
import { serve } from '@hono/node-server'
import { corsMiddleware } from './middleware/cors'
import { chatRoutes } from './routes/chat'
import { messagesRoutes } from './routes/messages'
import { usersRoutes } from './routes/users'
import { ticketsRoutes } from './routes/tickets'
import { reportsRoutes } from './routes/reports'

const app = new Hono()

// ── Middleware global ──────────────────────────────────────
app.use('*', corsMiddleware)

// ── Health check ───────────────────────────────────────────
app.get('/health', (c) => c.json({ status: 'ok', ts: new Date().toISOString() }))

// ── Rutas ─────────────────────────────────────────────────
app.route('/api/chat',     chatRoutes)
app.route('/api/messages', messagesRoutes)
app.route('/api/users',    usersRoutes)
app.route('/api/tickets',  ticketsRoutes)
app.route('/api/reports',  reportsRoutes)

// ── Servidor ──────────────────────────────────────────────
const PORT = Number(process.env.PORT ?? 3001)
serve({ fetch: app.fetch, port: PORT }, () => {
  console.log(`🚀 API corriendo en http://localhost:${PORT}`)
})

export default app
```

---

### `apps/api/src/db/client.ts` — Conexión Hono + Turso / D1

```typescript
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
```

---

### `apps/api/src/db/schema.ts` — Drizzle Schema

```typescript
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
```

---

### `apps/api/src/db/migrations/0001_init.sql`

```sql
-- Usuarios
CREATE TABLE IF NOT EXISTS users (
  id         TEXT PRIMARY KEY,
  name       TEXT NOT NULL,
  email      TEXT NOT NULL UNIQUE,
  role       TEXT NOT NULL CHECK(role IN ('ciudadano','empresa','municipio')),
  created_at INTEGER NOT NULL
);

-- Conversaciones
CREATE TABLE IF NOT EXISTS conversations (
  id         TEXT PRIMARY KEY,
  user_id    TEXT NOT NULL REFERENCES users(id),
  title      TEXT,
  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL
);

-- Mensajes
CREATE TABLE IF NOT EXISTS messages (
  id              TEXT PRIMARY KEY,
  conversation_id TEXT NOT NULL REFERENCES conversations(id),
  role            TEXT NOT NULL CHECK(role IN ('user','assistant','system')),
  content         TEXT NOT NULL,
  created_at      INTEGER NOT NULL
);

-- Tickets
CREATE TABLE IF NOT EXISTS tickets (
  id          TEXT PRIMARY KEY,
  user_id     TEXT NOT NULL REFERENCES users(id),
  subject     TEXT NOT NULL,
  description TEXT NOT NULL,
  status      TEXT NOT NULL DEFAULT 'abierto'
               CHECK(status IN ('abierto','en_proceso','cerrado')),
  category    TEXT NOT NULL,
  created_at  INTEGER NOT NULL,
  updated_at  INTEGER NOT NULL
);

-- Reportes
CREATE TABLE IF NOT EXISTS reports (
  id         TEXT PRIMARY KEY,
  company_id TEXT NOT NULL REFERENCES users(id),
  title      TEXT NOT NULL,
  period     TEXT NOT NULL,
  data       TEXT NOT NULL,
  created_at INTEGER NOT NULL
);
```

---

### `apps/api/src/middleware/cors.ts`

```typescript
import { cors } from 'hono/cors'

export const corsMiddleware = cors({
  origin: process.env.FRONTEND_URL ?? 'http://localhost:5173',
  allowMethods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowHeaders: ['Content-Type', 'Authorization'],
})
```

---

### `apps/api/src/middleware/auth.ts`

```typescript
import { createMiddleware } from 'hono/factory'
import { HTTPException } from 'hono/http-exception'

/**
 * Middleware de autenticación Bearer.
 * En producción reemplazar con verificación JWT real (jose / hono/jwt).
 */
export const requireAuth = createMiddleware(async (c, next) => {
  const auth = c.req.header('Authorization')
  if (!auth?.startsWith('Bearer ')) {
    throw new HTTPException(401, { message: 'No autorizado' })
  }
  // TODO: verificar JWT y guardar payload en c.set('user', payload)
  await next()
})
```

---

### `apps/api/src/lib/ai.ts` — Wrapper Claude SDK

```typescript
/**
 * Wrapper para Anthropic Claude.
 * Se puede swapear por OpenAI / Ollama cambiando sólo este archivo.
 *
 * Variable de entorno requerida:
 *   ANTHROPIC_API_KEY
 */
import Anthropic from '@anthropic-ai/sdk'

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
})

export interface ChatMessage {
  role: 'user' | 'assistant'
  content: string
}

const SYSTEM_PROMPT = `
Eres el asistente oficial del Municipio. Ayudas a ciudadanos, empresas y funcionarios.
- Para ciudadanos: orientas sobre trámites, servicios y quejas.
- Para empresas: informas sobre licencias, permisos y programas de apoyo.
- Para municipio: ayudas con redacción de documentos y consultas internas.
Responde siempre en español, de forma clara y empática.
`.trim()

/**
 * Envía mensajes al modelo y devuelve el texto de respuesta.
 */
export async function chat(messages: ChatMessage[]): Promise<string> {
  const response = await anthropic.messages.create({
    model:      'claude-sonnet-4-20250514',
    max_tokens: 1024,
    system:     SYSTEM_PROMPT,
    messages,
  })

  const block = response.content[0]
  if (block.type !== 'text') throw new Error('Respuesta inesperada del modelo')
  return block.text
}
```

---

### `apps/api/src/routes/chat.ts`

```typescript
import { Hono } from 'hono'
import { zValidator } from '@hono/zod-validator'
import { z } from 'zod'
import { db } from '../db/client'
import { messages, conversations } from '../db/schema'
import { chat as aiChat } from '../lib/ai'
import { requireAuth } from '../middleware/auth'

export const chatRoutes = new Hono()

const sendSchema = z.object({
  conversationId: z.string(),
  content:        z.string().min(1).max(4000),
})

/**
 * POST /api/chat/send
 * Envía un mensaje y devuelve la respuesta del asistente.
 * Guarda ambos mensajes en la base de datos.
 */
chatRoutes.post('/send', requireAuth, zValidator('json', sendSchema), async (c) => {
  const { conversationId, content } = c.req.valid('json')

  // 1. Cargar historial de la conversación
  const history = await db.query.messages.findMany({
    where: (m, { eq }) => eq(m.conversationId, conversationId),
    orderBy: (m, { asc }) => [asc(m.createdAt)],
  })

  // 2. Armar array para el SDK
  const chatHistory = history.map((m) => ({
    role:    m.role as 'user' | 'assistant',
    content: m.content,
  }))
  chatHistory.push({ role: 'user', content })

  // 3. Guardar mensaje del usuario
  await db.insert(messages).values({
    id:             crypto.randomUUID(),
    conversationId,
    role:           'user',
    content,
    createdAt:      new Date(),
  })

  // 4. Llamar al modelo
  const reply = await aiChat(chatHistory)

  // 5. Guardar respuesta del asistente
  await db.insert(messages).values({
    id:             crypto.randomUUID(),
    conversationId,
    role:           'assistant',
    content:        reply,
    createdAt:      new Date(),
  })

  return c.json({ reply })
})

/**
 * POST /api/chat/conversations
 * Crea una nueva conversación.
 */
chatRoutes.post('/conversations', requireAuth, async (c) => {
  const id = crypto.randomUUID()
  const now = new Date()
  await db.insert(conversations).values({
    id,
    userId:    'TODO-from-jwt',   // reemplazar con c.get('user').id
    title:     'Nueva conversación',
    createdAt: now,
    updatedAt: now,
  })
  return c.json({ id }, 201)
})
```

---

### `apps/api/src/routes/tickets.ts`

```typescript
import { Hono } from 'hono'
import { zValidator } from '@hono/zod-validator'
import { z } from 'zod'
import { db } from '../db/client'
import { tickets } from '../db/schema'
import { requireAuth } from '../middleware/auth'

export const ticketsRoutes = new Hono()

const createSchema = z.object({
  subject:     z.string().min(3),
  description: z.string().min(10),
  category:    z.string(),
})

/** GET /api/tickets — Lista todos los tickets (municipio) */
ticketsRoutes.get('/', requireAuth, async (c) => {
  const all = await db.select().from(tickets)
  return c.json(all)
})

/** POST /api/tickets — Ciudadano crea ticket */
ticketsRoutes.post('/', requireAuth, zValidator('json', createSchema), async (c) => {
  const body = c.req.valid('json')
  const now  = new Date()
  const id   = crypto.randomUUID()

  await db.insert(tickets).values({
    id,
    userId:      'TODO-from-jwt',
    subject:     body.subject,
    description: body.description,
    category:    body.category,
    status:      'abierto',
    createdAt:   now,
    updatedAt:   now,
  })

  return c.json({ id }, 201)
})

/** PATCH /api/tickets/:id — Actualizar estado */
ticketsRoutes.patch('/:id', requireAuth, async (c) => {
  const { id }    = c.req.param()
  const { status } = await c.req.json<{ status: string }>()

  await db.update(tickets)
    .set({ status: status as any, updatedAt: new Date() })
    .where((t, { eq }) => eq(t.id, id))

  return c.json({ ok: true })
})
```

---

### `apps/api/src/routes/reports.ts`

```typescript
import { Hono } from 'hono'
import { db } from '../db/client'
import { reports } from '../db/schema'
import { requireAuth } from '../middleware/auth'

export const reportsRoutes = new Hono()

/** GET /api/reports — Empresa ve sus reportes */
reportsRoutes.get('/', requireAuth, async (c) => {
  const all = await db.select().from(reports)
  return c.json(all)
})

/** POST /api/reports — Empresa sube reporte */
reportsRoutes.post('/', requireAuth, async (c) => {
  const body = await c.req.json()
  const id   = crypto.randomUUID()

  await db.insert(reports).values({
    id,
    companyId:  'TODO-from-jwt',
    title:      body.title,
    period:     body.period,
    data:       JSON.stringify(body.data),
    createdAt:  new Date(),
  })

  return c.json({ id }, 201)
})
```

---

### `apps/api/src/routes/messages.ts`

```typescript
import { Hono } from 'hono'
import { db } from '../db/client'
import { messages } from '../db/schema'
import { requireAuth } from '../middleware/auth'

export const messagesRoutes = new Hono()

/** GET /api/messages/:conversationId */
messagesRoutes.get('/:conversationId', requireAuth, async (c) => {
  const { conversationId } = c.req.param()
  const msgs = await db.query.messages.findMany({
    where: (m, { eq }) => eq(m.conversationId, conversationId),
    orderBy: (m, { asc }) => [asc(m.createdAt)],
  })
  return c.json(msgs)
})
```

---

### `apps/api/src/routes/users.ts`

```typescript
import { Hono } from 'hono'
import { zValidator } from '@hono/zod-validator'
import { z } from 'zod'
import { db } from '../db/client'
import { users } from '../db/schema'

export const usersRoutes = new Hono()

const registerSchema = z.object({
  name:  z.string().min(2),
  email: z.string().email(),
  role:  z.enum(['ciudadano', 'empresa', 'municipio']),
})

/** POST /api/users/register */
usersRoutes.post('/register', zValidator('json', registerSchema), async (c) => {
  const body = c.req.valid('json')
  const id   = crypto.randomUUID()

  await db.insert(users).values({
    id,
    ...body,
    createdAt: new Date(),
  })

  return c.json({ id }, 201)
})

/** GET /api/users/:id */
usersRoutes.get('/:id', async (c) => {
  const user = await db.query.users.findFirst({
    where: (u, { eq }) => eq(u.id, c.req.param('id')),
  })
  if (!user) return c.json({ error: 'No encontrado' }, 404)
  return c.json(user)
})
```

---

## 🎨 Frontend — Vite + React

### `apps/web/package.json`

```json
{
  "name": "@municipio/web",
  "version": "0.1.0",
  "type": "module",
  "scripts": {
    "dev":     "vite",
    "build":   "tsc && vite build",
    "preview": "vite preview"
  },
  "dependencies": {
    "react":       "^18.3.0",
    "react-dom":   "^18.3.0",
    "react-router-dom": "^6.23.0"
  },
  "devDependencies": {
    "@types/react":        "^18.3.0",
    "@types/react-dom":    "^18.3.0",
    "@vitejs/plugin-react": "^4.3.0",
    "typescript": "^5.4.0",
    "vite":       "^5.3.0"
  }
}
```

---

### `apps/web/vite.config.ts`

```typescript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      // Redirige /api/* al servidor Hono en desarrollo
      '/api': {
        target:    'http://localhost:3001',
        changeOrigin: true,
      },
    },
  },
})
```

---

### `apps/web/src/api/client.ts` — Fetch wrapper

```typescript
/**
 * Cliente HTTP que apunta a la API Hono.
 * En producción cambia BASE_URL a tu dominio.
 */
const BASE_URL = import.meta.env.VITE_API_URL ?? '/api'

async function request<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const token = localStorage.getItem('token') // JWT guardado al login

  const res = await fetch(`${BASE_URL}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  })

  if (!res.ok) {
    const error = await res.json().catch(() => ({ message: res.statusText }))
    throw new Error(error.message ?? 'Error de red')
  }

  return res.json() as Promise<T>
}

export const api = {
  get:    <T>(path: string)                      => request<T>(path),
  post:   <T>(path: string, body: unknown)       => request<T>(path, { method: 'POST',  body: JSON.stringify(body) }),
  patch:  <T>(path: string, body: unknown)       => request<T>(path, { method: 'PATCH', body: JSON.stringify(body) }),
  delete: <T>(path: string)                      => request<T>(path, { method: 'DELETE' }),
}
```

---

### `packages/shared/src/types.ts` — Tipos compartidos

```typescript
// ── Usuarios ──────────────────────────────────────────────
export type UserRole = 'ciudadano' | 'empresa' | 'municipio'

export interface User {
  id:        string
  name:      string
  email:     string
  role:      UserRole
  createdAt: Date
}

// ── Chat ──────────────────────────────────────────────────
export interface Conversation {
  id:        string
  userId:    string
  title:     string | null
  createdAt: Date
  updatedAt: Date
}

export interface Message {
  id:             string
  conversationId: string
  role:           'user' | 'assistant' | 'system'
  content:        string
  createdAt:      Date
}

// ── Tickets ───────────────────────────────────────────────
export type TicketStatus   = 'abierto' | 'en_proceso' | 'cerrado'
export type TicketCategory = 'alumbrado' | 'baches' | 'trámites' | 'agua' | 'otro'

export interface Ticket {
  id:          string
  userId:      string
  subject:     string
  description: string
  status:      TicketStatus
  category:    TicketCategory
  createdAt:   Date
  updatedAt:   Date
}

// ── Reportes ──────────────────────────────────────────────
export interface Report {
  id:        string
  companyId: string
  title:     string
  period:    string
  data:      Record<string, unknown>
  createdAt: Date
}

// ── API Responses ─────────────────────────────────────────
export interface ChatSendResponse { reply:  string }
export interface CreateResponse   { id:     string }
```

---

### `apps/web/src/types/index.ts`

```typescript
// Re-exporta los tipos compartidos para comodidad dentro del frontend
export * from '@municipio/shared'
```

---

### `apps/web/src/hooks/useChat.ts`

```typescript
import { useState, useCallback } from 'react'
import { api } from '../api/client'
import type { Message, ChatSendResponse } from '../types'

export function useChat(conversationId: string) {
  const [messages,  setMessages]  = useState<Message[]>([])
  const [loading,   setLoading]   = useState(false)
  const [error,     setError]     = useState<string | null>(null)

  const sendMessage = useCallback(async (content: string) => {
    // Optimistic update — agrega mensaje del usuario inmediatamente
    const optimistic: Message = {
      id:             crypto.randomUUID(),
      conversationId,
      role:           'user',
      content,
      createdAt:      new Date(),
    }
    setMessages((prev) => [...prev, optimistic])
    setLoading(true)
    setError(null)

    try {
      const { reply } = await api.post<ChatSendResponse>('/chat/send', {
        conversationId,
        content,
      })

      const assistantMsg: Message = {
        id:             crypto.randomUUID(),
        conversationId,
        role:           'assistant',
        content:        reply,
        createdAt:      new Date(),
      }
      setMessages((prev) => [...prev, assistantMsg])
    } catch (err) {
      setError((err as Error).message)
    } finally {
      setLoading(false)
    }
  }, [conversationId])

  return { messages, loading, error, sendMessage }
}
```

---

### `apps/web/src/hooks/useTickets.ts`

```typescript
import { useState, useEffect } from 'react'
import { api } from '../api/client'
import type { Ticket } from '../types'

export function useTickets() {
  const [tickets,  setTickets]  = useState<Ticket[]>([])
  const [loading,  setLoading]  = useState(true)
  const [error,    setError]    = useState<string | null>(null)

  useEffect(() => {
    api.get<Ticket[]>('/tickets')
      .then(setTickets)
      .catch((e: Error) => setError(e.message))
      .finally(() => setLoading(false))
  }, [])

  const updateStatus = async (id: string, status: Ticket['status']) => {
    await api.patch(`/tickets/${id}`, { status })
    setTickets((prev) =>
      prev.map((t) => (t.id === id ? { ...t, status } : t))
    )
  }

  return { tickets, loading, error, updateStatus }
}
```

---

### `apps/web/src/components/chat/ChatWindow.tsx`

```tsx
import { useEffect, useRef } from 'react'
import { useChat } from '../../hooks/useChat'
import { MessageBubble } from './MessageBubble'
import { InputBar } from './InputBar'

interface Props {
  conversationId: string
}

export function ChatWindow({ conversationId }: Props) {
  const { messages, loading, error, sendMessage } = useChat(conversationId)
  const bottomRef = useRef<HTMLDivElement>(null)

  // Auto-scroll al último mensaje
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  return (
    <div className="chat-window">
      <div className="chat-messages">
        {messages.map((msg) => (
          <MessageBubble key={msg.id} message={msg} />
        ))}
        {loading && <div className="chat-typing">Escribiendo…</div>}
        {error   && <div className="chat-error">{error}</div>}
        <div ref={bottomRef} />
      </div>
      <InputBar onSend={sendMessage} disabled={loading} />
    </div>
  )
}
```

---

### `apps/web/src/components/chat/MessageBubble.tsx`

```tsx
import type { Message } from '../../types'

interface Props { message: Message }

export function MessageBubble({ message }: Props) {
  const isUser = message.role === 'user'
  return (
    <div className={`bubble bubble--${isUser ? 'user' : 'assistant'}`}>
      <p>{message.content}</p>
      <time>{new Date(message.createdAt).toLocaleTimeString()}</time>
    </div>
  )
}
```

---

### `apps/web/src/components/chat/InputBar.tsx`

```tsx
import { useState, type KeyboardEvent } from 'react'

interface Props {
  onSend:   (text: string) => void
  disabled: boolean
}

export function InputBar({ onSend, disabled }: Props) {
  const [text, setText] = useState('')

  const submit = () => {
    const trimmed = text.trim()
    if (!trimmed) return
    onSend(trimmed)
    setText('')
  }

  const onKey = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      submit()
    }
  }

  return (
    <div className="input-bar">
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        onKeyDown={onKey}
        placeholder="Escribe tu mensaje… (Enter para enviar)"
        disabled={disabled}
        rows={2}
      />
      <button onClick={submit} disabled={disabled || !text.trim()}>
        Enviar
      </button>
    </div>
  )
}
```

---

### `apps/web/src/pages/ChatPage.tsx`

```tsx
import { useState, useEffect } from 'react'
import { ChatWindow } from '../components/chat/ChatWindow'
import { api } from '../api/client'

/**
 * Página principal del chatbot.
 * Crea una conversación nueva al montar y la pasa al ChatWindow.
 */
export default function ChatPage() {
  const [conversationId, setConversationId] = useState<string | null>(null)

  useEffect(() => {
    api.post<{ id: string }>('/chat/conversations', {})
      .then(({ id }) => setConversationId(id))
      .catch(console.error)
  }, [])

  if (!conversationId) return <div>Iniciando conversación…</div>

  return (
    <main className="page chat-page">
      <header>
        <h1>Asistente Municipal</h1>
        <p>¿En qué te podemos ayudar hoy?</p>
      </header>
      <ChatWindow conversationId={conversationId} />
    </main>
  )
}
```

---

### `apps/web/src/pages/DashboardCiudadania.tsx`

```tsx
import { useTickets } from '../hooks/useTickets'
import type { Ticket } from '../types'

/**
 * Tablero para funcionarios municipales.
 * Muestra tickets de ciudadanos con controles de estado.
 */
export default function DashboardCiudadania() {
  const { tickets, loading, error, updateStatus } = useTickets()

  if (loading) return <div>Cargando tickets…</div>
  if (error)   return <div>Error: {error}</div>

  const byStatus = (s: Ticket['status']) => tickets.filter((t) => t.status === s)

  return (
    <main className="page dashboard">
      <h1>Tablero Ciudadanía</h1>

      <div className="kanban">
        {(['abierto', 'en_proceso', 'cerrado'] as const).map((status) => (
          <div key={status} className={`kanban-col kanban-col--${status}`}>
            <h2>{status.replace('_', ' ')}</h2>
            {byStatus(status).map((ticket) => (
              <TicketCard
                key={ticket.id}
                ticket={ticket}
                onStatusChange={updateStatus}
              />
            ))}
          </div>
        ))}
      </div>
    </main>
  )
}

function TicketCard({
  ticket,
  onStatusChange,
}: {
  ticket: Ticket
  onStatusChange: (id: string, s: Ticket['status']) => void
}) {
  return (
    <div className="ticket-card">
      <span className="ticket-category">{ticket.category}</span>
      <h3>{ticket.subject}</h3>
      <p>{ticket.description}</p>
      <select
        value={ticket.status}
        onChange={(e) => onStatusChange(ticket.id, e.target.value as Ticket['status'])}
      >
        <option value="abierto">Abierto</option>
        <option value="en_proceso">En proceso</option>
        <option value="cerrado">Cerrado</option>
      </select>
    </div>
  )
}
```

---

### `apps/web/src/pages/DashboardEmpresas.tsx`

```tsx
import { useState, useEffect } from 'react'
import { api } from '../api/client'
import type { Report } from '../types'

/**
 * Tablero para empresas.
 * Lista sus reportes periódicos y permite crear nuevos.
 */
export default function DashboardEmpresas() {
  const [reports, setReports] = useState<Report[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get<Report[]>('/reports')
      .then(setReports)
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <div>Cargando reportes…</div>

  return (
    <main className="page dashboard">
      <h1>Tablero Empresas</h1>

      <section className="reports-grid">
        {reports.map((r) => (
          <div key={r.id} className="report-card">
            <h3>{r.title}</h3>
            <span className="period">{r.period}</span>
            <pre>{JSON.stringify(r.data, null, 2)}</pre>
          </div>
        ))}
      </section>
    </main>
  )
}
```

---

### `apps/web/src/App.tsx`

```tsx
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom'
import ChatPage               from './pages/ChatPage'
import DashboardCiudadania    from './pages/DashboardCiudadania'
import DashboardEmpresas      from './pages/DashboardEmpresas'

export default function App() {
  return (
    <BrowserRouter>
      <nav className="main-nav">
        <Link to="/">Chat</Link>
        <Link to="/ciudadania">Ciudadanía</Link>
        <Link to="/empresas">Empresas</Link>
      </nav>

      <Routes>
        <Route path="/"           element={<ChatPage />} />
        <Route path="/ciudadania" element={<DashboardCiudadania />} />
        <Route path="/empresas"   element={<DashboardEmpresas />} />
      </Routes>
    </BrowserRouter>
  )
}
```

---

### `apps/web/src/main.tsx`

```tsx
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App'
import './styles/globals.css'   // ← crea este archivo con tus estilos base

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>
)
```

---

### `apps/web/index.html`

```html
<!DOCTYPE html>
<html lang="es">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Municipio App</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
```

---

## 🔑 `.env.example`

```dotenv
# ── API (apps/api) ────────────────────────────────────────
PORT=3001
FRONTEND_URL=http://localhost:5173

# Base de datos — Turso (o "file:local.db" para local sin token)
DATABASE_URL=file:local.db
DATABASE_TOKEN=

# IA
ANTHROPIC_API_KEY=sk-ant-...

# ── Web (apps/web) ────────────────────────────────────────
VITE_API_URL=/api
```

---

## 📋 Checklist de arranque

```
[ ] cp .env.example .env  →  llenar variables
[ ] npm install           →  instalar dependencias de todos los workspaces
[ ] npm run db:migrate    →  crear tablas SQLite / Turso
[ ] npm run dev           →  API en :3001 · Web en :5173
[ ] Probar GET http://localhost:3001/health  →  {"status":"ok"}
[ ] Navegar http://localhost:5173            →  App funcionando
```

---

## 🗺️ Próximos pasos sugeridos

| Área | Tarea |
|------|-------|
| Auth | Integrar `hono/jwt` + login page con roles |
| UI   | Agregar Tailwind CSS o CSS Modules con tema municipal |
| AI   | Streaming de respuestas con `stream: true` del SDK |
| DB   | Mover a Turso en la nube para staging |
| Deploy | Cloudflare Workers (API) + Cloudflare Pages (Web) |
| Tests | Vitest para hooks, Hono test utils para rutas |
```