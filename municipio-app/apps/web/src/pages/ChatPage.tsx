import { ChatWindow } from '../components/chat/ChatWindow'

export default function ChatPage() {
  return (
    <main className="chat-page">
      <div className="chat-header">
        <div className="chat-header-avatar">🤖</div>
        <div>
          <h1>Asistente Municipal</h1>
          <p>En línea · Responde en segundos</p>
        </div>
      </div>
      <ChatWindow conversationId="mock-conv-001" />
    </main>
  )
}
