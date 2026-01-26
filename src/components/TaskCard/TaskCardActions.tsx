import { theme } from '../../theme'
import type { TaskCardActionsProps } from './types'

export const TaskCardActions = ({
  task,
  onTakeTask,
  onJoinTask,
  onLeaveTask,
  onStatusChange,
  canClaim,
  canJoin,
  canLeave,
  isMember,
  expired,
}: TaskCardActionsProps) => {
  if (task.status === 'done' || expired) return null

  return (
    <>
      {canClaim && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation()
            onTakeTask(task)
          }}
          className={`inline-flex items-center justify-center rounded-lg py-1.5 text-[10px] font-black uppercase tracking-wide transition-all w-16 ${theme.colors.action.task.claim}`}
        >
          Claim
        </button>
      )}
      {canJoin && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation()
            onJoinTask(task)
          }}
          className={`inline-flex items-center justify-center rounded-lg py-1.5 text-[10px] font-black uppercase tracking-wide transition-all w-16 ${theme.colors.action.task.join}`}
        >
          Join
        </button>
      )}
      {isMember && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation()
            onStatusChange(task, 'done')
          }}
          className={`rounded-lg px-3 py-1.5 text-[10px] font-black uppercase tracking-wide transition-all ${theme.colors.action.task.finish}`}
        >
          Finish
        </button>
      )}
      {canLeave && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation()
            onLeaveTask(task)
          }}
          className={`rounded-lg px-3 py-1.5 text-[10px] font-black uppercase tracking-wide transition-all ${theme.colors.action.task.leave}`}
        >
          Leave
        </button>
      )}
    </>
  )
}

