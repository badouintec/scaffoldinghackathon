import { useEffect, useRef } from 'react'
import { useChat } from '../../hooks/useChat'
import { MessageBubble } from './MessageBubble'
import { InputBar } from './InputBar'

interface Props {
  conversationId: string
}

export function ChatWindow({ conversationId }: Props) {
  const { messages, loading, error, sendMessage } = useChat(conversationId)
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  return (
    <div className="chat-window">
      <div className="chat-messages">
        {messages.length === 0 && !loading && (
          <div className="chat-empty">
            <div className="chat-empty-icon">💬</div>
            <p>Escribe tu consulta y el asistente te responderá</p>
          </div>
        )}
        {messages.map((msg) => (
          <MessageBubble key={msg.id} message={msg} />
        ))}
        {loading && (
          <div className="chat-typing">
            <div className="typing-dots">
              <span /><span /><span />
            </div>
            Escribiendo…
          </div>
        )}
        {error && <div className="chat-error">⚠️ {error}</div>}
        <div ref={bottomRef} />
      </div>
      <InputBar onSend={sendMessage} disabled={loading} />
    </div>
  )
}
