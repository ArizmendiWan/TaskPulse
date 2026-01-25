import { useEffect, useState } from 'react'
import type { Task, TaskStatus } from '../types'
import { isOverdue, isExpired, isDueSoon, formatDue, deriveStatus } from '../lib/taskUtils'
import { statusLabels, statusPills } from '../constants'
import { theme } from '../theme'

interface TaskCardProps {
  task: Task
  expanded: boolean
  onToggleExpand: (taskId: string) => void
  onStatusChange: (task: Task, next: TaskStatus) => void
  onTakeTask: (task: Task) => void
  onJoinTask: (task: Task) => void
  onLeaveTask: (task: Task) => void
  onDueChange: (task: Task, next: string) => void
  onDescriptionChange: (task: Task, next: string) => void
  onAddComment: (task: Task, text: string) => void
  onUpdateComment: (task: Task, commentId: string, text: string) => void
  onDeleteComment: (task: Task, commentId: string) => void
  onDeleteTask: (task: Task) => void
  onNudge: (task: Task) => void
  onTogglePin: (task: Task) => void
  getUserName: (userId: string | null) => string
  nudgeFeedback: Record<string, 'sending' | 'sent' | 'error' | null>
  currentUserId: string | null
}

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
  const [showHistory, setShowHistory] = useState(false)
  const [newCommentText, setNewCommentText] = useState('')
  const [editingCommentId, setEditingCommentId] = useState<string | null>(null)
  const [editingCommentText, setEditingCommentText] = useState('')
  
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
  const canClaim = isUnclaimed && currentUserId && !expired
  const canJoin = !isUnclaimed && currentUserId && !isMember && task.status !== 'done' && !expired
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
              <span className={`rounded-full px-2 h-6 text-[9px] font-black uppercase tracking-wider flex items-center bg-slate-200 dark:bg-slate-700 text-slate-500 dark:text-slate-400`}>
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
                className={`rounded-full px-2.5 h-6 text-[9px] font-black transition-all flex items-center justify-center gap-1 shadow-sm bg-rose-600 text-white hover:bg-rose-500 disabled:bg-rose-300`}
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

            {/* Action buttons */}
            {task.status !== 'done' && !expired && (
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
            )}

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
        <div className={`px-5 pb-6 pt-2 border-t ${theme.colors.ui.border} animate-in slide-in-from-top-2 duration-300`}>
          <div className="flex justify-end gap-2 pt-2">
            {!isEditing ? (
              <>
                <button
                  type="button"
                  onClick={() => setIsEditing(true)}
                  className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-[10px] font-black uppercase tracking-widest bg-slate-700 text-white hover:bg-slate-600 dark:bg-slate-600 dark:hover:bg-slate-500 transition-all shadow-sm`}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/><path d="m15 5 4 4"/></svg>
                  Edit
                </button>
                <button
                  type="button"
                  onClick={() => onDeleteTask(task)}
                  className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-[10px] font-black uppercase tracking-widest ${theme.colors.action.danger.bg} ${theme.colors.action.danger.text} hover:${theme.colors.action.danger.hover} transition-all shadow-sm`}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="12"
                    height="12"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="3"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M3 6h18" />
                    <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
                    <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
                  </svg>
                  Delete
                </button>
              </>
            ) : (
              <>
                <button
                  type="button"
                  onClick={handleCancelDraft}
                  className={`px-3 py-1.5 text-[10px] font-black uppercase tracking-widest ${theme.colors.ui.textLight} hover:${theme.colors.ui.text} transition-all`}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSaveDraft}
                  className="flex items-center gap-1.5 rounded-lg px-4 py-1.5 bg-amber-500 text-white text-[10px] font-black uppercase tracking-widest hover:bg-amber-600 transition-all shadow-md"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                  Save
                </button>
              </>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4">
            {/* Members Section */}
            <div className="space-y-2">
              <p className={`text-[9px] font-black uppercase tracking-[0.2em] ${theme.colors.ui.textLight} ml-1`}>
                Members
              </p>
              <div className={`min-h-[40px] p-3 rounded-xl ${theme.colors.ui.background} border ${theme.colors.ui.border}`}>
                {task.members.length > 0 ? (
                  <div className="flex flex-wrap gap-1.5">
                    {task.members.map(id => (
                      <span 
                        key={id}
                        className={`inline-flex items-center px-2 py-1 rounded-lg text-[11px] font-bold ${theme.colors.ui.surface} border ${theme.colors.ui.borderStrong} ${theme.colors.ui.text}`}
                      >
                        {getUserName(id)}
                      </span>
                    ))}
                  </div>
                ) : (
                  <p className={`text-[11px] font-bold ${theme.colors.ui.textLight} italic`}>
                    No one has claimed this task yet
                  </p>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <p className={`text-[9px] font-black uppercase tracking-[0.2em] ${theme.colors.ui.textLight} ml-1`}>
                Status
              </p>
              {isEditing && task.members.length > 0 ? (
                <select
                  aria-label="Status"
                  value={statusDraft}
                  onChange={(e) => setStatusDraft(e.target.value as TaskStatus)}
                  className={`w-full rounded-xl border-2 ${theme.colors.ui.borderStrong} ${theme.colors.ui.background} px-3 py-2.5 text-[11px] font-black ${theme.colors.ui.text} focus:border-amber-400 focus:bg-white dark:focus:bg-slate-800 focus:outline-none transition-all`}
                >
                  <option value="in_progress">In Progress</option>
                  <option value="done">Done</option>
                </select>
              ) : (
                <div className="px-1 py-1">
                  <span className={`inline-flex items-center justify-center rounded-full px-2.5 h-6 text-[9px] font-black uppercase tracking-wider ${statusPills[derivedStatus]}`}>
                    {statusLabels[derivedStatus]}
                  </span>
                </div>
              )}
            </div>

            <div className="space-y-2">
              <p className={`text-[9px] font-black uppercase tracking-[0.2em] ${theme.colors.ui.textLight} ml-1`}>
                Due Date
              </p>
              {isEditing ? (
                <input
                  type="datetime-local"
                  value={dueAtDraft}
                  onChange={(e) => setDueAtDraft(e.target.value)}
                  className={`w-full rounded-xl border-2 ${theme.colors.ui.borderStrong} ${theme.colors.ui.background} px-3 py-2.5 text-[11px] font-black ${theme.colors.ui.text} focus:border-amber-400 focus:bg-white dark:focus:bg-slate-800 focus:outline-none transition-all`}
                />
              ) : (
                <div className="px-1 py-1">
                  <p className={`text-[11px] font-bold ${theme.colors.ui.text}`}>
                    {formatDue(task.dueAt)}
                  </p>
                </div>
              )}
            </div>
          </div>

          <div className="mt-6 space-y-3">
            <div className="flex items-center gap-2">
              <div className={`w-1.5 h-6 ${theme.colors.ui.textLight} rounded-full opacity-50`} />
              <p className={`text-[11px] font-black uppercase tracking-[0.2em] ${theme.colors.ui.textLight}`}>
                Description
              </p>
            </div>
            {isEditing ? (
              <textarea
                value={descriptionDraft}
                onChange={(e) => setDescriptionDraft(e.target.value)}
                className={`w-full rounded-2xl border-2 ${theme.colors.ui.input} p-4 text-xs font-bold focus:outline-none transition-all resize-none`}
                placeholder="Add description..."
                rows={3}
              />
            ) : (
              <div className={`w-full rounded-2xl bg-slate-50 dark:bg-slate-900/50 p-4 text-xs font-medium ${theme.colors.ui.textMuted} leading-relaxed min-h-[60px]`}>
                {task.description || 'No description provided.'}
              </div>
            )}
          </div>

          {/* Posted by */}
          <div className={`mt-4 pt-4 border-t ${theme.colors.ui.border}`}>
            <p className={`text-[10px] font-bold ${theme.colors.ui.textLight}`}>
              Posted by <span className={theme.colors.ui.textMuted}>{getUserName(task.creatorId)}</span> on {new Date(task.createdAt).toLocaleDateString()}
            </p>
          </div>

          <div className={`mt-8 space-y-6 pt-6 border-t ${theme.colors.ui.border}`}>
            <div className="flex items-center gap-2">
              <div className={`w-1.5 h-6 ${theme.colors.ui.text} rounded-full`} />
              <p className={`text-[11px] font-black uppercase tracking-[0.2em] ${theme.colors.ui.text}`}>
                Comments
              </p>
              <span className={`ml-2 px-2 py-0.5 rounded-full ${theme.colors.ui.background} text-[10px] font-black ${theme.colors.ui.textMuted}`}>
                {task.comments?.length || 0}
              </span>
            </div>

            <div className="space-y-4">
              {task.comments && task.comments.length > 0 ? (
                task.comments.map((comment) => (
                  <div key={comment.id} className="group/comment space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className={`text-[10px] font-black ${theme.colors.ui.text} uppercase tracking-wider`}>
                          {getUserName(comment.authorId)}
                        </span>
                        <span className={`text-[9px] font-bold ${theme.colors.ui.textLight}`}>
                          {new Date(comment.createdAt).toLocaleDateString(undefined, {
                            month: 'short',
                            day: 'numeric',
                            hour: 'numeric',
                            minute: '2-digit',
                          })}
                        </span>
                      </div>
                      {currentUserId === comment.authorId && (
                        <div className="flex items-center gap-2 opacity-0 group-hover/comment:opacity-100 transition-opacity">
                          <button
                            onClick={() => {
                              setEditingCommentId(comment.id)
                              setEditingCommentText(comment.text)
                            }}
                            className={`text-[10px] font-black ${theme.colors.ui.textLight} hover:text-amber-600 uppercase tracking-widest`}
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => onDeleteComment(task, comment.id)}
                            className={`text-[10px] font-black ${theme.colors.ui.textLight} hover:text-rose-600 uppercase tracking-widest`}
                          >
                            Delete
                          </button>
                        </div>
                      )}
                    </div>
                    {editingCommentId === comment.id ? (
                      <div className="space-y-2">
                    <textarea
                      value={editingCommentText}
                      onChange={(e) => setEditingCommentText(e.target.value)}
                      className={`w-full rounded-xl border-2 ${theme.colors.ui.input} p-3 text-xs font-medium focus:outline-none transition-all resize-none`}
                      rows={2}
                    />
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={() => setEditingCommentId(null)}
                            className={`px-3 py-1.5 text-[10px] font-black ${theme.colors.ui.textLight} hover:${theme.colors.ui.text} uppercase tracking-widest`}
                          >
                            Cancel
                          </button>
                          <button
                            onClick={() => {
                              onUpdateComment(task, comment.id, editingCommentText)
                              setEditingCommentId(null)
                            }}
                            className="px-3 py-1.5 rounded-lg bg-amber-500 text-white text-[10px] font-black uppercase tracking-widest hover:bg-amber-600 transition-all"
                          >
                            Save
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className={`rounded-2xl ${theme.colors.ui.background} p-4 text-xs font-medium ${theme.colors.ui.textMuted} leading-relaxed border border-transparent hover:${theme.colors.ui.borderStrong} transition-all`}>
                        {comment.text}
                      </div>
                    )}
                  </div>
                ))
              ) : (
                <div className={`py-8 text-center rounded-2xl border-2 border-dashed ${theme.colors.ui.border}`}>
                  <p className={`text-[10px] font-black ${theme.colors.ui.textLight} uppercase tracking-widest`}>
                    No comments yet
                  </p>
                </div>
              )}

              <div className="pt-2">
                <div className="relative">
                  <textarea
                    value={newCommentText}
                    onChange={(e) => setNewCommentText(e.target.value)}
                    className={`w-full rounded-2xl border-2 ${theme.colors.ui.input} p-4 pr-24 text-xs font-medium focus:outline-none transition-all resize-none`}
                    placeholder="Add a comment..."
                    rows={2}
                  />
                  <button
                    disabled={!newCommentText.trim()}
                    onClick={() => {
                      onAddComment(task, newCommentText)
                      setNewCommentText('')
                    }}
                    className={`absolute right-3 bottom-3 px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 text-[10px] font-black uppercase tracking-widest hover:bg-slate-200 dark:hover:bg-slate-700 disabled:bg-slate-100 dark:disabled:bg-slate-800 disabled:text-slate-300 dark:disabled:text-slate-600 transition-all`}
                  >
                    Post
                  </button>
                </div>
              </div>
            </div>
          </div>

          {task.activity && task.activity.length > 0 && (
            <div className={`mt-8 pt-6 border-t ${theme.colors.ui.border}`}>
              <button
                onClick={() => setShowHistory(!showHistory)}
                className="flex items-center justify-between w-full group"
              >
                <div className="flex items-center gap-2">
                  <div className="w-1.5 h-6 bg-amber-500 rounded-full" />
                  <p className={`text-[11px] font-black uppercase tracking-[0.2em] ${theme.colors.ui.text}`}>
                    Activity
                  </p>
                  <span className={`ml-2 px-2 py-0.5 rounded-full ${theme.colors.ui.background} text-[10px] font-black ${theme.colors.ui.textMuted}`}>
                    {task.activity.length}
                  </span>
                </div>
                <svg
                  className={`transition-transform duration-300 ${theme.colors.ui.textLight} group-hover:${theme.colors.ui.textMuted} ${
                    showHistory ? 'rotate-180' : ''
                  }`}
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
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

              {showHistory && (
                <div className={`mt-6 relative ml-0.5 space-y-6 before:absolute before:left-[7px] before:top-2 before:h-[calc(100%-16px)] before:w-0.5 before:${theme.colors.ui.border} animate-in fade-in slide-in-from-top-4 duration-300`}>
                  {task.activity
                    .slice()
                    .reverse()
                    .map((item) => (
                      <div key={item.id} className="relative pl-8">
                        <div className={`absolute left-0 top-1.5 h-[16px] w-[16px] rounded-full border-2 ${theme.colors.ui.surface} ${theme.colors.ui.borderStrong} ring-4 ${theme.colors.ui.surface}`} />
                        <div className="flex flex-col gap-1">
                          <p className={`text-[11px] font-bold ${theme.colors.ui.textMuted} leading-relaxed`}>
                            {item.note}
                          </p>
                          <p className={`text-[9px] font-black ${theme.colors.ui.textLight} uppercase tracking-widest`}>
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
              )}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
