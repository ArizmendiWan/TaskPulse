import { useState } from 'react'
import { theme } from '../../theme'
import type { TaskActivityProps } from './types'

export const TaskActivitySection = ({ task }: TaskActivityProps) => {
  const [showHistory, setShowHistory] = useState(false)

  if (!task.activity || task.activity.length === 0) return null

  return (
    <div className={`mt-3 pt-3 border-t ${theme.colors.ui.border}`}>
      <button
        onClick={() => setShowHistory(!showHistory)}
        className="flex items-center gap-2 w-full group"
      >
        <p className={`text-[9px] font-black uppercase tracking-wider ${theme.colors.ui.textLight}`}>
          Activity
        </p>
        <span className={`px-1.5 py-0.5 rounded-full ${theme.colors.ui.background} text-[9px] font-black ${theme.colors.ui.textMuted}`}>
          {task.activity.length}
        </span>
        <svg
          className={`ml-auto transition-transform duration-200 ${theme.colors.ui.textLight} ${showHistory ? 'rotate-180' : ''}`}
          xmlns="http://www.w3.org/2000/svg"
          width="12"
          height="12"
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
        <div className="mt-2 space-y-1.5 animate-in fade-in slide-in-from-top-2 duration-200">
          {task.activity
            .slice()
            .reverse()
            .map((item) => (
              <div key={item.id} className="flex items-start gap-2 text-[11px]">
                <span className={`shrink-0 w-1 h-1 mt-1.5 rounded-full bg-slate-300 dark:bg-slate-600`} />
                <span className={`${theme.colors.ui.textMuted}`}>{item.note}</span>
                <span className={`ml-auto shrink-0 text-[9px] ${theme.colors.ui.textLight}`}>
                  {new Date(item.at).toLocaleDateString(undefined, {
                    month: 'short',
                    day: 'numeric',
                  })}
                </span>
              </div>
            ))}
        </div>
      )}
    </div>
  )
}
