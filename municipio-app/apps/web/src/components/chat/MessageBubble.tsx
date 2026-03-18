import type { Message } from '../../types'

interface Props { message: Message }

export function MessageBubble({ message }: Props) {
  const isUser = message.role === 'user'
  return (
    <div className={`bubble-row bubble-row--${isUser ? 'user' : 'assistant'}`}>
      {!isUser && (
        <div className="bubble-avatar bubble-avatar--assistant">🤖</div>
      )}
      <div className={`bubble bubble--${isUser ? 'user' : 'assistant'}`}>
        <p>{message.content}</p>
        <time>{new Date(message.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</time>
      </div>
      {isUser && (
        <div className="bubble-avatar bubble-avatar--user">👤</div>
      )}
    </div>
  )
}
