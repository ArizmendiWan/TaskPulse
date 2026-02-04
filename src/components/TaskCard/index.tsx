import { useEffect, useState } from 'react'
import { isOverdue, isExpired, isDueSoon, formatDue, getCountdown } from '../../lib/taskUtils'
import { theme } from '../../theme'
import { TaskCardActions } from './TaskCardActions'
import { TaskCommentsSection } from './TaskCommentsSection'
import { TaskActivitySection } from './TaskActivitySection'
import type { TaskCardProps } from './types'

export const TaskCard = ({
  task,
  expanded,
  onToggleExpand,
  onStatusChange,
  onTitleChange,
  onLeaveTask,
  onDueChange,
  onDescriptionChange,
  onAddComment,
  onUpdateComment,
  onDeleteComment,
  onDeleteTask,
  onNudge,
  onTogglePin,
  getUserName,
  onAssignMembers,
  projectMembers,
  nudgeFeedback,
  currentUserId,
}: TaskCardProps) => {
  // Inline editing states
  const [dueAtDraft, setDueAtDraft] = useState(task.dueAt)
  const [descriptionDraft, setDescriptionDraft] = useState(task.description)
  const [titleDraft, setTitleDraft] = useState(task.title)
  const [now, setNow] = useState(new Date())
  const [isTaskEditMode, setIsTaskEditMode] = useState(false)

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 60000) // update every minute
    return () => clearInterval(timer)
  }, [])

  useEffect(() => {
    setDueAtDraft(task.dueAt)
    setDescriptionDraft(task.description)
    setTitleDraft(task.title)
  }, [task])

  const handleSaveTitle = () => {
    const trimmed = titleDraft.trim()
    if (trimmed && trimmed !== task.title) {
      onTitleChange(task, trimmed)
    } else {
      setTitleDraft(task.title)
    }
  }

  const handleSaveDue = () => {
    if (dueAtDraft !== task.dueAt) {
      onDueChange(task, dueAtDraft)
    }
  }

  const handleSaveDescription = () => {
    if (descriptionDraft !== task.description) {
      onDescriptionChange(task, descriptionDraft)
    }
  }

  const enterTaskEditMode = () => {
    if (isTaskEditMode) return
    if (!expanded) {
      onToggleExpand(task.id)
    }
    setIsTaskEditMode(true)
  }

  const saveTaskEdits = () => {
    handleSaveTitle()
    handleSaveDue()
    handleSaveDescription()
    setIsTaskEditMode(false)
  }

  const discardTaskEdits = () => {
    setTitleDraft(task.title)
    setDueAtDraft(task.dueAt)
    setDescriptionDraft(task.description)
    setIsTaskEditMode(false)
  }

  const isDone = task.status === 'done'
  const expired = isExpired(task, now)
  const overdue = isOverdue(task, now) && !isDone
  const dueSoon = isDueSoon(task, now) && !expired && !overdue && !isDone

  // Simplified member model - all members are equal
  const isUnclaimed = task.status === 'open'
  const isMember = currentUserId ? task.members.includes(currentUserId) : false
  const isProjectMember = currentUserId ? projectMembers.includes(currentUserId) : false
  const hasClaimed = task.members.length > 0
  const canLeave = isMember && task.status !== 'done'

  // Get member names for display
  const memberNames = task.members.map(id => getUserName(id))

  return (
    <div
      className={`group relative rounded-2xl border transition-all duration-300 ${
        isDone
          ? theme.colors.taskCard.done
          : expired
            ? theme.colors.taskCard.expired
            : overdue
              ? theme.colors.taskCard.overdue
              : dueSoon
                ? theme.colors.taskCard.dueSoon
                : isUnclaimed
                  ? theme.colors.taskCard.unclaimed
                  : theme.colors.taskCard.default
      }`}
    >
      {/* Collapsed Header */}
      <div className="p-4 md:p-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          {/* Left side: Task info */}
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
            className="flex-1 min-w-0 cursor-pointer"
          >
            <div className="flex items-start gap-2 mb-1">
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  onTogglePin(task)
                }}
                className={`shrink-0 w-5 h-5 mt-0.5 rounded-full flex items-center justify-center transition-all ${
                  task.isPinned
                    ? 'bg-amber-100 dark:bg-amber-900/30 text-amber-600'
                    : `${theme.colors.ui.textLight} opacity-0 group-hover:opacity-100 hover:text-amber-500`
                }`}
                title={task.isPinned ? 'Unpin task' : 'Pin task'}
              >
                <span className={`text-[10px] ${task.isPinned ? '' : 'grayscale opacity-50 hover:grayscale-0 hover:opacity-100'}`}>📌</span>
              </button>
              <div className="flex-1 min-w-0">
                {isTaskEditMode ? (
                  <input
                    value={titleDraft}
                    onChange={(e) => setTitleDraft(e.target.value)}
                    onClick={(e) => e.stopPropagation()}
                    onKeyDown={(e) => {
                      e.stopPropagation()
                      if (e.key === 'Enter') {
                        saveTaskEdits()
                        e.preventDefault()
                      }
                      if (e.key === 'Escape') discardTaskEdits()
                    }}
                    autoFocus
                    className={`w-full rounded-md border-2 ${theme.colors.ui.borderStrong} ${theme.colors.ui.background} px-2 py-1 text-sm md:text-base font-bold ${theme.colors.ui.text} focus:outline-none focus:border-amber-400 focus:bg-white dark:focus:bg-slate-800 transition-all`}
                    aria-label="Edit task title"
                  />
                ) : (
                  <div>
                    <h4 className={`text-sm md:text-base font-bold ${theme.colors.ui.text} break-words transition-all line-clamp-1 group-hover:line-clamp-none`}>{task.title}</h4>
                  </div>
                )}
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 ml-7">
              <p className={`text-[10px] md:text-[11px] font-bold ${theme.colors.ui.textMuted} truncate max-w-[200px]`}>
                {hasClaimed ? (
                  <span className={theme.colors.ui.textEmerald}>
                    {memberNames.join(', ')}
                  </span>
                ) : (
                  <span className={`${theme.colors.ui.textAmber} font-black`}>Unclaimed</span>
                )}
              </p>
              <div className="flex items-center gap-2">
                <p className={`text-[10px] md:text-[11px] font-medium ${theme.colors.ui.textLight}`}>Due {formatDue(task.dueAt)}</p>
                {dueSoon && (
                  <span className={`text-[10px] md:text-[11px] font-black ${theme.colors.ui.textRose} animate-pulse`}>
                    {getCountdown(task.dueAt, now)}
                  </span>
                )}
                {overdue && (
                  <span className={`text-[10px] md:text-[11px] font-black ${theme.colors.ui.textRose}`}>
                    OVERDUE
                  </span>
                )}
                {expired && (
                  <span className={`text-[10px] md:text-[11px] font-black ${theme.colors.ui.textLight}`}>
                    EXPIRED
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Right side: All on one line - Actions + Expand */}
          <div className="shrink-0 flex items-center justify-end gap-2 ml-7 sm:ml-0">
            <TaskCardActions
              task={task}
              onLeaveTask={onLeaveTask}
              onStatusChange={onStatusChange}
              onAssignMembers={onAssignMembers}
              onNudge={onNudge}
              nudgeFeedback={nudgeFeedback}
              projectMembers={projectMembers}
              getUserName={getUserName}
              canLeave={canLeave}
              isMember={isMember}
              isProjectMember={isProjectMember}
              expired={expired}
              now={now}
            />

            {/* Expand button */}
            <button
              onClick={() => onToggleExpand(task.id)}
              className={`p-1 rounded-lg ${theme.colors.ui.textLight} hover:${theme.colors.ui.text} transition-all`}
            >
              <svg
                className={`transition-transform duration-300 ${expanded ? 'rotate-180' : ''}`}
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
            </button>
          </div>
        </div>
      </div>

      {/* Expanded Content */}
      {expanded && (
        <div className={`px-5 pb-4 pt-2 border-t ${theme.colors.ui.border} animate-in slide-in-from-top-2 duration-300`}>
          {/* Top row: metadata + actions */}
          <div className="flex flex-wrap items-start justify-between gap-4 pt-2">
            {/* Left: Compact metadata */}
            <div className="flex flex-wrap items-center gap-4 text-[11px]">
              <div className="flex items-center gap-2">
                <span className={`font-black uppercase tracking-wider ${theme.colors.ui.textLight}`}>Members:</span>
                {task.members.length > 0 ? (
                  <span className="font-bold text-emerald-600 dark:text-emerald-400">
                    {task.members.map(id => getUserName(id)).join(', ')}
                  </span>
                ) : (
                  <span className={`font-bold italic ${theme.colors.ui.textLight}`}>Unclaimed</span>
                )}
              </div>
              <div className="flex items-center gap-1.5">
                <span className={`font-black uppercase tracking-wider ${theme.colors.ui.textLight}`}>Due:</span>
                {isTaskEditMode ? (
                  <div className="flex items-center gap-1">
                    <input
                      type="datetime-local"
                      value={dueAtDraft}
                      onChange={(e) => setDueAtDraft(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') saveTaskEdits()
                        if (e.key === 'Escape') discardTaskEdits()
                      }}
                      autoFocus
                      className={`rounded-lg border ${theme.colors.ui.borderStrong} ${theme.colors.ui.background} px-2 py-1 text-[11px] font-black ${theme.colors.ui.text} focus:outline-none`}
                    />
                  </div>
                ) : (
                  <div className="flex items-center gap-1.5 group/due">
                    <span className={`font-bold ${theme.colors.ui.text}`}>{formatDue(task.dueAt)}</span>
                  </div>
                )}
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              {isTaskEditMode ? (
                <>
                  <button
                    type="button"
                    onClick={saveTaskEdits}
                    className="rounded-lg px-3 py-1 text-[10px] font-black uppercase tracking-widest text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800 hover:bg-emerald-50 dark:hover:bg-emerald-900/40 transition-all"
                  >
                    Save
                  </button>
                  <button
                    type="button"
                    onClick={discardTaskEdits}
                    className="rounded-lg px-3 py-1 text-[10px] font-black uppercase tracking-widest text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-900/30 transition-all"
                  >
                    Discard
                  </button>
                </>
              ) : (
                <>
                  <button
                    type="button"
                    onClick={enterTaskEditMode}
                    className="rounded-lg px-3 py-1 text-[10px] font-black uppercase tracking-widest text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-900/30 transition-all"
                  >
                    Edit task
                  </button>
                  <button
                    type="button"
                    onClick={() => onDeleteTask(task)}
                    className="flex items-center gap-1 rounded-lg px-2.5 py-1 text-[10px] font-black uppercase tracking-widest text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-900/20 transition-all"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18" /><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" /><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" /></svg>
                    Delete
                  </button>
                </>
              )}
            </div>
          </div>

          {/* Description */}
          <div className="mt-3">
            <div className="flex items-center gap-1.5 mb-1.5 group/desc">
              <p className={`text-[9px] font-black uppercase tracking-wider ${theme.colors.ui.textLight}`}>Description</p>
            </div>
            {isTaskEditMode ? (
              <textarea
                value={descriptionDraft}
                onChange={(e) => setDescriptionDraft(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Escape') discardTaskEdits()
                  if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) saveTaskEdits()
                }}
                autoFocus
                className={`w-full rounded-xl border ${theme.colors.ui.input} p-3 text-xs font-medium focus:outline-none transition-all resize-none`}
                placeholder="Add description..."
                rows={2}
              />
            ) : (
              <p className={`text-xs font-medium ${theme.colors.ui.textMuted} leading-relaxed`}>
                {task.description || 'No description provided.'}
              </p>
            )}
          </div>

          {/* Posted by */}
          <p className={`mt-3 text-[10px] ${theme.colors.ui.textLight}`}>
            Posted by <span className="font-bold">{getUserName(task.creatorId)}</span> on {new Date(task.createdAt).toLocaleDateString()}
          </p>

          <TaskCommentsSection
            task={task}
            onAddComment={onAddComment}
            onUpdateComment={onUpdateComment}
            onDeleteComment={onDeleteComment}
            getUserName={getUserName}
            currentUserId={currentUserId}
          />

          <TaskActivitySection task={task} />
        </div>
      )}
    </div>
  )
}

