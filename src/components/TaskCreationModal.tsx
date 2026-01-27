import type React from 'react'
import { theme } from '../theme'

interface TaskCreationModalProps {
  taskForm: {
    title: string
    description: string
    dueAt: string
    members: string[]
  }
  setTaskForm: React.Dispatch<
    React.SetStateAction<{
      title: string
      description: string
      dueAt: string
      members: string[]
    }>
  >
  projectMembers: string[]
  getUserName: (userId: string | null) => string
  onSubmit: (e: React.FormEvent) => void
  onClose: () => void
}

export const TaskCreationModal = ({
  taskForm,
  setTaskForm,
  projectMembers,
  getUserName,
  onSubmit,
  onClose,
}: TaskCreationModalProps) => {
  const toggleMember = (memberId: string) => {
    setTaskForm((prev) => {
      const isAssigned = prev.members.includes(memberId)
      return {
        ...prev,
        members: isAssigned
          ? prev.members.filter((id) => id !== memberId)
          : [...prev.members, memberId],
      }
    })
  }

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
            <h3 className={`text-3xl font-black ${theme.colors.ui.text} tracking-tight`}>Post a Task</h3>
            <p className={`text-sm font-bold ${theme.colors.ui.textMuted}`}>
              Post a task for the team. Someone can pick it up.
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

          <div className="space-y-3">
            <label className={`text-[11px] font-black uppercase tracking-[0.2em] ${theme.colors.ui.textLight} ml-1`}>
              Assign To
            </label>
            <div className="flex flex-wrap gap-2">
              {projectMembers.map((memberId) => {
                const isAssigned = taskForm.members.includes(memberId)
                return (
                  <button
                    key={memberId}
                    type="button"
                    onClick={() => toggleMember(memberId)}
                    className={`rounded-xl px-4 py-2 text-[11px] font-bold transition-all border-2 ${
                      isAssigned
                        ? 'bg-emerald-600 border-emerald-600 text-white shadow-md shadow-emerald-200 dark:shadow-none'
                        : `${theme.colors.ui.background} ${theme.colors.ui.border} ${theme.colors.ui.textMuted} hover:${theme.colors.ui.borderStrong}`
                    }`}
                  >
                    {getUserName(memberId)}
                  </button>
                )
              })}
              {projectMembers.length === 0 && (
                <p className={`text-[11px] italic ${theme.colors.ui.textLight} ml-1`}>
                  No other members in this project yet.
                </p>
              )}
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
              placeholder="Add some details about what needs to be done..."
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
              POST TASK
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
