import { useEffect, useState } from 'react'
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
  const [editingDue, setEditingDue] = useState(false)
  const [editingDescription, setEditingDescription] = useState(false)
  const [dueAtDraft, setDueAtDraft] = useState(task.dueAt)
  const [descriptionDraft, setDescriptionDraft] = useState(task.description)

  useEffect(() => {
    setDueAtDraft(task.dueAt)
    setDescriptionDraft(task.description)
  }, [task])

  const handleSaveDue = () => {
    if (dueAtDraft !== task.dueAt) {
      onDueChange(task, dueAtDraft)
    }
    setEditingDue(false)
  }

  const handleSaveDescription = () => {
    if (descriptionDraft !== task.description) {
      onDescriptionChange(task, descriptionDraft)
    }
    setEditingDescription(false)
  }

  const handleCancelDue = () => {
    setDueAtDraft(task.dueAt)
    setEditingDue(false)
  }

  const handleCancelDescription = () => {
    setDescriptionDraft(task.description)
    setEditingDescription(false)
  }

  const derivedStatus = deriveStatus(task)
  const isDone = task.status === 'done'
  const expired = isExpired(task)
  const overdue = isOverdue(task) && !isDone
  const dueSoon = isDueSoon(task) && !expired && !overdue && !isDone

  // Simplified member model - all members are equal
  const isUnclaimed = task.status === 'open'
  const isMember = currentUserId ? task.members.includes(currentUserId) : false
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
              <h4 className={`text-sm md:text-base font-bold ${theme.colors.ui.text} break-words line-clamp-1 group-hover:line-clamp-none transition-all`}>
                {task.title}
              </h4>
            </div>
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 ml-7">
              <p className={`text-[10px] md:text-[11px] font-bold ${theme.colors.ui.textMuted} truncate max-w-[200px]`}>
                {hasClaimed ? (
                  <span className="text-emerald-600 dark:text-emerald-400">
                    {memberNames.join(', ')}
                  </span>
                ) : (
                  <span className="text-amber-600 dark:text-amber-400 font-black">Unclaimed</span>
                )}
              </p>
              <p className={`text-[10px] md:text-[11px] font-medium ${theme.colors.ui.textLight}`}>Due {formatDue(task.dueAt)}</p>
            </div>
          </div>

          {/* Right side: All on one line - Status badges + Actions + Expand */}
          <div className="shrink-0 flex items-center justify-end gap-2 ml-7 sm:ml-0">
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
              onLeaveTask={onLeaveTask}
              onStatusChange={onStatusChange}
              onAssignMembers={onAssignMembers}
              projectMembers={projectMembers}
              getUserName={getUserName}
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
                {task.status === 'in_progress' ? (
                  <span className={`text-[11px] font-bold ${theme.colors.ui.textMuted}`}>In Progress</span>
                ) : (
                  <span className={`inline-flex items-center justify-center rounded-full px-2 h-5 text-[9px] font-black uppercase tracking-wider ${statusPills[derivedStatus]}`}>
                    {statusLabels[derivedStatus]}
                  </span>
                )}
              </div>
              <div className="flex items-center gap-1.5">
                <span className={`font-black uppercase tracking-wider ${theme.colors.ui.textLight}`}>Due:</span>
                {editingDue ? (
                  <div className="flex items-center gap-1">
                    <input
                      type="datetime-local"
                      value={dueAtDraft}
                      onChange={(e) => setDueAtDraft(e.target.value)}
                      onBlur={handleSaveDue}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') handleSaveDue()
                        if (e.key === 'Escape') handleCancelDue()
                      }}
                      autoFocus
                      className={`rounded-lg border ${theme.colors.ui.borderStrong} ${theme.colors.ui.background} px-2 py-1 text-[11px] font-black ${theme.colors.ui.text} focus:outline-none`}
                    />
                  </div>
                ) : (
                  <div className="flex items-center gap-1.5 group/due">
                    <span className={`font-bold ${theme.colors.ui.text}`}>{formatDue(task.dueAt)}</span>
                    <button
                      type="button"
                      onClick={() => setEditingDue(true)}
                      className="opacity-0 group-hover/due:opacity-100 p-0.5 rounded hover:bg-slate-100 dark:hover:bg-slate-800 transition-all"
                      title="Edit due date"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className={theme.colors.ui.textLight}>
                        <path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/><path d="m15 5 4 4"/>
                      </svg>
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Right: Delete button */}
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => onDeleteTask(task)}
                className="flex items-center gap-1 rounded-lg px-2.5 py-1 text-[10px] font-black uppercase tracking-widest text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-900/20 transition-all"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18" /><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" /><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" /></svg>
                Delete
              </button>
            </div>
          </div>

          {/* Description */}
          <div className="mt-3">
            <div className="flex items-center gap-1.5 mb-1.5 group/desc">
              <p className={`text-[9px] font-black uppercase tracking-wider ${theme.colors.ui.textLight}`}>Description</p>
              {!editingDescription && (
                <button
                  type="button"
                  onClick={() => setEditingDescription(true)}
                  className="opacity-0 group-hover/desc:opacity-100 p-0.5 rounded hover:bg-slate-100 dark:hover:bg-slate-800 transition-all"
                  title="Edit description"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className={theme.colors.ui.textLight}>
                    <path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/><path d="m15 5 4 4"/>
                  </svg>
                </button>
              )}
            </div>
            {editingDescription ? (
              <textarea
                value={descriptionDraft}
                onChange={(e) => setDescriptionDraft(e.target.value)}
                onBlur={handleSaveDescription}
                onKeyDown={(e) => {
                  if (e.key === 'Escape') handleCancelDescription()
                  if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) handleSaveDescription()
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

