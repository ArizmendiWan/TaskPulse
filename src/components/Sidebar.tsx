import { useState } from 'react'
import type { Project } from '../types'
import { theme } from '../theme'

interface SidebarProps {
  showSidebar: boolean
  setShowSidebar: (show: boolean) => void
  activeProject: Project
  currentUserId: string | null
  currentUserName: string | null
  memberList: string[]
  getUserName: (userId: string | null) => string
  onRemoveMember: (memberId: string) => void
  onOpenDeleteModal: (project: Project) => void
  onGoToOverview: () => void
  onUpdateUserName: (newName: string) => Promise<void>
}

export const Sidebar = ({
  showSidebar,
  setShowSidebar,
  activeProject,
  currentUserId,
  currentUserName,
  memberList,
  getUserName,
  onRemoveMember,
  onOpenDeleteModal,
  onGoToOverview,
  onUpdateUserName,
}: SidebarProps) => {
  const [isEditingName, setIsEditingName] = useState(false)
  const [tempName, setTempName] = useState(currentUserName || '')

  const handleStartEditName = () => {
    setTempName(currentUserName || '')
    setIsEditingName(true)
  }

  const handleSaveName = async () => {
    if (tempName.trim() && tempName !== currentUserName) {
      await onUpdateUserName(tempName.trim())
    }
    setIsEditingName(false)
  }
  return (
    <aside
      className={`${
        showSidebar ? 'translate-x-0 w-80' : '-translate-x-full w-0 md:translate-x-0 md:w-16'
      } fixed md:relative border-r ${theme.colors.ui.border} ${theme.colors.ui.surface} flex flex-col h-full shrink-0 z-50 md:z-20 shadow-xl shadow-slate-200/50 dark:shadow-black/50 transition-all duration-300 ease-in-out`}
    >
      <button
        onClick={() => setShowSidebar(!showSidebar)}
        className={`absolute -right-3 top-1/2 -translate-y-1/2 w-6 h-12 ${theme.colors.ui.surface} border ${theme.colors.ui.borderStrong} rounded-full flex items-center justify-center ${theme.colors.ui.textLight} hover:${theme.colors.ui.text} hover:${theme.colors.ui.borderStrong} transition-all shadow-sm z-30 group hidden md:flex`}
      >
        <svg
          className={`transition-transform duration-300 ${showSidebar ? 'rotate-0' : 'rotate-180'}`}
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
          <path d="m15 18-6-6 6-6" />
        </svg>
      </button>

      <div className="flex flex-col h-full overflow-hidden">
        <div
          className={`p-6 border-b ${theme.colors.ui.border} flex flex-col transition-all duration-300 ${
            showSidebar ? 'opacity-100' : 'opacity-0 scale-90'
          }`}
        >
          {showSidebar && (
            <>
              <div className="flex items-center justify-between mb-4">
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-amber-600">
                  Project Info
                </p>
                <button
                  onClick={() => onOpenDeleteModal(activeProject)}
                  className={`p-1 rounded-md ${theme.colors.ui.textLight} hover:text-rose-500 transition-colors`}
                  title={activeProject.ownerId === currentUserId ? "Delete Project" : "Leave Project"}
                >
                  {activeProject.ownerId === currentUserId ? (
                  <svg
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
                    <path d="M3 6h18" />
                    <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
                    <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
                  </svg>
                  ) : (
                    <svg
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
                      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                      <polyline points="16 17 21 12 16 7" />
                      <line x1="21" y1="12" x2="9" y2="12" />
                    </svg>
                  )}
                </button>
              </div>
              <div>
                <h3 className={`text-xl font-black ${theme.colors.ui.text} tracking-tight leading-tight truncate`}>
                  {activeProject.name}
                </h3>
                {activeProject.course && (
                  <p className="mt-1 text-sm font-bold text-amber-600 truncate">
                    {activeProject.course}
                  </p>
                )}
              </div>
              <div className="flex items-center gap-4 pt-4">
                <div className="text-center">
                  <p className={`text-[10px] font-black ${theme.colors.ui.textLight} uppercase tracking-widest`}>
                    Tasks
                  </p>
                  <p className={`text-lg font-black ${theme.colors.ui.text}`}>{activeProject.tasks.length}</p>
                </div>
                <div className={`h-8 w-px ${theme.colors.ui.border}`} />
                <div className="text-center">
                  <p className={`text-[10px] font-black ${theme.colors.ui.textLight} uppercase tracking-widest`}>
                    Members
                  </p>
                  <p className={`text-lg font-black ${theme.colors.ui.text}`}>{activeProject.members.length}</p>
                </div>
              </div>
            </>
          )}
        </div>

        {!showSidebar && (
          <div className="flex flex-col items-center py-6 gap-6 transition-all duration-300">
            <div className="w-10 h-10 rounded-xl bg-amber-600 flex items-center justify-center text-white font-black text-lg shadow-lg shadow-amber-200 dark:shadow-amber-900/20">
              {activeProject.name.charAt(0).toUpperCase()}
            </div>
            <div className="flex flex-col gap-4">
              <div className={`w-8 h-8 rounded-lg ${theme.colors.ui.background} flex flex-col items-center justify-center border ${theme.colors.ui.borderStrong}`}>
                <p className={`text-[8px] font-black ${theme.colors.ui.textLight} leading-none`}>
                  {activeProject.tasks.length}
                </p>
                <p className={`text-[6px] font-bold ${theme.colors.ui.textLight} uppercase`}>TKS</p>
              </div>
              <div className={`w-8 h-8 rounded-lg ${theme.colors.ui.background} flex flex-col items-center justify-center border ${theme.colors.ui.borderStrong}`}>
                <p className={`text-[8px] font-black ${theme.colors.ui.textLight} leading-none`}>
                  {activeProject.members.length}
                </p>
                <p className={`text-[6px] font-bold ${theme.colors.ui.textLight} uppercase`}>MEM</p>
              </div>
            </div>
          </div>
        )}

        <div
          className={`flex-1 overflow-y-auto p-6 space-y-8 transition-all duration-300 ${
            showSidebar ? 'opacity-100' : 'opacity-0 scale-95 pointer-events-none'
          }`}
        >
          {showSidebar && (
            <>
              <div className="space-y-4">
                <p className={`text-[10px] font-black uppercase tracking-[0.2em] ${theme.colors.ui.textLight}`}>
                  Teammates
                </p>
                {memberList.length === 0 ? (
                  <p className={`text-sm italic ${theme.colors.ui.textLight} font-medium px-1`}>
                    No one has joined yet.
                  </p>
                ) : (
                  <div className="space-y-2">
                    {memberList.map((memberId) => {
                      const memberName = getUserName(memberId)
                      const isCurrentUser = memberId === currentUserId
                      const isOwner = activeProject.ownerId === memberId
                      const canRemove = activeProject.ownerId === currentUserId && !isCurrentUser

                      return (
                        <div
                          key={memberId}
                          className={`flex items-center justify-between gap-3 p-2 rounded-xl border-2 transition-all group/member ${
                            isCurrentUser
                              ? 'bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800/50 shadow-sm'
                              : `${theme.colors.ui.background} border-transparent hover:${theme.colors.ui.borderStrong}`
                          }`}
                        >
                          <div className="flex items-center gap-3 min-w-0">
                            <div
                              className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-black shrink-0 ${
                                isCurrentUser ? 'bg-amber-200 dark:bg-amber-800 text-amber-700 dark:text-amber-300' : `${theme.colors.ui.borderStrong} ${theme.colors.ui.textMuted}`
                              }`}
                            >
                              {memberName.charAt(0).toUpperCase()}
                            </div>
                            <div className="flex flex-col min-w-0">
                              <span className={`text-sm font-bold ${theme.colors.ui.text} truncate`}>
                                {memberName} {isCurrentUser && '(You)'}
                              </span>
                              {isOwner && (
                                <span className="text-[9px] font-black text-amber-600 dark:text-amber-400 uppercase tracking-wider">
                                  Project Owner
                                </span>
                              )}
                            </div>
                          </div>
                          {canRemove && (
                            <button
                              onClick={() => onRemoveMember(memberId)}
                              className={`p-1.5 rounded-lg ${theme.colors.ui.textLight} hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-900/20 transition-all opacity-0 group-hover/member:opacity-100`}
                              title="Remove from project"
                            >
                              <svg
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
                                <path d="M18 6 6 18" />
                                <path d="m6 6 12 12" />
                              </svg>
                            </button>
                          )}
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>

              <div className={`pt-4 border-t ${theme.colors.ui.border}`}>
                <div className="p-1">
                  <p className={`text-[10px] font-black uppercase tracking-[0.2em] ${theme.colors.ui.textLight}`}>
                    My Profile
                  </p>
                  <div className="mt-3 flex items-center justify-between group">
                    <div className="flex items-center gap-2 min-w-0 flex-1">
                      <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shrink-0" />
                      {isEditingName ? (
                        <input
                          autoFocus
                          value={tempName}
                          onChange={(e) => setTempName(e.target.value)}
                          onBlur={handleSaveName}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') handleSaveName()
                            if (e.key === 'Escape') setIsEditingName(false)
                          }}
                          className={`flex-1 bg-transparent border-b-2 border-amber-400 text-sm font-black ${theme.colors.ui.text} outline-none px-0.5`}
                        />
                      ) : (
                        <span className={`text-sm font-black ${theme.colors.ui.text} truncate`}>
                          {currentUserName}
                        </span>
                      )}
                    </div>
                    {!isEditingName && (
                      <button
                        onClick={handleStartEditName}
                        className={`text-[10px] font-black ${theme.colors.ui.textLight} hover:text-amber-600 uppercase tracking-widest transition-colors opacity-0 group-hover:opacity-100 shrink-0 ml-2`}
                        title="Change your display name"
                      >
                        Change Name
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </>
          )}
        </div>

        <div
          className={`p-6 ${theme.colors.ui.background} border-t ${theme.colors.ui.border} transition-all duration-300 ${
            showSidebar ? 'opacity-100' : 'opacity-0 translate-y-4 pointer-events-none'
          }`}
        >
          {showSidebar && (
            <button
              onClick={onGoToOverview}
              className={`w-full flex items-center justify-center gap-2 rounded-xl ${theme.colors.ui.surface} border-2 ${theme.colors.ui.borderStrong} p-3 text-xs font-black ${theme.colors.ui.textMuted} hover:${theme.colors.ui.text} hover:${theme.colors.ui.borderStrong} transition-all`}
            >
              <svg
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
                <path d="m15 18-6-6 6-6" />
              </svg>
              BACK TO PROJECTS
            </button>
          )}
        </div>

        {!showSidebar && (
          <div className="p-3 mb-4 mt-auto flex flex-col items-center">
            <button
              onClick={onGoToOverview}
              className={`w-10 h-10 rounded-xl ${theme.colors.action.primary.bg} flex items-center justify-center ${theme.colors.action.primary.text} shadow-lg ${theme.colors.action.primary.hover} transition-all`}
              title="Back to Overview"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="3"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="m15 18-6-6 6-6" />
              </svg>
            </button>
          </div>
        )}
      </div>
    </aside>
  )
}

