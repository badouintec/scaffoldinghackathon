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
