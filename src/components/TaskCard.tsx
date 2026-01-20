import { useState } from 'react'
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
  onAddComment: (task: Task, text: string) => void
  onUpdateComment: (task: Task, commentId: string, text: string) => void
  onDeleteComment: (task: Task, commentId: string) => void
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
  onAddComment,
  onUpdateComment,
  onDeleteComment,
  onDeleteTask,
  onNudge,
  getUserName,
  nudgeFeedback,
  projectMembers,
  currentUserId,
}: TaskCardProps) => {
  const [isEditing, setIsEditing] = useState(false)
  const [showHistory, setShowHistory] = useState(false)
  const [draft, setDraft] = useState<Task | null>(null)
  const [newCommentText, setNewCommentText] = useState('')
  const [editingCommentId, setEditingCommentId] = useState<string | null>(null)
  const [editingCommentText, setEditingCommentText] = useState('')

  const handleStartEdit = () => {
    setDraft({ ...task })
    setIsEditing(true)
  }

  const handleDoneEdit = () => {
    if (!draft) return

    // Compare and commit changes
    if (draft.status !== task.status) {
      onStatusChange(task, draft.status)
    }
    if (draft.dueAt !== task.dueAt) {
      onDueChange(task, draft.dueAt)
    }
    if (draft.description !== task.description) {
      onDescriptionChange(task, draft.description)
    }
    // Owners are a bit more complex since onOwnerChange handles toggling
    // We'll compare the arrays and call onOwnerChange for each difference
    const added = draft.owners.filter((o) => !task.owners.includes(o))
    const removed = task.owners.filter((o) => !draft.owners.includes(o))
    
    added.forEach((o) => onOwnerChange(task, o))
    removed.forEach((o) => onOwnerChange(task, o))

    setIsEditing(false)
    setDraft(null)
  }

  const derived = draft ? deriveStatus(draft) : deriveStatus(task)
  const isRisk = isAtRisk(draft || task)
  const overdue = isOverdue(draft || task)
  const dueSoon = isDueSoon(draft || task)

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
          <div className="space-y-1 min-w-0 flex-1">
            <h4 className="text-base font-bold text-slate-900 break-words line-clamp-2 group-hover:line-clamp-none transition-all">
              {task.title}
            </h4>
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
              <p className="text-[11px] font-medium text-slate-400">Due {formatDue(draft?.dueAt || task.dueAt)}</p>
              <p className="text-[11px] font-bold text-slate-600 truncate max-w-[180px]">
                {(draft?.owners || task.owners).map((id) => getUserName(id)).join(', ') ||
                  'Unassigned'}
              </p>
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
            <div className="flex items-center gap-2">
              {isRisk && (
                <button
                  type="button"
                  disabled={(draft?.owners || task.owners).length === 0 || nudgeFeedback[task.id] === 'sending'}
                  onClick={(e) => {
                    e.stopPropagation()
                    onNudge(task)
                  }}
                  className={`rounded-lg px-3 py-1.5 text-[10px] font-black transition-all flex items-center gap-1.5 ${
                    (draft?.owners || task.owners).length === 0
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
          <div className="flex justify-end gap-2 pt-2">
            <button
              onClick={isEditing ? handleDoneEdit : handleStartEdit}
              className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-[10px] font-black uppercase tracking-widest transition-all ${
                isEditing
                  ? 'bg-slate-900 text-white hover:bg-slate-800'
                  : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
              }`}
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
                {isEditing ? (
                  <path d="M20 6 9 17l-5-5" />
                ) : (
                  <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" />
                )}
              </svg>
              {isEditing ? 'Done Editing' : 'Edit Task'}
            </button>
            {isEditing && (
              <button
                type="button"
                onClick={() => onDeleteTask(task)}
                className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-[10px] font-black uppercase tracking-widest bg-rose-50 text-rose-600 hover:bg-rose-100 transition-all"
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
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4">
            <div className="space-y-2">
              <p className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1">
                Owners
              </p>
              <div
                className={`flex flex-wrap gap-1.5 min-h-[40px] p-2 rounded-xl border-2 transition-all ${
                  isEditing ? 'border-slate-100 bg-slate-50' : 'border-transparent bg-white'
                }`}
              >
                {(draft?.owners || task.owners).length === 0 ? (
                  <span className="text-[11px] font-bold text-slate-400 px-1 py-1">
                    Unassigned
                  </span>
                ) : (
                  (draft?.owners || task.owners).map((ownerId) => (
                    <span
                      key={ownerId}
                      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-black shadow-sm transition-all ${
                        isEditing
                          ? 'bg-white border border-slate-200 text-slate-700'
                          : 'bg-slate-50 border border-transparent text-slate-600'
                      }`}
                    >
                      {getUserName(ownerId)}
                      {isEditing && (
                        <button
                          onClick={() => {
                            if (draft) {
                              setDraft({
                                ...draft,
                                owners: draft.owners.filter((o) => o !== ownerId)
                              })
                            }
                          }}
                          className="text-slate-300 hover:text-rose-500 transition-colors"
                        >
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
                            <path d="M18 6 6 18" />
                            <path d="m6 6 12 12" />
                          </svg>
                        </button>
                      )}
                    </span>
                  ))
                )}
                {isEditing && (
                  <select
                    value=""
                    onChange={(e) => {
                      if (draft && e.target.value) {
                        setDraft({
                          ...draft,
                          owners: [...draft.owners, e.target.value]
                        })
                      }
                    }}
                    className="bg-transparent border-none text-[11px] font-black text-slate-400 focus:outline-none cursor-pointer w-16"
                  >
                    <option value="">+ Add</option>
                    {[
                      ...new Set(
                        [...projectMembers, ...(currentUserId ? [currentUserId] : [])].filter(
                          Boolean,
                        ),
                      ),
                    ]
                      .filter((m) => !(draft?.owners || task.owners).includes(m))
                      .map((memberId) => (
                        <option key={memberId} value={memberId}>
                          {getUserName(memberId)}
                        </option>
                      ))}
                  </select>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <p className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1">
                Status
              </p>
              {isEditing ? (
                <select
                  aria-label="Status"
                  value={draft?.status || task.status}
                  onChange={(e) => {
                    if (draft) {
                      setDraft({ ...draft, status: e.target.value as TaskStatus })
                    }
                  }}
                  className="w-full rounded-xl border-2 border-slate-100 bg-slate-50 px-3 py-2.5 text-[11px] font-black text-slate-700 focus:border-amber-400 focus:bg-white focus:outline-none transition-all"
                >
                  <option value="unassigned">Unassigned</option>
                  <option value="not_started">Not Started</option>
                  <option value="in_progress">In Progress</option>
                  <option value="done">Done</option>
                </select>
              ) : (
                <div className="px-3 py-2.5 rounded-xl bg-white border-2 border-transparent text-[11px] font-black text-slate-700">
                  {statusLabels[derived]}
                </div>
              )}
            </div>

            <div className="space-y-2">
              <p className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1">
                Due Date
              </p>
              {isEditing ? (
                <input
                  type="datetime-local"
                  value={draft?.dueAt || task.dueAt}
                  onChange={(e) => {
                    if (draft) {
                      setDraft({ ...draft, dueAt: e.target.value })
                    }
                  }}
                  className="w-full rounded-xl border-2 border-slate-100 bg-slate-50 px-3 py-2.5 text-[11px] font-black text-slate-700 focus:border-amber-400 focus:bg-white focus:outline-none transition-all"
                />
              ) : (
                <div className="px-3 py-2.5 rounded-xl bg-white border-2 border-transparent text-[11px] font-black text-slate-700">
                  {new Date(task.dueAt).toLocaleDateString(undefined, {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric',
                    hour: 'numeric',
                    minute: '2-digit',
                  })}
                </div>
              )}
            </div>
          </div>

          <div className="mt-6 space-y-3">
            <div className="flex items-center gap-2">
              <div className="w-1.5 h-6 bg-slate-400 rounded-full" />
              <p className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-400">
                Task Description
              </p>
            </div>
            {isEditing ? (
              <textarea
                value={draft?.description || ''}
                onChange={(e) => {
                  if (draft) {
                    setDraft({ ...draft, description: e.target.value })
                  }
                }}
                className="w-full rounded-2xl border-2 border-slate-100 bg-slate-50 p-4 text-xs font-bold text-slate-700 focus:border-amber-400 focus:bg-white focus:outline-none transition-all resize-none"
                placeholder="Add the main task description here..."
                rows={3}
              />
            ) : (
              <div className="w-full rounded-2xl bg-white p-4 text-xs font-medium text-slate-600 leading-relaxed border border-slate-50">
                {task.description || (
                  <span className="text-slate-300 italic">No description provided.</span>
                )}
              </div>
            )}
          </div>

          <div className="mt-8 space-y-6 pt-6 border-t border-slate-50">
            <div className="flex items-center gap-2">
              <div className="w-1.5 h-6 bg-slate-900 rounded-full" />
              <p className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-900">
                Comments
              </p>
              <span className="ml-2 px-2 py-0.5 rounded-full bg-slate-100 text-[10px] font-black text-slate-500">
                {task.comments?.length || 0}
              </span>
            </div>

            <div className="space-y-4">
              {task.comments && task.comments.length > 0 ? (
                task.comments.map((comment) => (
                  <div key={comment.id} className="group/comment space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-black text-slate-900 uppercase tracking-wider">
                          {getUserName(comment.authorId)}
                        </span>
                        <span className="text-[9px] font-bold text-slate-400">
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
                            className="text-[10px] font-black text-slate-400 hover:text-amber-600 uppercase tracking-widest"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => onDeleteComment(task, comment.id)}
                            className="text-[10px] font-black text-slate-400 hover:text-rose-600 uppercase tracking-widest"
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
                          className="w-full rounded-xl border-2 border-amber-100 bg-white p-3 text-xs font-medium text-slate-700 focus:border-amber-400 focus:outline-none transition-all resize-none"
                          rows={2}
                        />
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={() => setEditingCommentId(null)}
                            className="px-3 py-1.5 text-[10px] font-black text-slate-400 hover:text-slate-600 uppercase tracking-widest"
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
                      <div className="rounded-2xl bg-slate-50 p-4 text-xs font-medium text-slate-600 leading-relaxed border border-transparent hover:border-slate-100 transition-all">
                        {comment.text}
                      </div>
                    )}
                  </div>
                ))
              ) : (
                <div className="py-8 text-center rounded-2xl border-2 border-dashed border-slate-100">
                  <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest">
                    No comments yet
                  </p>
                </div>
              )}

              <div className="pt-2">
                <div className="relative">
                  <textarea
                    value={newCommentText}
                    onChange={(e) => setNewCommentText(e.target.value)}
                    className="w-full rounded-2xl border-2 border-slate-50 bg-slate-50 p-4 pr-24 text-xs font-medium text-slate-700 focus:border-amber-400 focus:bg-white focus:outline-none transition-all resize-none"
                    placeholder="Add a comment..."
                    rows={2}
                  />
                  <button
                    disabled={!newCommentText.trim()}
                    onClick={() => {
                      onAddComment(task, newCommentText)
                      setNewCommentText('')
                    }}
                    className="absolute right-3 bottom-3 px-4 py-2 rounded-xl bg-slate-900 text-white text-[10px] font-black uppercase tracking-widest hover:bg-slate-800 disabled:bg-slate-200 disabled:text-slate-400 transition-all"
                  >
                    Post
                  </button>
                </div>
              </div>
            </div>
          </div>

          {task.activity && task.activity.length > 0 && (
            <div className="mt-8 pt-6 border-t border-slate-50">
              <button
                onClick={() => setShowHistory(!showHistory)}
                className="flex items-center justify-between w-full group"
              >
                <div className="flex items-center gap-2">
                  <div className="w-1.5 h-6 bg-amber-500 rounded-full" />
                  <p className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-900">
                    Activity History
                  </p>
                  <span className="ml-2 px-2 py-0.5 rounded-full bg-slate-100 text-[10px] font-black text-slate-500">
                    {task.activity.length}
                  </span>
                </div>
                <svg
                  className={`transition-transform duration-300 text-slate-300 group-hover:text-slate-500 ${
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
                <div className="mt-6 relative ml-0.5 space-y-6 before:absolute before:left-[7px] before:top-2 before:h-[calc(100%-16px)] before:w-0.5 before:bg-slate-100 animate-in fade-in slide-in-from-top-4 duration-300">
                  {task.activity
                    .slice()
                    .reverse()
                    .map((item) => (
                      <div key={item.id} className="relative pl-8">
                        <div className="absolute left-0 top-1.5 h-[16px] w-[16px] rounded-full border-2 border-white bg-slate-200 ring-4 ring-white" />
                        <div className="flex flex-col gap-1">
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
              )}
            </div>
          )}
        </div>
      )}
    </div>
  )
}


