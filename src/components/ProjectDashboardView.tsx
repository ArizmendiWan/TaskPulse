import React from 'react'
import { QRCodeSVG } from 'qrcode.react'
import type { Project, Task, TaskStatus } from '../types'
import { type FilterKey, filterLabels, projectShareLink } from '../constants'
import { theme } from '../theme'
import { Sidebar } from './Sidebar'
import { TaskCard } from './TaskCard'
import { AiChatWidget } from '../features/ai/AiChatWidget'
import { generateAiContextHint } from '../features/ai/utils'

interface ProjectDashboardViewProps {
  activeProject: Project
  isLoadingProject: boolean
  currentUserId: string | null
  currentUserName: string | null
  memberList: string[]
  getUserName: (userId: string | null) => string
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
  onRemoveMember: (memberId: string) => void
  onOpenDeleteModal: (project: Project) => void
  onGoToOverview: () => void
  onCopyLink: (link: string) => void
  onShowTaskModal: () => void
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
  onRemoveMember,
  onOpenDeleteModal,
  onGoToOverview,
  onCopyLink,
  onShowTaskModal,
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
  onUpdateUserName,
  onTogglePin,
}: ProjectDashboardViewProps) => {
  const [copyFeedback, setCopyFeedback] = React.useState(false)
  const [showQR, setShowQR] = React.useState(false)
  const [qrCopyFeedback, setQrCopyFeedback] = React.useState(false)
  const qrRef = React.useRef<HTMLDivElement>(null)

  const handleCopy = () => {
    onCopyLink(projectShareLink(activeProject.id))
    setCopyFeedback(true)
    setTimeout(() => setCopyFeedback(false), 2000)
  }

  const shareLink = projectShareLink(activeProject.id)

  const handleSaveQR = async () => {
    const svg = qrRef.current?.querySelector('svg')
    if (!svg) return

    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const svgData = new XMLSerializer().serializeToString(svg)
    const img = new Image()
    const svgBlob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' })
    const url = URL.createObjectURL(svgBlob)

    img.onload = () => {
      canvas.width = 200
      canvas.height = 200
      ctx.fillStyle = 'white'
      ctx.fillRect(0, 0, 200, 200)
      ctx.drawImage(img, 20, 20, 160, 160)
      URL.revokeObjectURL(url)

      const link = document.createElement('a')
      link.download = `${activeProject.name.replace(/\s+/g, '-')}-invite-qr.png`
      link.href = canvas.toDataURL('image/png')
      link.click()
    }
    img.src = url
  }

  const handleCopyQR = async () => {
    const svg = qrRef.current?.querySelector('svg')
    if (!svg) return

    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const svgData = new XMLSerializer().serializeToString(svg)
    const img = new Image()
    const svgBlob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' })
    const url = URL.createObjectURL(svgBlob)

    img.onload = async () => {
      canvas.width = 200
      canvas.height = 200
      ctx.fillStyle = 'white'
      ctx.fillRect(0, 0, 200, 200)
      ctx.drawImage(img, 20, 20, 160, 160)
      URL.revokeObjectURL(url)

      try {
        canvas.toBlob(async (blob) => {
          if (blob) {
            await navigator.clipboard.write([
              new ClipboardItem({ 'image/png': blob })
            ])
            setQrCopyFeedback(true)
            setTimeout(() => setQrCopyFeedback(false), 2000)
          }
        }, 'image/png')
      } catch {
        // Fallback: copy link instead
        await navigator.clipboard.writeText(shareLink)
        setQrCopyFeedback(true)
        setTimeout(() => setQrCopyFeedback(false), 2000)
      }
    }
    img.src = url
  }

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
        onRemoveMember={onRemoveMember}
        onOpenDeleteModal={onOpenDeleteModal}
        onGoToOverview={onGoToOverview}
        onUpdateUserName={onUpdateUserName}
      />

      <main className="flex-1 flex flex-col min-w-0 h-full overflow-hidden relative">
        <header className={`h-20 border-b ${theme.colors.ui.border} ${theme.colors.ui.surface} flex items-center justify-between px-4 md:px-12 shrink-0 z-10 shadow-sm transition-colors duration-300`}>
          <div className="flex items-start gap-4 md:gap-8 min-w-0">
            <div className="min-w-0">
              <p className="hidden md:block text-[9px] font-black uppercase tracking-[0.2em] text-amber-600 mb-1">
                Project
              </p>
              <h1 className={`text-xl md:text-2xl font-black ${theme.colors.ui.text} tracking-tight truncate max-w-[120px] sm:max-w-[200px] lg:max-w-md`}>
                {activeProject.name}
              </h1>
            </div>

            <div className={`h-12 w-px ${theme.colors.ui.border} hidden sm:block mt-0`} />

            <div className="min-w-0">
              <p className={`hidden sm:block text-[9px] font-black uppercase tracking-[0.2em] ${theme.colors.ui.textLight} mb-1`}>
                Invite Link
              </p>
              <div className="flex items-center gap-1 sm:gap-2">
                <button
                  type="button"
                  onClick={handleCopy}
                  className={`p-2 px-3 rounded-xl transition-all flex items-center gap-2 border-2 ${
                    copyFeedback 
                      ? 'bg-emerald-50 border-emerald-200 text-emerald-600 dark:bg-emerald-900/20 dark:border-emerald-800/50 dark:text-emerald-400' 
                      : `${theme.colors.ui.background} border-transparent hover:${theme.colors.ui.borderStrong} ${theme.colors.ui.textLight} hover:${theme.colors.ui.text}`
                  }`}
                  title="Copy invite link to clipboard"
                >
                  {copyFeedback ? (
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                      <rect width="14" height="14" x="8" y="8" rx="2" ry="2" />
                      <path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2" />
                    </svg>
                  )}
                  <span className="text-[10px] font-black uppercase tracking-widest">
                    {copyFeedback ? 'Copied!' : 'Copy'}
                  </span>
                </button>
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setShowQR(!showQR)}
                  className={`p-2 px-3 rounded-xl transition-all flex items-center gap-2 border-2 ${
                    showQR
                      ? 'bg-slate-100 border-slate-200 text-slate-700 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-300'
                      : `${theme.colors.ui.background} border-transparent hover:${theme.colors.ui.borderStrong} ${theme.colors.ui.textLight} hover:${theme.colors.ui.text}`
                  }`}
                  title="Show QR Code"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="3" width="7" height="7" rx="1" />
                    <rect x="14" y="3" width="7" height="7" rx="1" />
                    <rect x="3" y="14" width="7" height="7" rx="1" />
                    <rect x="14" y="14" width="3" height="3" />
                    <rect x="18" y="14" width="3" height="3" />
                    <rect x="14" y="18" width="3" height="3" />
                    <rect x="18" y="18" width="3" height="3" />
                  </svg>
                  <span className="text-[10px] font-black uppercase tracking-widest">
                    QR Code
                  </span>
                </button>
                {showQR && (
                  <div className="absolute top-full right-0 mt-2 p-4 bg-white dark:bg-slate-800 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-700 z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                    <div className="flex flex-col items-center gap-3">
                      <p className={`text-[10px] font-black uppercase tracking-wider ${theme.colors.ui.textMuted}`}>
                        Scan to join {activeProject.name}
                      </p>
                      <div ref={qrRef} className="p-3 bg-white rounded-xl">
                        <QRCodeSVG
                          value={shareLink}
                          size={160}
                          level="M"
                          marginSize={0}
                        />
                      </div>
                      <div className="flex gap-2 w-full">
                        <button
                          type="button"
                          onClick={handleSaveQR}
                          className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200 text-[10px] font-bold hover:bg-slate-200 dark:hover:bg-slate-600 transition-all"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                            <polyline points="7 10 12 15 17 10" />
                            <line x1="12" x2="12" y1="15" y2="3" />
                          </svg>
                          Save
                        </button>
                        <button
                          type="button"
                          onClick={handleCopyQR}
                          className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-[10px] font-bold transition-all ${
                            qrCopyFeedback
                              ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400'
                              : 'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-600'
                          }`}
                        >
                          {qrCopyFeedback ? (
                            <>
                              <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                <polyline points="20 6 9 17 4 12" />
                              </svg>
                              Copied!
                            </>
                          ) : (
                            <>
                              <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                <rect width="14" height="14" x="8" y="8" rx="2" ry="2" />
                                <path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2" />
                              </svg>
                              Copy
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
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
              <span className="hidden sm:inline">POST TASK</span>
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
                        Try adjusting your filters or post a task.
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
                        onTakeTask={onTakeTask}
                        onJoinTask={onJoinTask}
                        onLeaveTask={onLeaveTask}
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
          contextHint={generateAiContextHint(
            activeProject,
            currentUserName,
            getUserName,
            memberList
          )}
        />
      </main>
    </div>
  )
}
