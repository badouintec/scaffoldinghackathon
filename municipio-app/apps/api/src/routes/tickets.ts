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
