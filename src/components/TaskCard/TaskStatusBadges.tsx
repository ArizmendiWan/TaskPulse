import { statusLabels, statusPills } from '../../constants'
import type { TaskStatusBadgesProps } from './types'

export const TaskStatusBadges = ({
  task,
  onNudge,
  nudgeFeedback,
  isUnclaimed,
  expired,
  overdue,
  dueSoon,
}: TaskStatusBadgesProps) => {
  return (
    <>
      {/* Status badge - show IN PROGRESS or DONE only (not for unclaimed/expired/overdue) */}
      {!isUnclaimed && !expired && !overdue && (
        <span
          className={`inline-flex items-center justify-center rounded-full px-2 h-6 text-[9px] font-black uppercase tracking-wider ${statusPills[task.status]}`}
        >
          {statusLabels[task.status]}
        </span>
      )}

      {/* Time-based badges - these replace the status badge when applicable */}
      {expired ? (
        <span className="rounded-full px-2 h-6 text-[9px] font-black uppercase tracking-wider flex items-center bg-slate-200 dark:bg-slate-700 text-slate-500 dark:text-slate-400">
          EXPIRED
        </span>
      ) : overdue ? (
        <button
          type="button"
          title="Send email reminder"
          disabled={task.members.length === 0 || nudgeFeedback[task.id] === 'sending'}
          onClick={(e) => {
            e.stopPropagation()
            onNudge(task)
          }}
          className="rounded-full px-2.5 h-6 text-[9px] font-black transition-all flex items-center justify-center gap-1 shadow-sm bg-rose-600 text-white hover:bg-rose-500 disabled:bg-rose-300"
        >
          {nudgeFeedback[task.id] === 'sending' ? '...' : nudgeFeedback[task.id] === 'sent' ? '✓ SENT' : 'OVERDUE'}
        </button>
      ) : dueSoon ? (
        <button
          type="button"
          title={task.members.length === 0 ? 'No one to nudge yet' : 'Send email reminder'}
          disabled={task.members.length === 0 || nudgeFeedback[task.id] === 'sending'}
          onClick={(e) => {
            e.stopPropagation()
            onNudge(task)
          }}
          className={`rounded-full px-2.5 h-6 text-[9px] font-black transition-all flex items-center justify-center gap-1 shadow-sm ${
            task.members.length === 0
              ? 'bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 cursor-default'
              : nudgeFeedback[task.id] === 'sent'
                ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400'
                : 'bg-amber-500 text-white hover:bg-amber-600'
          }`}
        >
          {nudgeFeedback[task.id] === 'sending' ? '...' : nudgeFeedback[task.id] === 'sent' ? '✓ SENT' : 'DUE SOON'}
        </button>
      ) : null}
    </>
  )
}

