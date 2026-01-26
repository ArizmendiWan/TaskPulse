import React, { useEffect, useRef, useState } from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { chatWithAI, type ChatMsg } from './service'
import { theme } from '../../theme'
import { DEFAULT_SYSTEM_PROMPT } from './utils'

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
      content: `Hi! I'm your TaskPulse AI assistant${projectName ? ` for **${projectName}**` : ''}.\n\nI can help you:\n- Spot overdue / due soon tasks and suggest next steps.\n- Show how to post, claim/join, pin, filter, hide done, or send nudges.\n- Draft quick updates or reminders.\n\nWhat do you need?`,
    },
  ])

  const listRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    if (!open) return
    // Scroll to bottom when messages change or widget opens
    const scrollToBottom = () => {
      if (listRef.current) {
        listRef.current.scrollTo({
          top: listRef.current.scrollHeight,
          behavior: 'smooth',
        })
      }
    }
    const timer = setTimeout(scrollToBottom, 100)
    return () => clearTimeout(timer)
  }, [open, messages])

  const markdownClass =
    'leading-relaxed text-sm space-y-2 [&>p]:m-0 [&>ul]:pl-5 [&>ol]:pl-5 [&>ul]:list-disc [&>ol]:list-decimal [&>li]:mt-1 [&>strong]:font-black [&>code]:bg-slate-100 [&>code]:text-[13px] [&>code]:px-1.5 [&>code]:py-0.5 [&>code]:rounded dark:[&>code]:bg-slate-800'

  const send = async () => {
    const text = input.trim()
    if (!text || busy) return

    setError(null)
    setInput('')
    setBusy(true)

    const userMsg: ChatMsg = { role: 'user', content: text }
    const next: ChatMsg[] = [...messages, userMsg]
    setMessages(next)

    try {
      // Keep only last 20 conversation messages (excludes system prompt)
      const windowed = next.slice(-20)

      const payload: ChatMsg[] = [
        { role: 'system', content: contextHint || DEFAULT_SYSTEM_PROMPT },
        ...windowed,
      ]

      const reply = await chatWithAI(payload)
      setMessages((prev) => [...prev, { role: 'assistant', content: reply || '(Empty response)' }])
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
      {/* Floating Button */}
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className={`fixed bottom-8 right-8 z-50 rounded-2xl ${theme.colors.action.primary.bg} ${theme.colors.action.primary.text} px-6 py-4 text-xs font-black tracking-widest shadow-2xl transition-all hover:-translate-y-1 active:translate-y-0 flex items-center gap-3`}
        title="AI Chat"
      >
        <div className={`w-2 h-2 rounded-full ${busy ? 'bg-amber-500 animate-pulse' : 'bg-emerald-500'}`} />
        {open ? 'CLOSE AI' : 'AI ASSISTANT'}
      </button>
      
      {/* Chat Window */}
      {open && (
        <div className={`fixed bottom-28 right-8 z-50 w-[380px] max-w-[92vw] rounded-[2.5rem] ${theme.colors.ui.surface} border-2 ${theme.colors.ui.border} shadow-2xl overflow-hidden flex flex-col transition-all animate-in fade-in slide-in-from-bottom-4 duration-300`}>
          <div className={`px-6 py-5 border-b ${theme.colors.ui.border} flex items-center justify-between bg-slate-50/50 dark:bg-slate-800/30`}>
            <div className="min-w-0">
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-amber-600 mb-0.5">
                TaskPulse AI
              </p>
              <p className={`text-sm font-black ${theme.colors.ui.text} truncate`}>
                {projectName ? projectName : 'Assistant'}
              </p>
            </div>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className={`p-2.5 rounded-xl ${theme.colors.action.secondary.bg} ${theme.colors.action.secondary.text} ${theme.colors.action.secondary.hover} transition-colors`}
              aria-label="close"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>
          </div>

          <div 
            ref={listRef} 
            className="h-[400px] overflow-y-auto px-5 py-6 space-y-4"
          >
            {messages.map((m, idx) => (
              <div
                key={idx}
                className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm shadow-sm leading-relaxed ${
                  m.role === 'user'
                    ? 'bg-slate-900 dark:bg-amber-600 text-white'
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
            </div>
          ))}

            {busy && (
              <div className="flex justify-start">
                <div className={`${theme.colors.action.secondary.bg} ${theme.colors.ui.textMuted} border ${theme.colors.ui.border} rounded-2xl px-4 py-3 text-sm flex items-center gap-2`}>
                  <div className="flex gap-1">
                    <div className="w-1 h-1 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                    <div className="w-1 h-1 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                    <div className="w-1 h-1 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                  Thinking…
                </div>
              </div>
            )}

            {error && (
              <div className="text-xs font-bold text-rose-600 bg-rose-50 dark:bg-rose-900/20 border border-rose-100 dark:border-rose-900/40 rounded-xl px-4 py-3">
                {error}
              </div>
            )}
          </div>

          <div className={`p-4 border-t ${theme.colors.ui.border} flex items-center gap-2 bg-slate-50/50 dark:bg-slate-800/30`}>
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={onKeyDown}
              placeholder="Ask about tasks, deadlines..."
              className={`flex-1 rounded-xl px-4 py-2.5 text-sm font-semibold ${theme.colors.ui.input}`}
            />
            <button
              type="button"
              onClick={() => void send()}
              disabled={busy || !input.trim()}
              className={`rounded-xl px-4 py-2.5 text-xs font-black uppercase tracking-widest transition-all ${
                busy || !input.trim()
                  ? 'bg-slate-200 dark:bg-slate-800 text-slate-400'
                  : 'bg-slate-900 dark:bg-amber-600 text-white shadow-lg hover:scale-105 active:scale-95'
              }`}
            >
              Send
            </button>
          </div>
        </div>
      )}
    </>
  )
}
