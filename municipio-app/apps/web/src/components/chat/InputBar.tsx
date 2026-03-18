import { useState, type KeyboardEvent } from 'react'

interface Props {
  onSend:   (text: string) => void
  disabled: boolean
}

export function InputBar({ onSend, disabled }: Props) {
  const [text, setText] = useState('')

  const submit = () => {
    const trimmed = text.trim()
    if (!trimmed) return
    onSend(trimmed)
    setText('')
  }

  const onKey = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      submit()
    }
  }

  return (
    <>
      <div className="input-bar">
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={onKey}
          placeholder="Escribe tu consulta…"
          disabled={disabled}
          rows={2}
        />
        <button className="send-btn" onClick={submit} disabled={disabled || !text.trim()} title="Enviar">
          ➤
        </button>
      </div>
      <p className="input-hint">Enter para enviar · Shift+Enter para nueva línea</p>
    </>
  )
}
