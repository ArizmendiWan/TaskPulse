import type React from 'react'
import type { Project } from '../types'

interface SidebarProps {
  showSidebar: boolean
  setShowSidebar: (show: boolean) => void
  activeProject: Project
  currentUserId: string | null
  currentUserName: string | null
  memberList: string[]
  getUserName: (userId: string | null) => string
  memberNameInput: string
  setMemberNameInput: (value: string) => void
  memberEmailInput: string
  setMemberEmailInput: (value: string) => void
  onJoinProject: (e: React.FormEvent) => void
  onRemoveMember: (memberId: string) => void
  onOpenDeleteModal: (project: Project) => void
  onGoToOverview: () => void
}

export const Sidebar = ({
  showSidebar,
  setShowSidebar,
  activeProject,
  currentUserId,
  currentUserName,
  memberList,
  getUserName,
  memberNameInput,
  setMemberNameInput,
  memberEmailInput,
  setMemberEmailInput,
  onJoinProject,
  onRemoveMember,
  onOpenDeleteModal,
  onGoToOverview,
}: SidebarProps) => {
  return (
    <aside
      className={`${
        showSidebar ? 'w-80' : 'w-16'
      } border-r border-slate-200 bg-white flex flex-col h-full shrink-0 z-20 shadow-xl shadow-slate-200/50 transition-all duration-300 ease-in-out relative`}
    >
      <button
        onClick={() => setShowSidebar(!showSidebar)}
        className="absolute -right-3 top-1/2 -translate-y-1/2 w-6 h-12 bg-white border border-slate-200 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-900 hover:border-slate-900 transition-all shadow-sm z-30 group"
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
          className={`p-6 border-b border-slate-100 flex flex-col transition-all duration-300 ${
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
                  className="p-1 rounded-md text-slate-300 hover:text-rose-500 transition-colors"
                  title="Delete Project"
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
                    <path d="M3 6h18" />
                    <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
                    <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
                  </svg>
                </button>
              </div>
              <div>
                <h3 className="text-xl font-black text-slate-900 tracking-tight leading-tight truncate">
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
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                    Tasks
                  </p>
                  <p className="text-lg font-black text-slate-900">{activeProject.tasks.length}</p>
                </div>
                <div className="h-8 w-px bg-slate-100" />
                <div className="text-center">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                    Team
                  </p>
                  <p className="text-lg font-black text-slate-900">{activeProject.members.length}</p>
                </div>
              </div>
            </>
          )}
        </div>

        {!showSidebar && (
          <div className="flex flex-col items-center py-6 gap-6 transition-all duration-300">
            <div className="w-10 h-10 rounded-xl bg-amber-600 flex items-center justify-center text-white font-black text-lg shadow-lg shadow-amber-200">
              {activeProject.name.charAt(0).toUpperCase()}
            </div>
            <div className="flex flex-col gap-4">
              <div className="w-8 h-8 rounded-lg bg-slate-100 flex flex-col items-center justify-center border border-slate-200">
                <p className="text-[8px] font-black text-slate-400 leading-none">
                  {activeProject.tasks.length}
                </p>
                <p className="text-[6px] font-bold text-slate-400 uppercase">TKS</p>
              </div>
              <div className="w-8 h-8 rounded-lg bg-slate-100 flex flex-col items-center justify-center border border-slate-200">
                <p className="text-[8px] font-black text-slate-400 leading-none">
                  {activeProject.members.length}
                </p>
                <p className="text-[6px] font-bold text-slate-400 uppercase">MEM</p>
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
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
                  Teammates
                </p>
                {memberList.length === 0 ? (
                  <p className="text-sm italic text-slate-400 font-medium px-1">
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
                              ? 'bg-amber-50 border-amber-200 shadow-sm'
                              : 'bg-slate-50 border-transparent hover:border-slate-100'
                          }`}
                        >
                          <div className="flex items-center gap-3 min-w-0">
                            <div
                              className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-black shrink-0 ${
                                isCurrentUser ? 'bg-amber-200 text-amber-700' : 'bg-slate-200 text-slate-500'
                              }`}
                            >
                              {memberName.charAt(0).toUpperCase()}
                            </div>
                            <div className="flex flex-col min-w-0">
                              <span className="text-sm font-bold text-slate-700 truncate">
                                {memberName} {isCurrentUser && '(You)'}
                              </span>
                              {isOwner && (
                                <span className="text-[9px] font-black text-amber-600 uppercase tracking-wider">
                                  Project Owner
                                </span>
                              )}
                            </div>
                          </div>
                          {canRemove && (
                            <button
                              onClick={() => onRemoveMember(memberId)}
                              className="p-1.5 rounded-lg text-slate-300 hover:text-rose-600 hover:bg-rose-50 transition-all opacity-0 group-hover/member:opacity-100"
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

              <div className="pt-4 border-t border-slate-100">
                {!currentUserId ? (
                  <div className="rounded-2xl border-2 border-amber-200 bg-amber-50 p-4 space-y-3">
                    <div className="space-y-1">
                      <h4 className="text-sm font-black text-amber-900 uppercase tracking-tight">
                        Join the Team
                      </h4>
                      <p className="text-[11px] font-bold text-amber-800/70">
                        Enter your name to start.
                      </p>
                    </div>
                    <form className="space-y-2" onSubmit={onJoinProject}>
                      <input
                        required
                        name="member-name"
                        value={memberNameInput}
                        onChange={(e) => setMemberNameInput(e.target.value)}
                        className="w-full rounded-xl border-2 border-amber-100 bg-white px-3 py-2 text-sm font-bold focus:border-amber-400 focus:outline-none focus:ring-4 focus:ring-amber-200/20"
                        placeholder="Your name"
                      />
                      <input
                        required
                        id="member-email"
                        type="email"
                        value={memberEmailInput}
                        onChange={(e) => setMemberEmailInput(e.target.value)}
                        className="w-full rounded-xl border-2 border-amber-100 bg-white px-3 py-2 text-sm font-bold focus:border-amber-400 focus:outline-none focus:ring-4 focus:ring-amber-200/20"
                        placeholder="Your email"
                      />
                      <button
                        type="submit"
                        className="w-full rounded-xl bg-amber-600 px-3 py-2 text-xs font-black text-white hover:bg-amber-500 shadow-lg shadow-amber-200/50 transition-all"
                      >
                        JOIN PROJECT
                      </button>
                    </form>
                  </div>
                ) : (
                  <div className="p-1">
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
                      My Profile
                    </p>
                    <div className="mt-3 flex items-center justify-between group">
                      <div className="flex items-center gap-2 min-w-0">
                        <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shrink-0" />
                        <span className="text-sm font-black text-slate-900 truncate">
                          {currentUserName}
                        </span>
                      </div>
                      <button
                        onClick={() => {
                          setMemberNameInput('')
                        }}
                        className="text-[10px] font-black text-slate-400 hover:text-rose-600 uppercase tracking-widest transition-colors opacity-0 group-hover:opacity-100 shrink-0 ml-2"
                      >
                        Reset
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </>
          )}
        </div>

        <div
          className={`p-6 bg-slate-50 border-t border-slate-100 transition-all duration-300 ${
            showSidebar ? 'opacity-100' : 'opacity-0 translate-y-4 pointer-events-none'
          }`}
        >
          {showSidebar && (
            <button
              onClick={onGoToOverview}
              className="w-full flex items-center justify-center gap-2 rounded-xl bg-white border-2 border-slate-200 p-3 text-xs font-black text-slate-600 hover:border-slate-900 hover:text-slate-900 transition-all"
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
              className="w-10 h-10 rounded-xl bg-slate-900 flex items-center justify-center text-white shadow-lg hover:bg-slate-800 transition-all"
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

