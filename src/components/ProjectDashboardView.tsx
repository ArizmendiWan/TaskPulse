import type { Project, Task, TaskStatus } from '../types'
import { type FilterKey, filterLabels, projectShareLink } from '../constants'
import { theme } from '../theme'
import { Sidebar } from './Sidebar'
import { TaskCard } from './TaskCard'
import { AiChatWidget } from './AiChatWidget'
import type React from 'react'

interface ProjectDashboardViewProps {
  activeProject: Project
  isLoadingProject: boolean
  currentUserId: string | null
  currentUserName: string | null
  memberList: string[]
  getUserName: (userId: string | null) => string
  memberNameInput: string
  setMemberNameInput: (value: string) => void
  memberEmailInput: string
  setMemberEmailInput: (value: string) => void
  filter: FilterKey
  setFilter: (filter: FilterKey) => void
  showDone: boolean
  setShowDone: (show: boolean) => void
  darkMode: boolean
  onToggleDarkMode: () => void
  tasksForView: Task[]
  expandedTasks: Record<string, boolean>
  setExpandedTasks: React.Dispatch<React.SetStateAction<Record<string, boolean>>>
  nudgeFeedback: Record<string, 'sending' | 'sent' | 'error' | null>
  showSidebar: boolean
  setShowSidebar: (show: boolean) => void
  onJoinProject: (e: React.FormEvent) => void
  onRemoveMember: (memberId: string) => void
  onOpenDeleteModal: (project: Project) => void
  onGoToOverview: () => void
  onCopyLink: (link: string) => void
  onShowTaskModal: () => void
  onStatusChange: (task: Task, next: TaskStatus) => void
  onOwnerChange: (task: Task, ownerId: string) => void
  onDueChange: (task: Task, next: string) => void
  onDescriptionChange: (task: Task, next: string) => void
  onAddComment: (task: Task, text: string) => void
  onUpdateComment: (task: Task, commentId: string, text: string) => void
  onDeleteComment: (task: Task, commentId: string) => void
  onDeleteTask: (task: Task) => void
  onNudge: (task: Task) => void
  onUpdateUserName: (newName: string) => Promise<void>
  onTogglePin: (task: Task) => void
  onOpenAI: () => void
}

