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
