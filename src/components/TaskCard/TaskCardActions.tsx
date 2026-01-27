import { useState, useRef, useEffect } from 'react'
import { theme } from '../../theme'
import { canNudge, getNextNudgeTime } from '../../lib/taskUtils'
import type { TaskCardActionsProps } from './types'

export const TaskCardActions = ({
  task,
  onLeaveTask,
  onStatusChange,
  onAssignMembers,
  onNudge,
  nudgeFeedback,
  projectMembers,
  getUserName,
  canLeave,
  isMember,
  expired,
  now,
}: TaskCardActionsProps) => {
  const [showAssignDropdown, setShowAssignDropdown] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowAssignDropdown(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  if (task.status === 'done' || expired) return null

  const toggleMember = (memberId: string) => {
    const currentMembers = task.members
    const nextMembers = currentMembers.includes(memberId)
      ? currentMembers.filter(id => id !== memberId)
      : [...currentMembers, memberId]
    onAssignMembers(task, nextMembers)
  }

  const isTaskMember = (memberId: string) => task.members.includes(memberId)

  const nudgeAllowed = canNudge(task, now)
  const nextNudgeTime = getNextNudgeTime(task)
  
  const getCooldownMessage = () => {
    if (!nextNudgeTime) return ''
    const hoursLeft = Math.ceil((nextNudgeTime.getTime() - now.getTime()) / (1000 * 60 * 60))
    if (hoursLeft <= 0) return ''
    if (hoursLeft < 1) {
      const minutesLeft = Math.ceil((nextNudgeTime.getTime() - now.getTime()) / (1000 * 60))
      return `Wait ${minutesLeft} min${minutesLeft !== 1 ? 's' : ''} before nudging again`
    }
    return `Wait ${hoursLeft} hour${hoursLeft !== 1 ? 's' : ''} before nudging again (3h cooldown)`
  }

  const isOnCooldown = !nudgeAllowed && task.members.length > 0

  return (
    <>
      {task.members.length > 0 && (
        <button
          type="button"
          title={isOnCooldown ? getCooldownMessage() : 'Send email notification to task members'}
          disabled={nudgeFeedback[task.id] === 'sending' || isOnCooldown}
          onClick={(e) => {
            e.stopPropagation()
            onNudge(task)
          }}
          className={`rounded-lg px-3 py-1.5 text-[10px] font-black uppercase tracking-wide transition-all shadow-sm flex items-center gap-1.5 ${
            nudgeFeedback[task.id] === 'sent'
              ? theme.colors.action.nudge.sent.badge
              : nudgeFeedback[task.id] === 'error'
                ? theme.colors.action.nudge.failed.badge
                : isOnCooldown
                  ? theme.colors.action.nudge.cooldown
                  : theme.colors.action.nudge.notify
          }`}
        >
          {nudgeFeedback[task.id] === 'sending' ? '...' : nudgeFeedback[task.id] === 'sent' ? (
            <>
              <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
              SENT
            </>
          ) : nudgeFeedback[task.id] === 'error' ? (
            'FAILED'
          ) : (
            <>
              <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" /><rect width="20" height="16" x="2" y="4" rx="2" /></svg>
              NOTIFY
            </>
          )}
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

      <div className="relative" ref={dropdownRef}>
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation()
            setShowAssignDropdown(!showAssignDropdown)
          }}
          className={`inline-flex items-center justify-center rounded-lg py-1.5 text-[10px] font-black uppercase tracking-wide transition-all w-16 ${theme.colors.action.task.claim}`}
        >
          Assign
        </button>
        {showAssignDropdown && (
          <div className="absolute top-full right-0 mt-2 w-48 bg-white dark:bg-slate-800 rounded-xl shadow-2xl border border-slate-200 dark:border-slate-700 z-[60] py-2 animate-in fade-in slide-in-from-top-2 duration-200">
            <p className={`px-3 py-1.5 text-[9px] font-black uppercase tracking-widest ${theme.colors.ui.textLight} border-b ${theme.colors.ui.border} mb-1`}>
              Assign Members
            </p>
            <div className="max-h-48 overflow-y-auto no-scrollbar">
              {projectMembers.map((memberId) => {
                const active = isTaskMember(memberId)
                return (
                  <button
                    key={memberId}
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation()
                      toggleMember(memberId)
                    }}
                    className={`w-full flex items-center justify-between px-3 py-2 text-[11px] font-bold transition-all hover:bg-slate-50 dark:hover:bg-slate-700/50 ${
                      active ? `${theme.colors.ui.textEmerald} ${theme.colors.ui.bgEmeraldSubtle}` : theme.colors.ui.text
                    }`}
                  >
                    <span className="truncate">
                      {getUserName(memberId)}
                    </span>
                    {active && (
                      <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                    )}
                  </button>
                )
              })}
            </div>
          </div>
        )}
      </div>
    </>
  )
}

