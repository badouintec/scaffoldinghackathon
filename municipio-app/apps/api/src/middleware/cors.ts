import { cors } from 'hono/cors'

export const corsMiddleware = cors({
  origin: process.env.FRONTEND_URL ?? 'http://localhost:5173',
  allowMethods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowHeaders: ['Content-Type', 'Authorization'],
})
