import type { Project, Task, TaskStatus } from '../types'
import { type FilterKey, filterLabels, projectShareLink } from '../constants'
import { Sidebar } from './Sidebar'
import { TaskCard } from './TaskCard'
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
  onDeleteTask: (task: Task) => void
  onNudge: (task: Task) => void
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
  onDeleteTask,
  onNudge,
}: ProjectDashboardViewProps) => {
  return (
    <div className="flex h-screen bg-slate-50 text-slate-900 overflow-hidden font-sans">
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
      />

      <main className="flex-1 flex flex-col min-w-0 h-full overflow-hidden relative">
        <header className="h-20 border-b border-slate-200 bg-white flex items-center justify-between px-4 md:px-12 shrink-0 z-10 shadow-sm">
          <div className="flex items-center gap-4 md:gap-8 min-w-0">
            <div className="min-w-0">
              <p className="hidden md:block text-[10px] font-black uppercase tracking-[0.2em] text-amber-600 mb-0.5">
                Project
              </p>
              <h1 className="text-lg md:text-xl font-black text-slate-900 tracking-tight truncate max-w-[120px] sm:max-w-[200px] lg:max-w-md">
                {activeProject.name}
              </h1>
            </div>

            <div className="h-10 w-px bg-slate-100 hidden sm:block" />

            <div className="flex flex-col gap-1 min-w-0">
              <p className="hidden md:block text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
                Invite Link
              </p>
              <div className="flex items-center gap-1 sm:gap-2">
                <p className="hidden sm:block text-xs font-bold text-slate-600 truncate max-w-[100px] lg:max-w-[300px]">
                  {projectShareLink(activeProject.id)}
                </p>
                <button
                  type="button"
                  onClick={() => onCopyLink(projectShareLink(activeProject.id))}
                  className="p-2 rounded-xl bg-slate-50 border-2 border-transparent hover:border-slate-200 text-slate-400 hover:text-slate-900 transition-all flex items-center gap-2"
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
              type="button"
              onClick={onShowTaskModal}
              className="rounded-xl bg-emerald-600 px-5 md:px-8 py-3 md:py-3.5 text-xs md:text-sm font-black text-white hover:bg-emerald-500 shadow-xl shadow-emerald-100 transition-all hover:-translate-y-0.5 active:translate-y-0 shrink-0"
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
                <div className="w-12 h-12 rounded-2xl bg-amber-100 flex items-center justify-center mb-4">
                  <div className="w-6 h-6 border-4 border-amber-600 border-t-transparent rounded-full animate-spin" />
                </div>
                <p className="text-sm font-black text-amber-600 uppercase tracking-widest">
                  Loading project...
                </p>
              </div>
            ) : (
              <div className="space-y-6 pb-20">
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
                          ? 'bg-slate-900 text-white shadow-xl shadow-slate-200'
                          : 'bg-white text-slate-500 hover:bg-slate-100 border-2 border-slate-100'
                      }`}
                    >
                      {filterLabels[key].toUpperCase()}
                    </button>
                  ))}
                </div>

                <div className="space-y-3">
                  {tasksForView.length === 0 ? (
                    <div className="py-20 text-center rounded-[3rem] border-4 border-dashed border-slate-100">
                      <p className="text-sm font-black text-slate-300 uppercase tracking-[0.2em]">
                        No tasks found
                      </p>
                      <p className="mt-1 text-xs font-bold text-slate-400">
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
                        onDeleteTask={onDeleteTask}
                        onNudge={onNudge}
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
      </main>
    </div>
  )
}

