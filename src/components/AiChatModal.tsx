import { useMemo, useRef, useState } from 'react'
import { chatWithAI, type ChatMsg } from '../utilities/aiService'

export function AiChatModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [msgs, setMsgs] = useState<ChatMsg[]>([
    { role: 'assistant', content: 'Hi! 我是 TaskPulse AI，要我帮你做什么？' },
  ])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const bottomRef = useRef<HTMLDivElement | null>(null)

  const canSend = useMemo(() => input.trim().length > 0 && !loading, [input, loading])

  async function send() {
    if (!canSend) return
    const userMsg: ChatMsg = { role: 'user', content: input.trim() }
    const next = [...msgs, userMsg]
    setMsgs(next)
    setInput('')
    setLoading(true)

    try {
      const text = await chatWithAI(next)
      setMsgs((m) => [...m, { role: 'assistant', content: text || '(空回复)' }])
      setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: 'smooth' }), 50)
    } catch (e: any) {
      setMsgs((m) => [...m, { role: 'assistant', content: `出错了：${String(e?.message ?? e)}` }])
    } finally {
      setLoading(false)
    }
  }

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-2xl rounded-2xl bg-white shadow-xl overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b">
          <div className="font-black text-slate-900">TaskPulse AI</div>
          <button
            className="rounded-xl px-3 py-1 text-sm font-bold bg-slate-100 hover:bg-slate-200"
            onClick={onClose}
          >
            Close
          </button>
        </div>

        <div className="h-[420px] overflow-y-auto p-4 space-y-3">
          {msgs.map((m, i) => (
            <div
              key={i}
              className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                m.role === 'user'
                  ? 'ml-auto bg-slate-900 text-white'
                  : 'mr-auto bg-slate-100 text-slate-900'
              }`}
            >
              {m.content}
            </div>
          ))}
          {loading && (
            <div className="mr-auto max-w-[80%] rounded-2xl px-4 py-3 text-sm bg-slate-100 text-slate-500">
              正在思考…
            </div>
          )}
          <div ref={bottomRef} />
        </div>

        <div className="border-t p-4 flex gap-2">
          <input
            className="flex-1 rounded-2xl border px-4 py-3 text-sm outline-none"
            placeholder="输入消息…"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') send()
            }}
          />
          <button
            className={`rounded-2xl px-5 py-3 text-sm font-black ${
              canSend ? 'bg-slate-900 text-white' : 'bg-slate-200 text-slate-500'
            }`}
            onClick={send}
            disabled={!canSend}
          >
            Send
          </button>
        </div>
      </div>
    </div>
  )
}
