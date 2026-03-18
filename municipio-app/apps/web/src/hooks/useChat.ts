import { useState, useCallback } from 'react'
import type { Message } from '../types'
import { MOCK_MESSAGES, MOCK_REPLIES } from '../mock/data'

export function useChat(_conversationId: string) {
  const [messages, setMessages] = useState<Message[]>(MOCK_MESSAGES)
  const [loading,  setLoading]  = useState(false)
  const [error]                 = useState<string | null>(null)

  const sendMessage = useCallback(async (content: string) => {
    const convId = 'mock-conv-001'
    const userMsg: Message = {
      id:             crypto.randomUUID(),
      conversationId: convId,
      role:           'user',
      content,
      createdAt:      new Date(),
    }
    setMessages((prev) => [...prev, userMsg])
    setLoading(true)

    // Simula latencia de red (600-1200 ms)
    await new Promise((r) => setTimeout(r, 600 + Math.random() * 600))

    const reply = MOCK_REPLIES[Math.floor(Math.random() * MOCK_REPLIES.length)]
    const assistantMsg: Message = {
      id:             crypto.randomUUID(),
      conversationId: convId,
      role:           'assistant',
      content:        reply,
      createdAt:      new Date(),
    }
    setMessages((prev) => [...prev, assistantMsg])
    setLoading(false)
  }, [])

  return { messages, loading, error, sendMessage }
}
