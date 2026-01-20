import type { Task, TaskStatus } from '../types'
import { deriveStatus, isAtRisk, isOverdue, isDueSoon, formatDue } from '../lib/taskUtils'
import { statusLabels, statusPills } from '../constants'

interface TaskCardProps {
  task: Task
  expanded: boolean
  onToggleExpand: (taskId: string) => void
  onStatusChange: (task: Task, next: TaskStatus) => void
  onOwnerChange: (task: Task, ownerId: string) => void
  onDueChange: (task: Task, next: string) => void
  onDescriptionChange: (task: Task, next: string) => void
  onDeleteTask: (task: Task) => void
  onNudge: (task: Task) => void
  getUserName: (userId: string | null) => string
  nudgeFeedback: Record<string, 'sending' | 'sent' | 'error' | null>
  projectMembers: string[]
  currentUserId: string | null
}

export const TaskCard = ({
  task,
  expanded,
  onToggleExpand,
  onStatusChange,
  onOwnerChange,
  onDueChange,
  onDescriptionChange,
  onDeleteTask,
  onNudge,
  getUserName,
  nudgeFeedback,
  projectMembers,
  currentUserId,
}: TaskCardProps) => {
  const derived = deriveStatus(task)
  const isRisk = isAtRisk(task)
  const overdue = isOverdue(task)
  const dueSoon = isDueSoon(task)

  return (
    <div
      className={`group relative rounded-2xl border transition-all duration-300 ${
        overdue
          ? 'border-rose-100 bg-rose-50/10'
          : isRisk
            ? 'border-amber-100 bg-amber-50/10'
            : 'border-slate-100 bg-white hover:border-slate-200 hover:shadow-md'
      }`}
    >
      <div
        role="button"
        tabIndex={0}
        onClick={() => onToggleExpand(task.id)}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault()
            onToggleExpand(task.id)
          }
        }}
        className="w-full text-left p-4 md:p-5 cursor-pointer"
      >
        <div className="flex items-center justify-between gap-4">
          <div className="space-y-1 min-w-0">
            <h4 className="text-base font-bold text-slate-900 truncate">{task.title}</h4>
            <div className="flex items-center gap-3">
              <p className="text-[11px] font-medium text-slate-400">Due {formatDue(task.dueAt)}</p>
              <div className="flex items-center gap-1.5">
                <span
                  className={`inline-flex items-center rounded-full px-2 py-0.5 text-[9px] font-black uppercase tracking-wider ${statusPills[derived]}`}
                >
                  {statusLabels[derived]}
                </span>
                {isRisk && (
                  <span className="rounded-full bg-rose-600 px-2 py-0.5 text-[9px] font-black uppercase tracking-wider text-white flex items-center gap-1">
                    <span className="w-1 h-1 bg-white rounded-full animate-ping" />
                    AT RISK
                  </span>
                )}
                {dueSoon && !isRisk && !overdue && (
                  <span className="rounded-full bg-amber-500 px-2 py-0.5 text-[9px] font-black uppercase tracking-wider text-white">
                    SOON
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="shrink-0 flex items-center gap-4">
            <div className="flex -space-x-2 overflow-hidden">
              {task.owners.length === 0 ? (
                <div className="h-7 w-7 rounded-full border-2 border-white bg-slate-50 flex items-center justify-center text-[10px] text-slate-300 italic">
                  ?
                </div>
              ) : (
                task.owners.slice(0, 3).map((ownerId) => (
                  <div
                    key={ownerId}
                    title={getUserName(ownerId)}
                    className="h-7 w-7 rounded-full border-2 border-white bg-slate-100 flex items-center justify-center text-[10px] font-black text-slate-500 uppercase ring-1 ring-slate-100"
                  >
                    {getUserName(ownerId).charAt(0)}
                  </div>
                ))
              )}
              {task.owners.length > 3 && (
                <div className="h-7 w-7 rounded-full border-2 border-white bg-slate-800 flex items-center justify-center text-[10px] font-black text-white">
                  +{task.owners.length - 3}
                </div>
              )}
            </div>

            <div className="flex items-center gap-2">
              {isRisk && (
                <button
                  type="button"
                  disabled={task.owners.length === 0 || nudgeFeedback[task.id] === 'sending'}
                  onClick={(e) => {
                    e.stopPropagation()
                    onNudge(task)
                  }}
                  className={`rounded-lg px-3 py-1.5 text-[10px] font-black transition-all flex items-center gap-1.5 ${
                    task.owners.length === 0
                      ? 'bg-slate-50 border border-slate-200 text-slate-300 cursor-not-allowed'
                      : nudgeFeedback[task.id] === 'sent'
                        ? 'bg-emerald-50 border border-emerald-200 text-emerald-700'
                        : nudgeFeedback[task.id] === 'error'
                          ? 'bg-rose-50 border border-rose-200 text-rose-700'
                          : 'bg-amber-50 border border-amber-200 text-amber-700 hover:bg-amber-100'
                  }`}
                >
                  {nudgeFeedback[task.id] === 'sending' ? (
                    <div className="w-2.5 h-2.5 border-2 border-amber-600 border-t-transparent rounded-full animate-spin" />
                  ) : nudgeFeedback[task.id] === 'sent' ? (
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="10"
                      height="10"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="4"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  ) : nudgeFeedback[task.id] === 'error' ? (
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="10"
                      height="10"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="4"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <line x1="18" y1="6" x2="6" y2="18" />
                      <line x1="6" y1="6" x2="18" y2="18" />
                    </svg>
                  ) : (
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="10"
                      height="10"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="3"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="m22 2-7 20-4-9-9-4Z" />
                      <path d="M22 2 11 13" />
                    </svg>
                  )}
                  {nudgeFeedback[task.id] === 'sending'
                    ? 'Sending...'
                    : nudgeFeedback[task.id] === 'sent'
                      ? 'Sent!'
                      : nudgeFeedback[task.id] === 'error'
                        ? 'Error'
                        : 'Nudge'}
                </button>
              )}
              <svg
                className={`transition-transform duration-300 text-slate-400 ${
                  expanded ? 'rotate-180' : ''
                }`}
                xmlns="http://www.w3.org/2000/svg"
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="3"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="m6 9 6 6 6-6" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {expanded && (
        <div className="px-5 pb-6 pt-2 border-t border-slate-50 animate-in slide-in-from-top-2 duration-300">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4">
            <div className="space-y-2">
              <p className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1">
                Owners
              </p>
              <div className="flex flex-wrap gap-1.5 min-h-[36px] p-2 rounded-xl border-2 border-slate-50 bg-slate-50">
                {task.owners.length === 0 ? (
                  <span className="text-[10px] font-bold text-slate-400 px-1">Unassigned</span>
                ) : (
                  task.owners.map((ownerId) => (
                    <span
                      key={ownerId}
                      className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-white border border-slate-200 text-[10px] font-black text-slate-700 shadow-sm"
                    >
                      {getUserName(ownerId)}
                      <button
                        onClick={() => onOwnerChange(task, ownerId)}
                        className="text-slate-300 hover:text-rose-500 transition-colors"
                      >
                        ×
                      </button>
                    </span>
                  ))
                )}
                <select
                  value=""
                  onChange={(e) => onOwnerChange(task, e.target.value)}
                  className="bg-transparent border-none text-[10px] font-black text-slate-400 focus:outline-none cursor-pointer w-16"
                >
                  <option value="">+ Add</option>
                  {[
                    ...new Set(
                      [...projectMembers, ...(currentUserId ? [currentUserId] : [])].filter(Boolean),
                    ),
                  ]
                    .filter((m) => !task.owners.includes(m))
                    .map((memberId) => (
                      <option key={memberId} value={memberId}>
                        {getUserName(memberId)}
                      </option>
                    ))}
                </select>
              </div>
            </div>

            <div className="space-y-2">
              <p className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1">
                Status
              </p>
              <select
                aria-label="Status"
                value={task.status}
                onChange={(e) => onStatusChange(task, e.target.value as TaskStatus)}
                className="w-full rounded-xl border-2 border-slate-50 bg-slate-50 px-3 py-2 text-[11px] font-black text-slate-700 focus:border-amber-400 focus:bg-white focus:outline-none transition-all"
              >
                <option value="unassigned">Unassigned</option>
                <option value="not_started">Not Started</option>
                <option value="in_progress">In Progress</option>
                <option value="done">Done</option>
              </select>
            </div>

            <div className="space-y-2">
              <p className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1">
                Due Date
              </p>
              <input
                type="datetime-local"
                value={task.dueAt}
                onChange={(e) => onDueChange(task, e.target.value)}
                className="w-full rounded-xl border-2 border-slate-50 bg-slate-50 px-3 py-2 text-[11px] font-black text-slate-700 focus:border-amber-400 focus:bg-white focus:outline-none transition-all"
              />
            </div>
          </div>

          <div className="mt-6 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-1.5 h-6 bg-slate-900 rounded-full" />
                <p className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-900">
                  Notes
                </p>
              </div>
              <button
                type="button"
                onClick={() => onDeleteTask(task)}
                className="text-[10px] font-black text-rose-500 hover:text-rose-600 uppercase tracking-widest"
              >
                Delete Task
              </button>
            </div>
            <textarea
              value={task.description}
              onChange={(e) => onDescriptionChange(task, e.target.value)}
              className="w-full rounded-2xl border-2 border-slate-50 bg-slate-50 p-4 text-xs font-bold text-slate-700 focus:border-amber-400 focus:bg-white focus:outline-none transition-all resize-none"
              placeholder="Add more details or updates for the team..."
              rows={3}
            />
          </div>

          {task.activity && task.activity.length > 0 && (
            <div className="mt-8 space-y-4">
              <div className="flex items-center gap-2">
                <div className="w-1.5 h-6 bg-amber-500 rounded-full" />
                <p className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-900">
                  Activity History
                </p>
              </div>
              <div className="relative ml-0.5 space-y-4 before:absolute before:left-[7px] before:top-2 before:h-[calc(100%-16px)] before:w-0.5 before:bg-slate-100">
                {task.activity
                  .slice()
                  .reverse()
                  .map((item) => (
                    <div key={item.id} className="relative pl-6">
                      <div className="absolute left-0 top-1.5 h-[14px] w-[14px] rounded-full border-2 border-white bg-slate-200 ring-4 ring-white" />
                      <div className="flex flex-col gap-0.5">
                        <p className="text-[11px] font-bold text-slate-700 leading-relaxed">
                          {item.note}
                        </p>
                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">
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
            </div>
          )}
        </div>
      )}
    </div>
  )
}

