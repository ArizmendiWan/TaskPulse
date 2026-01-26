import { useMemo, useRef, useState, useEffect } from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { chatWithAI, type ChatMsg } from './service'
import { theme } from '../../theme'
import { DEFAULT_SYSTEM_PROMPT } from './utils'

export function AiChatModal({
  open,
  onClose,
  projectName,
  contextHint,
}: {
  open: boolean
  onClose: () => void
  projectName?: string
  contextHint?: string
}) {
  const [msgs, setMsgs] = useState<ChatMsg[]>(() => [
    {
      role: 'assistant',
      content: `Hi! I'm your TaskPulse AI assistant${projectName ? ` for **${projectName}**` : ''}.\n\nI can help you:\n- Spot overdue / due soon tasks and next steps.\n- Explain how to post, claim/join, pin, filter, hide done, or send nudges.\n- Draft quick updates or reminders.\n\nWhat do you need?`,
    },
  ])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const bottomRef = useRef<HTMLDivElement | null>(null)

  const systemHint = useMemo(() => contextHint || DEFAULT_SYSTEM_PROMPT, [contextHint])

  const markdownClass =
    'leading-relaxed text-sm space-y-2 [&>p]:m-0 [&>ul]:pl-5 [&>ol]:pl-5 [&>ul]:list-disc [&>ol]:list-decimal [&>li]:mt-1 [&>strong]:font-black [&>code]:bg-slate-100 [&>code]:text-[13px] [&>code]:px-1.5 [&>code]:py-0.5 [&>code]:rounded dark:[&>code]:bg-slate-800'

  const canSend = useMemo(() => input.trim().length > 0 && !loading, [input, loading])

  // Scroll to bottom when messages change
  useEffect(() => {
    if (open) {
      bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
    }
  }, [msgs, open])

  async function send() {
    if (!canSend) return
    const text = input.trim()
    const userMsg: ChatMsg = { role: 'user', content: text }
    const next = [...msgs, userMsg]
    setMsgs(next)
    setInput('')
    setLoading(true)

    try {
      // Keep last 20 messages (user/assistant)
      const windowed = next.slice(-20)

      const payload: ChatMsg[] = [{ role: 'system', content: systemHint }, ...windowed]

      const reply = await chatWithAI(payload)
      setMsgs((m) => [...m, { role: 'assistant', content: reply || '(Empty response)' }])
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
              {m.role === 'assistant' ? (
                <div className={markdownClass}>
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>
                    {m.content}
                  </ReactMarkdown>
                </div>
              ) : (
                <span className="whitespace-pre-wrap">{m.content}</span>
              )}
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
