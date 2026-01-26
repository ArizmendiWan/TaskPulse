import { useState } from 'react'
import { theme } from '../../theme'
import type { TaskActivityProps } from './types'

export const TaskActivitySection = ({ task }: TaskActivityProps) => {
  const [showHistory, setShowHistory] = useState(false)

  if (!task.activity || task.activity.length === 0) return null

  return (
    <div className={`mt-8 pt-6 border-t ${theme.colors.ui.border}`}>
      <button
        onClick={() => setShowHistory(!showHistory)}
        className="flex items-center justify-between w-full group"
      >
        <div className="flex items-center gap-2">
          <div className="w-1.5 h-6 bg-amber-500 rounded-full" />
          <p className={`text-[11px] font-black uppercase tracking-[0.2em] ${theme.colors.ui.text}`}>
            Activity
          </p>
          <span className={`ml-2 px-2 py-0.5 rounded-full ${theme.colors.ui.background} text-[10px] font-black ${theme.colors.ui.textMuted}`}>
            {task.activity.length}
          </span>
        </div>
        <svg
          className={`transition-transform duration-300 ${theme.colors.ui.textLight} group-hover:${theme.colors.ui.textMuted} ${
            showHistory ? 'rotate-180' : ''
          }`}
          xmlns="http://www.w3.org/2000/svg"
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="m6 9 6 6 6-6" />
        </svg>
      </button>

      {showHistory && (
        <div className={`mt-6 relative ml-0.5 space-y-6 before:absolute before:left-[7px] before:top-2 before:h-[calc(100%-16px)] before:w-0.5 before:${theme.colors.ui.border} animate-in fade-in slide-in-from-top-4 duration-300`}>
          {task.activity
            .slice()
            .reverse()
            .map((item) => (
              <div key={item.id} className="relative pl-8">
                <div className={`absolute left-0 top-1.5 h-[16px] w-[16px] rounded-full border-2 ${theme.colors.ui.surface} ${theme.colors.ui.borderStrong} ring-4 ${theme.colors.ui.surface}`} />
                <div className="flex flex-col gap-1">
                  <p className={`text-[11px] font-bold ${theme.colors.ui.textMuted} leading-relaxed`}>
                    {item.note}
                  </p>
                  <p className={`text-[9px] font-black ${theme.colors.ui.textLight} uppercase tracking-widest`}>
                    {new Date(item.at).toLocaleDateString(undefined, {
                      month: 'short',
                      day: 'numeric',
                      hour: 'numeric',
                      minute: '2-digit',
                    })}
                  </p>
                </div>
              </div>
            ))}
        </div>
      )}
    </div>
  )
}

