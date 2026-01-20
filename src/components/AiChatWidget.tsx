import React, { useEffect, useMemo, useRef, useState } from 'react'
import { chat } from '../utilities/aiService'

type ChatMsg = { role: 'user' | 'assistant'; content: string }

export function AiChatWidget({
  projectName,
  contextHint,
}: {
  projectName?: string
  contextHint?: string
}) {
  const [open, setOpen] = useState(false)
  const [input, setInput] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [messages, setMessages] = useState<ChatMsg[]>(() => [
    {
      role: 'assistant',
      content: `Hi! I'm your TaskPulse AI assistant${
        projectName ? ` for “${projectName}”` : ''
      }. Ask me anything.`,
    },
  ])

  const listRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    if (!open) return
    // 打开后滚到底
    setTimeout(() => {
      listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: 'smooth' })
    }, 50)
  }, [open, messages.length])

  const systemHint = useMemo(() => {
    const parts: string[] = []
    if (projectName) parts.push(`Project: ${projectName}`)
    if (contextHint) parts.push(contextHint)
    return parts.join('\n')
  }, [projectName, contextHint])

  const send = async () => {
    const text = input.trim()
    if (!text || busy) return

    setError(null)
    setInput('')
    setBusy(true)

    const next: ChatMsg[] = [...messages, { role: 'user', content: text }]
    setMessages(next)

    try {
      // 只保留最近 20 条，防止越聊越长
      const windowed = next.slice(-20)

      // 可选：把项目上下文“塞到第一条 user 信息里”
      const payload: ChatMsg[] = systemHint
        ? [{ role: 'user', content: `Context:\n${systemHint}\n\nUser:\n${text}` }, ...windowed.slice(1)]
        : windowed

      const reply = await chat(payload)
      setMessages((prev) => [...prev, { role: 'assistant', content: reply }])
    } catch (e: any) {
      setError(e?.message || 'Failed to get response.')
    } finally {
      setBusy(false)
    }
  }

  const onKeyDown: React.KeyboardEventHandler<HTMLInputElement> = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      void send()
    }
  }

  return (
    <>
      {/* 浮动按钮 */}
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="fixed bottom-6 right-6 z-50 rounded-2xl bg-slate-900 text-white px-5 py-3 text-sm font-black shadow-2xl shadow-slate-300 hover:bg-slate-800 transition-all"
        title="AI Chat"
      >
        {open ? 'CLOSE AI' : 'AI CHAT'}
      </button>

      {/* 弹窗 */}
      {open && (
        <div className="fixed bottom-24 right-6 z-50 w-[360px] max-w-[92vw] rounded-[2rem] bg-white border-2 border-slate-100 shadow-2xl overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
            <div className="min-w-0">
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-amber-600">
                TaskPulse Assistant
              </p>
              <p className="text-sm font-black text-slate-900 truncate">
                {projectName ? projectName : 'AI Chat'}
              </p>
            </div>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="p-2 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-500"
              aria-label="close"
            >
              ✕
            </button>
          </div>

          <div ref={listRef} className="h-[360px] overflow-y-auto px-4 py-4 space-y-3">
            {messages.map((m, idx) => (
              <div
                key={idx}
                className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm whitespace-pre-wrap ${
                    m.role === 'user'
                      ? 'bg-emerald-600 text-white'
                      : 'bg-slate-50 text-slate-900 border border-slate-100'
                  }`}
                >
                  {m.content}
                </div>
              </div>
            ))}

            {busy && (
              <div className="flex justify-start">
                <div className="bg-slate-50 text-slate-500 border border-slate-100 rounded-2xl px-4 py-3 text-sm">
                  Thinking…
                </div>
              </div>
            )}

            {error && (
              <div className="text-xs font-bold text-rose-600 bg-rose-50 border border-rose-100 rounded-xl px-3 py-2">
                {error}
              </div>
            )}
          </div>

          <div className="p-3 border-t border-slate-100 flex items-center gap-2">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={onKeyDown}
              placeholder="Ask about tasks, deadlines, next steps…"
              className="flex-1 rounded-xl border-2 border-slate-100 bg-white px-3 py-2 text-sm font-semibold text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-slate-300"
            />
            <button
              type="button"
              onClick={() => void send()}
              disabled={busy || !input.trim()}
              className="rounded-xl bg-slate-900 text-white px-4 py-2 text-sm font-black disabled:opacity-40"
            >
              Send
            </button>
          </div>
        </div>
      )}
    </>
  )
}
