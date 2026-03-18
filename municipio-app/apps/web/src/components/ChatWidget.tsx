import { useState, useEffect } from 'react'
import { ChatWindow } from './chat/ChatWindow'

export function ChatWidget() {
  const [open, setOpen] = useState(false)

  // Botones en el landing también abren el widget
  useEffect(() => {
    const handleOpen = () => setOpen(true)
    document.querySelectorAll('#open-chat-btn, #open-chat-btn-2').forEach((el) =>
      el.addEventListener('click', handleOpen)
    )
    return () => {
      document.querySelectorAll('#open-chat-btn, #open-chat-btn-2').forEach((el) =>
        el.removeEventListener('click', handleOpen)
      )
    }
  }, [])

  return (
    <div className="chat-widget">
      {/* Panel del chat */}
      <div className={`chat-widget-panel ${open ? 'chat-widget-panel--open' : ''}`}>
        <div className="chat-widget-panel-header">
          <div className="chat-widget-panel-title">
            <div className="chat-widget-avatar">🤖</div>
            <div>
              <strong>Asistente Municipal</strong>
              <span className="chat-widget-status">● En línea</span>
            </div>
          </div>
          <button className="chat-widget-close" onClick={() => setOpen(false)} aria-label="Cerrar chat">
            ✕
          </button>
        </div>
        <ChatWindow conversationId="mock-conv-001" />
      </div>

      {/* Botón flotante */}
      <button
        className={`chat-widget-fab ${open ? 'chat-widget-fab--open' : ''}`}
        onClick={() => setOpen((o) => !o)}
        aria-label="Abrir asistente"
      >
        {open ? '✕' : '💬'}
        {!open && <span className="chat-widget-fab-label">¿Necesitas ayuda?</span>}
        {!open && <span className="chat-widget-fab-dot" />}
      </button>
    </div>
  )
}
