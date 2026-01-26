export type ChatMsg = { role: 'user' | 'assistant' | 'system'; content: string }

export async function chatWithAI(messages: ChatMsg[]): Promise<string> {
  const resp = await fetch('/api/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ messages }),
  })

  const data = await resp.json().catch(() => ({}))

  if (!resp.ok) {
    const msg =
      typeof data?.error === 'string'
        ? data.error
        : data?.error?.error?.message || data?.error?.message || 'Request failed'
    throw new Error(msg)
  }

  return data?.text ?? ''
}

// Compatibility with old components
export const chat = chatWithAI
