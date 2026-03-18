/**
 * Wrapper para Anthropic Claude.
 * Se puede swapear por OpenAI / Ollama cambiando sólo este archivo.
 *
 * Variable de entorno requerida:
 *   ANTHROPIC_API_KEY
 */
import Anthropic from '@anthropic-ai/sdk'

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
})

export interface ChatMessage {
  role: 'user' | 'assistant'
  content: string
}

const SYSTEM_PROMPT = `
Eres el asistente oficial del Municipio. Ayudas a ciudadanos, empresas y funcionarios.
- Para ciudadanos: orientas sobre trámites, servicios y quejas.
- Para empresas: informas sobre licencias, permisos y programas de apoyo.
- Para municipio: ayudas con redacción de documentos y consultas internas.
Responde siempre en español, de forma clara y empática.
`.trim()

/**
 * Envía mensajes al modelo y devuelve el texto de respuesta.
 */
export async function chat(messages: ChatMessage[]): Promise<string> {
  const response = await anthropic.messages.create({
    model:      'claude-sonnet-4-20250514',
    max_tokens: 1024,
    system:     SYSTEM_PROMPT,
    messages,
  })

  const block = response.content[0]
  if (block.type !== 'text') throw new Error('Respuesta inesperada del modelo')
  return block.text
}
