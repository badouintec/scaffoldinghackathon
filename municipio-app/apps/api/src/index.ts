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
