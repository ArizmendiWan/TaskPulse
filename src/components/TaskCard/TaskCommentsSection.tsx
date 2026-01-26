import { useState } from 'react'
import { theme } from '../../theme'
import type { TaskCommentsProps } from './types'

export const TaskCommentsSection = ({
  task,
  onAddComment,
  onUpdateComment,
  onDeleteComment,
  getUserName,
  currentUserId,
}: TaskCommentsProps) => {
  const [newCommentText, setNewCommentText] = useState('')
  const [editingCommentId, setEditingCommentId] = useState<string | null>(null)
  const [editingCommentText, setEditingCommentText] = useState('')

  return (
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
              className="absolute right-3 bottom-3 px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 text-[10px] font-black uppercase tracking-widest hover:bg-slate-200 dark:hover:bg-slate-700 disabled:bg-slate-100 dark:disabled:bg-slate-800 disabled:text-slate-300 dark:disabled:text-slate-600 transition-all"
            >
              Post
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

