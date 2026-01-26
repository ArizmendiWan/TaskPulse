import { useEffect, useState } from 'react'
import type { TaskStatus } from '../../types'
import { isOverdue, isExpired, isDueSoon, formatDue, deriveStatus } from '../../lib/taskUtils'
import { statusLabels, statusPills } from '../../constants'
import { theme } from '../../theme'
import { TaskStatusBadges } from './TaskStatusBadges'
import { TaskCardActions } from './TaskCardActions'
import { TaskCommentsSection } from './TaskCommentsSection'
import { TaskActivitySection } from './TaskActivitySection'
import type { TaskCardProps } from './types'

export const TaskCard = ({
  task,
  expanded,
  onToggleExpand,
  onStatusChange,
  onTakeTask,
  onJoinTask,
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
  nudgeFeedback,
  currentUserId,
}: TaskCardProps) => {
  // Drafting System States
  const [isEditing, setIsEditing] = useState(false)
  const [statusDraft, setStatusDraft] = useState<TaskStatus>(task.status)
  const [dueAtDraft, setDueAtDraft] = useState(task.dueAt)
  const [descriptionDraft, setDescriptionDraft] = useState(task.description)

  useEffect(() => {
    if (!isEditing) {
      setStatusDraft(task.status)
      setDueAtDraft(task.dueAt)
      setDescriptionDraft(task.description)
    }
  }, [task, isEditing])

  const handleSaveDraft = () => {
    if (statusDraft !== task.status) onStatusChange(task, statusDraft)
    if (dueAtDraft !== task.dueAt) onDueChange(task, dueAtDraft)
    if (descriptionDraft !== task.description) onDescriptionChange(task, descriptionDraft)
    setIsEditing(false)
  }

  const handleCancelDraft = () => {
    setStatusDraft(task.status)
    setDueAtDraft(task.dueAt)
    setDescriptionDraft(task.description)
    setIsEditing(false)
  }

  const derivedStatus = deriveStatus(task)
  const expired = isExpired(task)
  const overdue = isOverdue(task)
  const dueSoon = isDueSoon(task) && !expired && !overdue

  // Simplified member model - all members are equal
  const isUnclaimed = task.status === 'open'
  const isMember = currentUserId ? task.members.includes(currentUserId) : false
  const hasClaimed = task.members.length > 0
  const canClaim = isUnclaimed && !!currentUserId && !expired
  const canJoin = !isUnclaimed && !!currentUserId && !isMember && task.status !== 'done' && !expired
  const canLeave = isMember && task.status !== 'done'

  // Get member names for display
  const memberNames = task.members.map(id => getUserName(id))

  return (
    <div
      className={`group relative rounded-2xl border transition-all duration-300 ${
        expired
          ? 'border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900/50 opacity-75'
          : overdue
            ? 'border-rose-100 dark:border-rose-900/30 bg-rose-50/10 dark:bg-rose-900/10'
            : dueSoon
              ? 'border-amber-100 dark:border-amber-900/30 bg-amber-50/10 dark:bg-amber-900/10'
              : `${theme.colors.ui.border} ${theme.colors.ui.surface} hover:${theme.colors.ui.borderStrong} hover:shadow-md dark:hover:shadow-black/50`
      }`}
    >
      {/* Collapsed Header */}
      <div className="p-4 md:p-5">
        <div className="flex items-center justify-between gap-3">
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
            <div className="flex items-center gap-2 mb-1">
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  onTogglePin(task)
                }}
                className={`shrink-0 w-5 h-5 rounded-full flex items-center justify-center transition-all ${
                  task.isPinned
                    ? 'bg-amber-100 dark:bg-amber-900/30 text-amber-600'
                    : 'text-slate-300 opacity-0 group-hover:opacity-100 hover:text-amber-500'
                }`}
                title={task.isPinned ? 'Unpin task' : 'Pin task'}
              >
                <span className={`text-[10px] ${task.isPinned ? '' : 'grayscale opacity-50 hover:grayscale-0 hover:opacity-100'}`}>📌</span>
              </button>
              <h4 className={`text-base font-bold ${theme.colors.ui.text} break-words line-clamp-1 group-hover:line-clamp-none transition-all`}>
                {task.title}
              </h4>
            </div>
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 ml-7">
              <p className={`text-[11px] font-bold ${theme.colors.ui.textMuted} truncate max-w-[200px]`}>
                {hasClaimed ? (
                  <span className="text-emerald-600 dark:text-emerald-400">
                    {memberNames.join(', ')}
                  </span>
                ) : (
                  <span className="text-amber-600 dark:text-amber-400 font-black">Unclaimed</span>
                )}
              </p>
              <p className={`text-[11px] font-medium ${theme.colors.ui.textLight}`}>Due {formatDue(task.dueAt)}</p>
            </div>
          </div>

          {/* Right side: All on one line - Status badges + Actions + Expand */}
          <div className="shrink-0 flex items-center gap-2">
            <TaskStatusBadges
              task={task}
              onNudge={onNudge}
              nudgeFeedback={nudgeFeedback}
              isUnclaimed={isUnclaimed}
              expired={expired}
              overdue={overdue}
              dueSoon={dueSoon}
            />

            <TaskCardActions
              task={task}
              onTakeTask={onTakeTask}
              onJoinTask={onJoinTask}
              onLeaveTask={onLeaveTask}
              onStatusChange={onStatusChange}
              canClaim={canClaim}
              canJoin={canJoin}
              canLeave={canLeave}
              isMember={isMember}
              expired={expired}
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
              <div className="flex items-center gap-2">
                <span className={`font-black uppercase tracking-wider ${theme.colors.ui.textLight}`}>Status:</span>
                {isEditing && task.members.length > 0 ? (
                  <select
                    aria-label="Status"
                    value={statusDraft}
                    onChange={(e) => setStatusDraft(e.target.value as TaskStatus)}
                    className={`rounded-lg border ${theme.colors.ui.borderStrong} ${theme.colors.ui.background} px-2 py-1 text-[11px] font-black ${theme.colors.ui.text} focus:outline-none`}
                  >
                    <option value="in_progress">In Progress</option>
                    <option value="done">Done</option>
                  </select>
                ) : (
                  <span className={`inline-flex items-center justify-center rounded-full px-2 h-5 text-[9px] font-black uppercase tracking-wider ${statusPills[derivedStatus]}`}>
                    {statusLabels[derivedStatus]}
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2">
                <span className={`font-black uppercase tracking-wider ${theme.colors.ui.textLight}`}>Due:</span>
                {isEditing ? (
                  <input
                    type="datetime-local"
                    value={dueAtDraft}
                    onChange={(e) => setDueAtDraft(e.target.value)}
                    className={`rounded-lg border ${theme.colors.ui.borderStrong} ${theme.colors.ui.background} px-2 py-1 text-[11px] font-black ${theme.colors.ui.text} focus:outline-none`}
                  />
                ) : (
                  <span className={`font-bold ${theme.colors.ui.text}`}>{formatDue(task.dueAt)}</span>
                )}
              </div>
            </div>

            {/* Right: Actions */}
            <div className="flex gap-2">
              {!isEditing ? (
                <>
                  <button
                    type="button"
                    onClick={() => setIsEditing(true)}
                    className="flex items-center gap-1 rounded-lg px-2.5 py-1 text-[10px] font-black uppercase tracking-widest bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-all"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/><path d="m15 5 4 4"/></svg>
                    Edit
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
              ) : (
                <>
                  <button
                    type="button"
                    onClick={handleCancelDraft}
                    className={`px-2.5 py-1 text-[10px] font-black uppercase tracking-widest ${theme.colors.ui.textLight} hover:${theme.colors.ui.text} transition-all`}
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleSaveDraft}
                    className="flex items-center gap-1 rounded-lg px-3 py-1 bg-amber-500 text-white text-[10px] font-black uppercase tracking-widest hover:bg-amber-600 transition-all"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                    Save
                  </button>
                </>
              )}
            </div>
          </div>

          {/* Description */}
          <div className="mt-3">
            <p className={`text-[9px] font-black uppercase tracking-wider ${theme.colors.ui.textLight} mb-1.5`}>Description</p>
            {isEditing ? (
              <textarea
                value={descriptionDraft}
                onChange={(e) => setDescriptionDraft(e.target.value)}
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

