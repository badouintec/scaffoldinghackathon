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
