import type React from 'react'
import type { Project } from '../types'
import { theme } from '../theme'

interface TaskCreationModalProps {
  taskForm: {
    title: string
    description: string
    dueAt: string
    owners: string[]
    difficulty: string
  }
  setTaskForm: React.Dispatch<
    React.SetStateAction<{
      title: string
      description: string
      dueAt: string
      owners: string[]
      difficulty: string
    }>
  >
  activeProject: Project | null
  currentUserId: string | null
  getUserName: (userId: string | null) => string
  onSubmit: (e: React.FormEvent) => void
  onClose: () => void
}

export const TaskCreationModal = ({
  taskForm,
  setTaskForm,
  activeProject,
  currentUserId,
  getUserName,
  onSubmit,
  onClose,
}: TaskCreationModalProps) => {
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/80 backdrop-blur-md px-4">
      <div
        role="dialog"
        aria-modal="true"
        aria-label="New task"
        className={`w-full max-w-xl rounded-[3rem] ${theme.colors.ui.surface} p-10 shadow-2xl transition-all animate-in fade-in zoom-in duration-300`}
      >
        <div className="flex items-start justify-between">
          <div className="space-y-2">
            <p className="text-[11px] font-black uppercase tracking-[0.3em] text-amber-600">
              TaskPulse
            </p>
            <h3 className={`text-3xl font-black ${theme.colors.ui.text} tracking-tight`}>Add a Task</h3>
            <p className={`text-sm font-bold ${theme.colors.ui.textMuted}`}>
              Keep it clear so the team knows what to do.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className={`rounded-full ${theme.colors.ui.background} p-3 ${theme.colors.ui.textLight} hover:${theme.colors.ui.text} transition-all`}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M18 6 6 18" />
              <path d="m6 6 12 12" />
            </svg>
          </button>
        </div>

        <form className="mt-10 space-y-6" onSubmit={onSubmit}>
          <div className="space-y-2">
            <label
              htmlFor="task-title"
              className={`text-[11px] font-black uppercase tracking-[0.2em] ${theme.colors.ui.textLight} ml-1`}
            >
              Task Title <span className="text-rose-500">*</span>
            </label>
            <input
              id="task-title"
              required
              name="task-title"
              value={taskForm.title}
              onChange={(e) => setTaskForm((t) => ({ ...t, title: e.target.value }))}
              className={`w-full rounded-[1.5rem] border-2 ${theme.colors.ui.input} px-6 py-4 text-sm font-black focus:outline-none transition-all`}
              placeholder="e.g. Write report introduction"
            />
          </div>

          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-2">
              <label
                htmlFor="task-due"
                className={`text-[11px] font-black uppercase tracking-[0.2em] ${theme.colors.ui.textLight} ml-1`}
              >
                Due Date <span className="text-rose-500">*</span>
              </label>
              <input
                id="task-due"
                required
                type="datetime-local"
                name="task-due"
                value={taskForm.dueAt}
                onChange={(e) => setTaskForm((t) => ({ ...t, dueAt: e.target.value }))}
                className={`w-full rounded-[1.5rem] border-2 ${theme.colors.ui.input} px-6 py-4 text-[13px] font-black focus:outline-none transition-all`}
              />
            </div>
            <div className="space-y-2">
              <label className={`text-[11px] font-black uppercase tracking-[0.2em] ${theme.colors.ui.textLight} ml-1`}>
                Difficulty
              </label>
              <select
                name="task-difficulty"
                value={taskForm.difficulty}
                onChange={(e) => setTaskForm((t) => ({ ...t, difficulty: e.target.value }))}
                className={`w-full rounded-[1.5rem] border-2 ${theme.colors.ui.input} px-6 py-4 text-sm font-black focus:outline-none transition-all`}
              >
                <option value="">Select...</option>
                <option value="S">S (Tiny)</option>
                <option value="M">M (Medium)</option>
                <option value="L">L (Big)</option>
              </select>
            </div>
          </div>

          <div className="space-y-2">
            <label className={`text-[11px] font-black uppercase tracking-[0.2em] ${theme.colors.ui.textLight} ml-1`}>
              Owners
            </label>
            <div className={`flex flex-wrap gap-2 p-4 rounded-[1.5rem] border-2 ${theme.colors.ui.border} ${theme.colors.ui.background}`}>
              {[
                ...new Set(
                  [...(activeProject?.members || []), ...(currentUserId ? [currentUserId] : [])].filter(
                    Boolean,
                  ),
                ),
              ].map((memberId) => (
                <button
                  key={memberId}
                  type="button"
                  onClick={() => {
                    setTaskForm((t) => ({
                      ...t,
                      owners: t.owners.includes(memberId)
                        ? t.owners.filter((o) => o !== memberId)
                        : [...t.owners, memberId],
                    }))
                  }}
                  className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all ${
                    taskForm.owners.includes(memberId)
                      ? 'bg-amber-500 text-white shadow-md'
                      : `${theme.colors.ui.surface} ${theme.colors.ui.textMuted} hover:${theme.colors.ui.background} border border-slate-200 dark:border-slate-700`
                  }`}
                >
                  {getUserName(memberId)}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <label className={`text-[11px] font-black uppercase tracking-[0.2em] ${theme.colors.ui.textLight} ml-1`}>
              Description
            </label>
            <textarea
              name="task-description"
              value={taskForm.description}
              onChange={(e) => setTaskForm((t) => ({ ...t, description: e.target.value }))}
              rows={3}
              className={`w-full rounded-[1.5rem] border-2 ${theme.colors.ui.input} px-6 py-4 text-sm font-black focus:outline-none transition-all resize-none`}
              placeholder="Add some details..."
            />
          </div>

          <div className="flex gap-4 pt-4">
            <button
              type="button"
              onClick={onClose}
              className={`flex-1 rounded-[1.5rem] border-2 ${theme.colors.ui.border} px-6 py-4 text-sm font-black ${theme.colors.ui.textMuted} hover:${theme.colors.ui.background} transition-colors`}
            >
              CANCEL
            </button>
            <button
              type="submit"
              className={`flex-[1.5] rounded-[1.5rem] ${theme.colors.action.primary.bg} px-6 py-4 text-sm font-black ${theme.colors.action.primary.text} shadow-xl shadow-slate-200 dark:shadow-black/50 ${theme.colors.action.primary.hover} hover:-translate-y-1 active:translate-y-0 transition-all`}
            >
              CREATE TASK
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

