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
    <div className={`mt-4 pt-3 border-t ${theme.colors.ui.border}`}>
      <div className="flex items-center gap-2 mb-2">
        <p className={`text-[9px] font-black uppercase tracking-wider ${theme.colors.ui.textLight}`}>
          Comments
        </p>
        <span className={`px-1.5 py-0.5 rounded-full ${theme.colors.ui.background} text-[9px] font-black ${theme.colors.ui.textMuted}`}>
          {task.comments?.length || 0}
        </span>
      </div>

      <div className="space-y-2">
        {task.comments && task.comments.length > 0 ? (
          task.comments.map((comment) => (
            <div key={comment.id} className="group/comment">
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-2">
                  <span className={`text-[10px] font-black ${theme.colors.ui.text}`}>
                    {getUserName(comment.authorId)}
                  </span>
                  <span className={`text-[9px] ${theme.colors.ui.textLight}`}>
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
                      className={`text-[9px] font-bold ${theme.colors.ui.textLight} hover:text-amber-600`}
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => onDeleteComment(task, comment.id)}
                      className={`text-[9px] font-bold ${theme.colors.ui.textLight} hover:text-rose-600`}
                    >
                      Delete
                    </button>
                  </div>
                )}
              </div>
              {editingCommentId === comment.id ? (
                <div className="space-y-1.5">
                  <textarea
                    value={editingCommentText}
                    onChange={(e) => setEditingCommentText(e.target.value)}
                    className={`w-full rounded-lg border ${theme.colors.ui.input} p-2 text-xs focus:outline-none resize-none`}
                    rows={2}
                  />
                  <div className="flex justify-end gap-2">
                    <button
                      onClick={() => setEditingCommentId(null)}
                      className={`px-2 py-1 text-[9px] font-bold ${theme.colors.ui.textLight}`}
                    >
                      Cancel
                    </button>
                    <button
                      onClick={() => {
                        onUpdateComment(task, comment.id, editingCommentText)
                        setEditingCommentId(null)
                      }}
                      className="px-2 py-1 rounded-lg bg-amber-500 text-white text-[9px] font-bold hover:bg-amber-600 transition-all"
                    >
                      Save
                    </button>
                  </div>
                </div>
              ) : (
                <p className={`text-xs ${theme.colors.ui.textMuted} leading-relaxed pl-0.5`}>
                  {comment.text}
                </p>
              )}
            </div>
          ))
        ) : (
          <p className={`text-[10px] ${theme.colors.ui.textLight} italic py-2`}>
            No comments yet
          </p>
        )}

        {/* Add comment */}
        <div className="flex gap-2 pt-1">
          <input
            type="text"
            value={newCommentText}
            onChange={(e) => setNewCommentText(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && newCommentText.trim()) {
                onAddComment(task, newCommentText)
                setNewCommentText('')
              }
            }}
            className={`flex-1 rounded-lg border ${theme.colors.ui.input} px-3 py-1.5 text-xs focus:outline-none`}
            placeholder="Add a comment..."
          />
          <button
            disabled={!newCommentText.trim()}
            onClick={() => {
              onAddComment(task, newCommentText)
              setNewCommentText('')
            }}
            className="px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-[10px] font-bold hover:bg-slate-200 dark:hover:bg-slate-700 disabled:opacity-50 transition-all"
          >
            Post
          </button>
        </div>
      </div>
    </div>
  )
}
