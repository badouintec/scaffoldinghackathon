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
