import type { Project } from '../types'
import { projectStats } from '../constants'
import { theme } from '../theme'

interface ProjectOverviewViewProps {
  currentUserName: string | null
  currentUserId: string | null
  userProjects: Project[]
  darkMode: boolean
  onToggleDarkMode: () => void
  onLogout: () => void
  onGoToCreate: () => void
  onGoToProject: (id: string) => void
  onOpenDeleteModal: (project: Project) => void
}

export const ProjectOverviewView = ({
  currentUserName,
  currentUserId,
  userProjects,
  darkMode,
  onToggleDarkMode,
  onLogout,
  onGoToCreate,
  onGoToProject,
  onOpenDeleteModal,
}: ProjectOverviewViewProps) => {
  return (
    <div className={`min-h-screen ${theme.colors.ui.background} ${theme.colors.ui.text} pb-12 transition-colors duration-300`}>
      <div className="mx-auto max-w-6xl px-4 py-12 space-y-10">
        <header className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
          <div className="space-y-2">
            <p className="text-xs font-black uppercase tracking-[0.2em] text-amber-600">TaskPulse</p>
            <h1 className="text-4xl font-black tracking-tight">
              {currentUserName ? `${currentUserName}'s Projects` : 'Your Projects'}
            </h1>
            <p className={`text-sm font-medium ${theme.colors.ui.textMuted} max-w-md`}>
              All your group projects and their current status.
            </p>
          </div>
          <div className="flex gap-3 items-center">
            <button
              onClick={onToggleDarkMode}
              className={`p-3 rounded-2xl ${theme.colors.action.secondary.bg} ${theme.colors.action.secondary.text} ${theme.colors.action.secondary.hover} transition-all shadow-sm`}
              title={darkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            >
              {darkMode ? (
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="4"/><path d="M12 2v2"/><path d="M12 20v2"/><path d="m4.93 4.93 1.41 1.41"/><path d="m17.66 17.66 1.41 1.41"/><path d="M2 12h2"/><path d="M22 12h2"/><path d="m4.93 19.07 1.41-1.41"/><path d="m17.66 6.34 1.41-1.41"/></svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"/></svg>
              )}
            </button>
            {currentUserId && (
              <button
                type="button"
                onClick={onLogout}
                className="inline-flex items-center gap-2 rounded-2xl bg-rose-600 px-6 py-3 text-sm font-black text-white shadow-lg shadow-rose-200 dark:shadow-rose-900/20 transition-all hover:bg-rose-700 hover:-translate-y-0.5 active:translate-y-0"
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
                  <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                  <polyline points="16 17 21 12 16 7" />
                  <line x1="21" y1="12" x2="9" y2="12" />
                </svg>
                Logout
              </button>
            )}
            <button
              type="button"
              onClick={onGoToCreate}
              disabled={!currentUserId}
              className={`inline-flex items-center gap-2 rounded-2xl px-6 py-3 text-sm font-black text-white shadow-lg transition-all hover:-translate-y-0.5 active:translate-y-0 ${
                currentUserId
                  ? 'bg-amber-600 shadow-amber-200 hover:bg-amber-500'
                  : 'bg-slate-300 shadow-slate-200 cursor-not-allowed'
              }`}
              title={currentUserId ? 'Create a new project' : 'Login to create projects'}
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
                <path d="M5 12h14" />
                <path d="M12 5v14" />
              </svg>
              New Project
            </button>
          </div>
        </header>

        {currentUserId && userProjects.length === 0 ? (
          <section className={`rounded-[2.5rem] border-4 border-dashed ${theme.colors.ui.borderStrong} ${theme.colors.ui.surface} p-16 text-center`}>
            <div className={`mx-auto w-16 h-16 rounded-2xl ${theme.colors.ui.background} flex items-center justify-center ${theme.colors.ui.textLight} mb-4`}>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="32"
                height="32"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <rect width="18" height="18" x="3" y="3" rx="2" />
                <path d="M3 9h18" />
                <path d="M9 21V9" />
              </svg>
            </div>
            <h3 className={`text-xl font-bold ${theme.colors.ui.text}`}>No projects yet</h3>
            <p className={`${theme.colors.ui.textMuted} max-w-xs mx-auto text-sm font-medium`}>
              Create your first project to start tracking tasks and coordinating with your team.
            </p>
            <button
              onClick={onGoToCreate}
              className={`mt-8 rounded-xl ${theme.colors.action.primary.bg} px-8 py-3 text-sm font-black ${theme.colors.action.primary.text} ${theme.colors.action.primary.hover} transition-all`}
            >
              Get Started
            </button>
          </section>
        ) : currentUserId && userProjects.length > 0 ? (
          <section className="grid gap-6 md:grid-cols-2">
            {userProjects.map((project) => {
              const stats = projectStats(project)
              return (
                <div
                  key={project.id}
                  className={`group relative rounded-[2rem] border ${theme.colors.ui.borderStrong} ${theme.colors.ui.surface} p-6 shadow-sm transition-all hover:shadow-xl hover:shadow-slate-200/50 dark:hover:shadow-black/50 hover:-translate-y-1`}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="space-y-1 min-w-0">
                      <h2 className={`text-xl font-black ${theme.colors.ui.text} truncate tracking-tight`}>
                        {project.name}
                      </h2>
                      {project.course && (
                        <p className="text-sm font-bold text-amber-600 truncate">{project.course}</p>
                      )}
                      <p className={`text-xs font-bold ${theme.colors.ui.textLight} uppercase tracking-wider mt-1`}>
                        {project.tasks.length} tasks · {project.members.length} members
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => onGoToProject(project.id)}
                        className={`shrink-0 rounded-xl ${theme.colors.action.primary.bg} px-4 py-2 text-[11px] font-black ${theme.colors.action.primary.text} ${theme.colors.action.primary.hover} transition-colors`}
                      >
                        OPEN
                      </button>
                      <button
                        type="button"
                        onClick={() => onOpenDeleteModal(project)}
                        className={`shrink-0 rounded-xl ${theme.colors.action.danger.bg} px-3 py-2 text-[11px] font-black ${theme.colors.action.danger.text} ${theme.colors.action.danger.hover} transition-colors`}
                        title={project.ownerId === currentUserId ? "Delete Project" : "Leave Project"}
                      >
                        {project.ownerId === currentUserId ? (
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
                  </div>

                  <div className="mt-6 grid grid-cols-2 gap-3">
                    <div className={`rounded-2xl ${theme.colors.ui.background} p-3 border ${theme.colors.ui.border}`}>
                      <p className={`text-[10px] font-black uppercase tracking-wider ${theme.colors.ui.textLight}`}>
                        Progress
                      </p>
                      <div className="mt-1 flex items-baseline gap-1">
                        <p className={`text-lg font-black ${theme.colors.ui.text}`}>{stats.percentDone}%</p>
                        <p className={`text-[10px] font-bold ${theme.colors.ui.textLight}`}>DONE</p>
                      </div>
                      <div className={`mt-2 h-1.5 w-full rounded-full ${theme.colors.ui.borderStrong} overflow-hidden`}>
                        <div
                          className="h-full bg-emerald-500 transition-all duration-500"
                          style={{ width: `${stats.percentDone}%` }}
                        />
                      </div>
                    </div>

                    <div className="rounded-2xl bg-rose-50 dark:bg-rose-900/20 p-3 border border-rose-200 dark:border-rose-800/50">
                      <p className="text-[10px] font-black uppercase tracking-wider text-rose-600 dark:text-rose-400">
                        Due Soon
                      </p>
                      <p className="mt-1 text-lg font-black text-rose-900 dark:text-rose-100">{stats.dueSoon}</p>
                      <p className="text-[10px] font-bold text-rose-700/60 dark:text-rose-400/60">NEXT 48H</p>
                    </div>

                    <div className={`rounded-2xl bg-amber-50 dark:bg-amber-900/20 p-3 border border-amber-200 dark:border-amber-800/50`}>
                      <p className="text-[10px] font-black uppercase tracking-wider text-amber-600 dark:text-amber-400">
                        Unclaimed
                      </p>
                      <p className="mt-1 text-lg font-black text-amber-900 dark:text-amber-100">{stats.unclaimed}</p>
                      <p className="text-[10px] font-bold text-amber-700/60 dark:text-amber-400/60">NEEDS OWNER</p>
                    </div>

                    <div className="rounded-2xl bg-rose-900 dark:bg-rose-950 p-3">
                      <p className="text-[10px] font-black uppercase tracking-wider text-rose-300">
                        Overdue
                      </p>
                      <p className="mt-1 text-lg font-black text-white">{stats.overdue}</p>
                      <p className="text-[10px] font-bold text-rose-400">CRITICAL</p>
                    </div>
                  </div>
                </div>
              )
            })}
          </section>
        ) : !currentUserId ? (
          <section className={`rounded-[2.5rem] border-4 border-dashed ${theme.colors.ui.borderStrong} ${theme.colors.ui.surface} p-16 text-center`}>
            <div className={`mx-auto w-16 h-16 rounded-2xl ${theme.colors.ui.background} flex items-center justify-center ${theme.colors.ui.textLight} mb-4`}>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="32"
                height="32"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <rect width="18" height="18" x="3" y="3" rx="2" />
                <path d="M3 9h18" />
                <path d="M9 21V9" />
              </svg>
            </div>
            <h3 className={`text-xl font-bold ${theme.colors.ui.text}`}>Create your first project</h3>
            <p className={`${theme.colors.ui.textMuted} max-w-xs mx-auto text-sm font-medium`}>
              Log in to create and manage your projects.
            </p>
            <button
              onClick={onGoToCreate}
              className={`mt-8 rounded-xl ${theme.colors.action.primary.bg} px-8 py-3 text-sm font-black ${theme.colors.action.primary.text} ${theme.colors.action.primary.hover} transition-all`}
            >
              Login to Create Projects
            </button>
          </section>
        ) : null}
      </div>
    </div>
  )
}

