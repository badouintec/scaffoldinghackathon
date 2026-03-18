import { useState } from 'react'
import type { Ticket } from '../types'
import { MOCK_TICKETS } from '../mock/data'

export function useTickets() {
  const [tickets, setTickets] = useState<Ticket[]>(MOCK_TICKETS)

  const updateStatus = (id: string, status: Ticket['status']) => {
    setTickets((prev) =>
      prev.map((t) => (t.id === id ? { ...t, status, updatedAt: new Date() } : t))
    )
  }

  return { tickets, loading: false, error: null, updateStatus }
}
