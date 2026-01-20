type ChatPayload = {
  messages: { role: 'user' | 'assistant'; content: string }[]
}

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method Not Allowed' })
    return
  }

  const { messages } = (req.body || {}) as ChatPayload
  if (!Array.isArray(messages) || messages.length === 0) {
    res.status(400).json({ error: 'Invalid request payload.' })
    return
  }

  const apiKey = process.env.OPENAI_API_KEY
  if (!apiKey) {
    res.status(500).json({ error: 'Missing OPENAI_API_KEY.' })
    return
  }

  try {
    const resp = await fetch('https://api.openai.com/v1/responses', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4.1-mini',
        input: messages.map((m) => ({
          role: m.role,
          content: [
            {
              type: 'input_text', // ✅ 关键修复点
              text: m.content,
            },
          ],
        })),
      }),
    })

    const data = await resp.json()

    if (!resp.ok) {
      res.status(resp.status).json({ error: data })
      return
    }

    const text =
      data.output_text ??
      data.output?.[0]?.content?.[0]?.text ??
      ''

    res.status(200).json({ text })
  } catch (e: any) {
    res.status(500).json({ error: e?.message || String(e) })
  }
}
