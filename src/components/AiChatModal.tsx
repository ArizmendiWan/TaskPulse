import { useMemo, useRef, useState, useEffect } from 'react'
import { chatWithAI, type ChatMsg } from '../utilities/aiService'
import { theme } from '../theme'

export function AiChatModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [msgs, setMsgs] = useState<ChatMsg[]>([
    { role: 'assistant', content: 'Hi! I am TaskPulse AI. How can I help you today?' },
  ])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const bottomRef = useRef<HTMLDivElement | null>(null)

  const canSend = useMemo(() => input.trim().length > 0 && !loading, [input, loading])

  // Scroll to bottom when messages change
  useEffect(() => {
    if (open) {
      bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
    }
  }, [msgs, open])

  async function send() {
    if (!canSend) return
    const userMsg: ChatMsg = { role: 'user', content: input.trim() }
    const next = [...msgs, userMsg]
    setMsgs(next)
    setInput('')
    setLoading(true)

    try {
      const text = await chatWithAI(next)
      setMsgs((m) => [...m, { role: 'assistant', content: text || '(Empty response)' }])
    } catch (e: any) {
      setMsgs((m) => [...m, { role: 'assistant', content: `Error: ${String(e?.message ?? e)}` }])
    } finally {
      setLoading(false)
    }
  }

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className={`w-full max-w-2xl rounded-[2rem] ${theme.colors.ui.surface} shadow-2xl overflow-hidden border ${theme.colors.ui.border}`}>
        <div className={`flex items-center justify-between px-6 py-5 border-b ${theme.colors.ui.border}`}>
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-amber-600 mb-0.5">
              Assistant
            </p>
            <div className={`text-lg font-black ${theme.colors.ui.text}`}>TaskPulse AI</div>
          </div>
          <button
            className={`rounded-xl px-4 py-2 text-xs font-black uppercase tracking-widest transition-all ${theme.colors.action.secondary.bg} ${theme.colors.action.secondary.text} ${theme.colors.action.secondary.hover}`}
            onClick={onClose}
          >
            Close
          </button>
        </div>

        <div className="h-[420px] overflow-y-auto p-6 space-y-4">
          {msgs.map((m, i) => (
            <div
              key={i}
              className={`max-w-[85%] rounded-2xl px-5 py-3.5 text-sm leading-relaxed shadow-sm ${
                m.role === 'user'
                  ? 'ml-auto bg-slate-900 dark:bg-amber-600 text-white'
                  : `${theme.colors.action.secondary.bg} ${theme.colors.ui.text} border ${theme.colors.ui.border}`
              }`}
            >
              {m.content}
            </div>
          ))}
          {loading && (
            <div className={`mr-auto max-w-[80%] rounded-2xl px-5 py-3.5 text-sm ${theme.colors.action.secondary.bg} ${theme.colors.ui.textMuted} animate-pulse`}>
              Thinking…
            </div>
          )}
          <div ref={bottomRef} />
        </div>

        <div className={`border-t p-4 flex gap-3 ${theme.colors.ui.border} ${theme.colors.action.secondary.bg}`}>
          <input
            className={`flex-1 rounded-2xl px-5 py-3 text-sm font-semibold shadow-inner ${theme.colors.ui.input}`}
            placeholder="Type your message..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') send()
            }}
          />
          <button
            className={`rounded-2xl px-6 py-3 text-sm font-black transition-all ${
              canSend 
                ? 'bg-slate-900 dark:bg-amber-600 text-white hover:scale-105 active:scale-95 shadow-lg' 
                : 'bg-slate-200 dark:bg-slate-800 text-slate-400 cursor-not-allowed'
            }`}
            onClick={send}
            disabled={!canSend}
          >
            SEND
          </button>
        </div>
      </div>
    </div>
  )
}

