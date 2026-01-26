import { statusLabels, statusPills } from '../../constants'
import { theme } from '../../theme'
import { canNudge, getNextNudgeTime } from '../../lib/taskUtils'
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
  const nudgeAllowed = canNudge(task)
  const nextNudgeTime = getNextNudgeTime(task)
  
  const getCooldownMessage = () => {
    if (!nextNudgeTime) return ''
    const now = new Date()
    const hoursLeft = Math.ceil((nextNudgeTime.getTime() - now.getTime()) / (1000 * 60 * 60))
    if (hoursLeft <= 0) return ''
    if (hoursLeft < 1) {
      const minutesLeft = Math.ceil((nextNudgeTime.getTime() - now.getTime()) / (1000 * 60))
      return `Wait ${minutesLeft} min${minutesLeft !== 1 ? 's' : ''} before nudging again`
    }
    return `Wait ${hoursLeft} hour${hoursLeft !== 1 ? 's' : ''} before nudging again (3h cooldown)`
  }

  const cooldownMessage = getCooldownMessage()
  const isOnCooldown = !nudgeAllowed && task.members.length > 0

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
          title={
            task.members.length === 0
              ? 'No one to nudge yet'
              : isOnCooldown
                ? cooldownMessage
                : 'Send email reminder to task members (3h cooldown)'
          }
          disabled={task.members.length === 0 || nudgeFeedback[task.id] === 'sending' || isOnCooldown}
          onClick={(e) => {
            e.stopPropagation()
            onNudge(task)
          }}
          className={`rounded-full px-2.5 h-6 text-[9px] font-black transition-all flex items-center justify-center gap-1 shadow-sm ${
            nudgeFeedback[task.id] === 'sent'
              ? theme.colors.action.nudge.sent.badge
              : nudgeFeedback[task.id] === 'error'
                ? theme.colors.action.nudge.failed.badge
                : isOnCooldown
                  ? theme.colors.action.nudge.overdue.disabled
                  : theme.colors.action.nudge.overdue.active
          }`}
        >
          {nudgeFeedback[task.id] === 'sending' ? '...' : nudgeFeedback[task.id] === 'sent' ? (
            <>
              <svg xmlns="http://www.w3.org/2000/svg" width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12" />
              </svg>
              SENT
            </>
          ) : nudgeFeedback[task.id] === 'error' ? (
            <>
              <svg xmlns="http://www.w3.org/2000/svg" width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="8" x2="12" y2="12" />
                <line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
              FAILED
            </>
          ) : (
            <>
              <svg xmlns="http://www.w3.org/2000/svg" width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <rect width="20" height="16" x="2" y="4" rx="2" />
                <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
              </svg>
              OVERDUE
            </>
          )}
        </button>
      ) : dueSoon ? (
        <button
          type="button"
          title={
            task.members.length === 0
              ? 'No one to nudge yet'
              : isOnCooldown
                ? cooldownMessage
                : 'Send email reminder to task members (3h cooldown)'
          }
          disabled={task.members.length === 0 || nudgeFeedback[task.id] === 'sending' || isOnCooldown}
          onClick={(e) => {
            e.stopPropagation()
            onNudge(task)
          }}
          className={`rounded-full px-2.5 h-6 text-[9px] font-black transition-all flex items-center justify-center gap-1 shadow-sm ${
            task.members.length === 0
              ? theme.colors.action.nudge.dueSoon.disabled
              : nudgeFeedback[task.id] === 'sent'
                ? theme.colors.action.nudge.sent.badge
                : nudgeFeedback[task.id] === 'error'
                  ? theme.colors.action.nudge.failed.badge
                  : isOnCooldown
                    ? theme.colors.action.nudge.dueSoon.disabled
                    : theme.colors.action.nudge.dueSoon.active
          }`}
        >
          {nudgeFeedback[task.id] === 'sending' ? '...' : nudgeFeedback[task.id] === 'sent' ? (
            <>
              <svg xmlns="http://www.w3.org/2000/svg" width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12" />
              </svg>
              SENT
            </>
          ) : nudgeFeedback[task.id] === 'error' ? (
            <>
              <svg xmlns="http://www.w3.org/2000/svg" width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="8" x2="12" y2="12" />
                <line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
              FAILED
            </>
          ) : (
            <>
              <svg xmlns="http://www.w3.org/2000/svg" width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <rect width="20" height="16" x="2" y="4" rx="2" />
                <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
              </svg>
              DUE SOON
            </>
          )}
        </button>
      ) : null}
    </>
  )
}

