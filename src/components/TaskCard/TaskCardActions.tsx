import { useState, useRef, useEffect } from 'react'
import { theme } from '../../theme'
import { canNudge, getNextNudgeTime, isOverdue, isDueSoon, formatDue } from '../../lib/taskUtils'
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
  isProjectMember,
  now,
}: TaskCardActionsProps) => {
  const [showAssignDropdown, setShowAssignDropdown] = useState(false)
  const [showRemindPopover, setShowRemindPopover] = useState(false)
  const [remindMessage, setRemindMessage] = useState('')
  const dropdownRef = useRef<HTMLDivElement>(null)
  const remindRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const getDefaultMessage = () =>
    `Hey, just a reminder — "${task.title}" is due ${formatDue(task.dueAt)}. Can you please take a look?`

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowAssignDropdown(false)
      }
      if (remindRef.current && !remindRef.current.contains(event.target as Node)) {
        setShowRemindPopover(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Focus textarea when popover opens
  useEffect(() => {
    if (showRemindPopover && textareaRef.current) {
      textareaRef.current.focus()
      textareaRef.current.select()
    }
  }, [showRemindPopover])

  if (task.status === 'done') {
    return isProjectMember ? (
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation()
          onStatusChange(task, 'in_progress')
        }}
        className={`rounded-lg px-3 py-1.5 text-[10px] font-black uppercase tracking-wide transition-all ${theme.colors.action.task.reset}`}
      >
        Reset
      </button>
    ) : null
  }

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
      return `Wait ${minutesLeft} min${minutesLeft !== 1 ? 's' : ''} before sending again`
    }
    return `Wait ${hoursLeft} hour${hoursLeft !== 1 ? 's' : ''} before sending again (3h cooldown)`
  }

  const isOnCooldown = !nudgeAllowed && task.members.length > 0
  const showRemind = (isOverdue(task, now) || isDueSoon(task, now)) && task.members.length > 0

  const openRemindPopover = () => {
    setRemindMessage(getDefaultMessage())
    setShowRemindPopover(true)
  }

  const handleSendReminder = () => {
    const trimmed = remindMessage.trim()
    if (!trimmed) return
    onNudge(task, trimmed)
    setShowRemindPopover(false)
    setRemindMessage('')
  }

  const handleCancelReminder = () => {
    setShowRemindPopover(false)
    setRemindMessage('')
  }

  return (
    <>
      {showRemind && (
        <div className="relative" ref={remindRef}>
          <button
            type="button"
            title={isOnCooldown ? getCooldownMessage() : 'Send an in-app reminder to task members'}
            disabled={nudgeFeedback[task.id] === 'sending' || isOnCooldown}
            onClick={(e) => {
              e.stopPropagation()
              if (!isOnCooldown && nudgeFeedback[task.id] !== 'sending') {
                openRemindPopover()
              }
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
                <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M18 8a6 6 0 0 0-12 0c0 7-3 9-3 9h18s-3-2-3-9" /><path d="M13.73 21a2 2 0 0 1-3.46 0" /></svg>
                REMIND
              </>
            )}
          </button>

          {/* Reminder message popover */}
          {showRemindPopover && (
            <div
              onClick={(e) => e.stopPropagation()}
              className="absolute top-full right-0 mt-2 w-72 bg-white dark:bg-slate-800 rounded-xl shadow-2xl border border-slate-200 dark:border-slate-700 z-[60] p-3 animate-in fade-in slide-in-from-top-2 duration-200"
            >
              <p className={`text-[9px] font-black uppercase tracking-widest ${theme.colors.ui.textLight} mb-2`}>
                Send an in-app reminder to assignees
              </p>
              <textarea
                ref={textareaRef}
                value={remindMessage}
                onChange={(e) => setRemindMessage(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
                    e.preventDefault()
                    handleSendReminder()
                  }
                  if (e.key === 'Escape') {
                    e.preventDefault()
                    handleCancelReminder()
                  }
                }}
                rows={3}
                className={`w-full rounded-lg border ${theme.colors.ui.borderStrong} ${theme.colors.ui.background} px-3 py-2 text-xs font-medium ${theme.colors.ui.text} focus:outline-none focus:border-amber-400 transition-all resize-none`}
                placeholder="Write your reminder message..."
              />
              <div className="flex items-center justify-between mt-2">
                <p className={`text-[9px] ${theme.colors.ui.textMuted}`}>
                  ⌘+Enter to send · Esc to cancel
                </p>
                <div className="flex gap-1.5">
                  <button
                    type="button"
                    onClick={handleCancelReminder}
                    className={`rounded-lg px-2.5 py-1 text-[10px] font-black uppercase tracking-widest ${theme.colors.ui.textLight} hover:bg-slate-100 dark:hover:bg-slate-700/50 transition-all`}
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleSendReminder}
                    disabled={!remindMessage.trim()}
                    className={`rounded-lg px-2.5 py-1 text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-1 ${
                      remindMessage.trim()
                        ? 'bg-rose-500 text-white hover:bg-rose-600'
                        : 'bg-slate-200 dark:bg-slate-700 text-slate-400 cursor-not-allowed'
                    }`}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M18 8a6 6 0 0 0-12 0c0 7-3 9-3 9h18s-3-2-3-9" /><path d="M13.73 21a2 2 0 0 1-3.46 0" /></svg>
                    Send
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
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