export const ProjectDashboardView = ({
  activeProject,
  isLoadingProject,
  currentUserId,
  currentUserName,
  memberList,
  getUserName,
  memberNameInput,
  setMemberNameInput,
  memberEmailInput,
  setMemberEmailInput,
  filter,
  setFilter,
  showDone,
  setShowDone,
  darkMode,
  onToggleDarkMode,
  tasksForView,
  expandedTasks,
  setExpandedTasks,
  nudgeFeedback,
  showSidebar,
  setShowSidebar,
  onJoinProject,
  onRemoveMember,
  onOpenDeleteModal,
  onGoToOverview,
  onCopyLink,
  onShowTaskModal,
  onStatusChange,
  onOwnerChange,
  onDueChange,
  onDescriptionChange,
  onAddComment,
  onUpdateComment,
  onDeleteComment,
  onDeleteTask,
  onNudge,
  onUpdateUserName,
  onTogglePin,
}: ProjectDashboardViewProps) => {
  return (
    <div className={`flex h-screen ${theme.colors.ui.background} ${theme.colors.ui.text} overflow-hidden font-sans transition-colors duration-300`}>
      <Sidebar
        showSidebar={showSidebar}
        setShowSidebar={setShowSidebar}
        activeProject={activeProject}
        currentUserId={currentUserId}
        currentUserName={currentUserName}
        memberList={memberList}
        getUserName={getUserName}
        memberNameInput={memberNameInput}
        setMemberNameInput={setMemberNameInput}
        memberEmailInput={memberEmailInput}
        setMemberEmailInput={setMemberEmailInput}
        onJoinProject={onJoinProject}
        onRemoveMember={onRemoveMember}
        onOpenDeleteModal={onOpenDeleteModal}
        onGoToOverview={onGoToOverview}
        onUpdateUserName={onUpdateUserName}
      />

      <main className="flex-1 flex flex-col min-w-0 h-full overflow-hidden relative">
        <header className={`h-20 border-b ${theme.colors.ui.border} ${theme.colors.ui.surface} flex items-center justify-between px-4 md:px-12 shrink-0 z-10 shadow-sm transition-colors duration-300`}>
          <div className="flex items-center gap-4 md:gap-8 min-w-0">
            <div className="min-w-0">
              <p className="hidden md:block text-[10px] font-black uppercase tracking-[0.2em] text-amber-600 mb-0.5">
                Project
              </p>
              <h1 className={`text-lg md:text-xl font-black ${theme.colors.ui.text} tracking-tight truncate max-w-[120px] sm:max-w-[200px] lg:max-w-md`}>
                {activeProject.name}
              </h1>
            </div>

            <div className={`h-10 w-px ${theme.colors.ui.border} hidden sm:block`} />

            <div className="flex flex-col gap-1 min-w-0">
              <p className={`hidden md:block text-[10px] font-black uppercase tracking-[0.2em] ${theme.colors.ui.textLight}`}>
                Invite Link
              </p>
              <div className="flex items-center gap-1 sm:gap-2">
                <p className={`hidden sm:block text-xs font-bold ${theme.colors.ui.textMuted} truncate max-w-[100px] lg:max-w-[300px]`}>
                  {projectShareLink(activeProject.id)}
                </p>
                <button
                  type="button"
                  onClick={() => onCopyLink(projectShareLink(activeProject.id))}
                  className={`p-2 rounded-xl ${theme.colors.ui.background} border-2 border-transparent hover:${theme.colors.ui.borderStrong} ${theme.colors.ui.textLight} hover:${theme.colors.ui.text} transition-all flex items-center gap-2`}
                  title="Copy Link"
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
                    <rect width="14" height="14" x="8" y="8" rx="2" ry="2" />
                    <path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2" />
                  </svg>
                  <span className="hidden lg:block text-[10px] font-black uppercase tracking-widest">
                    Copy Link
                  </span>
                </button>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={onToggleDarkMode}
              className={`p-3 rounded-xl ${theme.colors.action.secondary.bg} ${theme.colors.action.secondary.text} ${theme.colors.action.secondary.hover} transition-all shadow-sm`}
              title={darkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            >
              {darkMode ? (
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="4"/><path d="M12 2v2"/><path d="M12 20v2"/><path d="m4.93 4.93 1.41 1.41"/><path d="m17.66 17.66 1.41 1.41"/><path d="M2 12h2"/><path d="M22 12h2"/><path d="m4.93 19.07 1.41-1.41"/><path d="m17.66 6.34 1.41-1.41"/></svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"/></svg>
              )}
            </button>
            <button
              type="button"
              onClick={onShowTaskModal}
              className="rounded-xl bg-emerald-600 px-5 md:px-8 py-3 md:py-3.5 text-xs md:text-sm font-black text-white hover:bg-emerald-500 shadow-xl shadow-emerald-100 dark:shadow-emerald-900/20 transition-all hover:-translate-y-0.5 active:translate-y-0 shrink-0"
            >
              <span className="hidden sm:inline">ADD TASK</span>
              <span className="sm:hidden">+ TASK</span>
            </button>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto px-4 pt-6 pb-12 md:px-12">
          <div className="max-w-4xl mx-auto space-y-6">
            {isLoadingProject ? (
              <div className="flex flex-col items-center justify-center py-20 animate-pulse">
                <div className="w-12 h-12 rounded-2xl bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center mb-4">
                  <div className="w-6 h-6 border-4 border-amber-600 border-t-transparent rounded-full animate-spin" />
                </div>
                <p className="text-sm font-black text-amber-600 uppercase tracking-widest">
                  Loading project...
                </p>
              </div>
            ) : (
              <div className="space-y-6 pb-20">
                <div
                  className="flex flex-wrap items-center justify-between gap-4"
                >
                  <div
                    className="flex flex-wrap items-center gap-2"
                    role="group"
                    aria-label="task filters"
                  >
                    {(Object.keys(filterLabels) as FilterKey[]).map((key) => (
                      <button
                        key={key}
                        type="button"
                        onClick={() => setFilter(key)}
                        className={`rounded-xl px-5 py-2.5 text-xs font-black transition-all ${
                          filter === key
                            ? `${theme.colors.action.primary.bg} ${theme.colors.action.primary.text} shadow-xl shadow-slate-200 dark:shadow-black/50`
                            : `${theme.colors.ui.surface} ${theme.colors.ui.textMuted} hover:${theme.colors.ui.background} border-2 ${theme.colors.ui.border}`
                        }`}
                      >
                        {filterLabels[key].toUpperCase()}
                      </button>
                    ))}
                  </div>

                  <button
                    onClick={() => setShowDone(!showDone)}
                    className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border-2 transition-all text-xs font-black uppercase tracking-widest ${
                      !showDone
                        ? `${theme.colors.status.done.bg} ${theme.colors.status.done.border} ${theme.colors.status.done.text}`
                        : `${theme.colors.ui.surface} ${theme.colors.ui.border} ${theme.colors.ui.textMuted} hover:${theme.colors.ui.borderStrong}`
                    }`}
                  >
                    <div className={`w-4 h-4 rounded-md border-2 flex items-center justify-center transition-all ${
                      !showDone ? theme.colors.action.checkbox.checked : theme.colors.action.checkbox.unchecked
                    }`}>
                      {!showDone && (
                        <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" className="text-white">
                          <polyline points="20 6 9 17 4 12" />
                        </svg>
                      )}
                    </div>
                    Hide Done
                  </button>
                </div>

                <div className="space-y-3">
                  {tasksForView.length === 0 ? (
                    <div className={`py-20 text-center rounded-[3rem] border-4 border-dashed ${theme.colors.ui.border}`}>
                      <p className={`text-sm font-black ${theme.colors.ui.textLight} uppercase tracking-[0.2em]`}>
                        No tasks found
                      </p>
                      <p className={`mt-1 text-xs font-bold ${theme.colors.ui.textMuted}`}>
                        Try adjusting your filters or add a task.
                      </p>
                    </div>
                  ) : (
                    tasksForView.map((task) => (
                      <TaskCard
                        key={task.id}
                        task={task}
                        expanded={expandedTasks[task.id]}
                        onToggleExpand={(id) =>
                          setExpandedTasks((prev) => ({ ...prev, [id]: !prev[id] }))
                        }
                        onStatusChange={onStatusChange}
                        onOwnerChange={onOwnerChange}
                        onDueChange={onDueChange}
                        onDescriptionChange={onDescriptionChange}
                        onAddComment={onAddComment}
                        onUpdateComment={onUpdateComment}
                        onDeleteComment={onDeleteComment}
                        onDeleteTask={onDeleteTask}
                        onNudge={onNudge}
                        onTogglePin={onTogglePin}
                        getUserName={getUserName}
                        nudgeFeedback={nudgeFeedback}
                        projectMembers={activeProject.members}
                        currentUserId={currentUserId}
                      />
                    ))
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        <AiChatWidget
          projectName={activeProject.name}
          contextHint={`You are helping manage a student team project in TaskPulse.
Keep answers short and actionable. If asked about tasks, suggest next steps and priorities.
The current project is called "${activeProject.name}".`}
        />
      </main>
    </div>
  )
}

