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
