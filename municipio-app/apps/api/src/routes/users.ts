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
