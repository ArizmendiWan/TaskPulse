import React, { useMemo, useState, useEffect, Suspense } from 'react'
import type { Project, Task, TaskStatus, User } from './types'
import { getUserByEmail, saveUser, getUserById } from './lib/userUtils'
import { sendNudgeEmails } from './utilities/emailService'
import {
  filterDueSoon,
  filterOpen,
  filterOverdue,
  formatDue,
  canNudge,
  getNextNudgeTime,
} from './lib/taskUtils'
import {
  type FilterKey,
  createActivity,
  ensureMemberList,
  uuid,
  statusLabels,
} from './constants'
import { useAuth } from './hooks/useAuth'
import { useProjects } from './hooks/useProjects'
import { useUserCache } from './hooks/useUserCache'
import { LoginView } from './components/LoginView'
import { CreateProjectView } from './components/CreateProjectView'
import { ProjectOverviewView } from './components/ProjectOverviewView'
import { ProjectDashboardView } from './components/ProjectDashboardView'
const TaskCreationModal = React.lazy(() =>
  import('./components/TaskCreationModal').then((m) => ({ default: m.TaskCreationModal }))
)
const DeleteConfirmationModal = React.lazy(() =>
  import('./components/DeleteConfirmationModal').then((m) => ({ default: m.DeleteConfirmationModal }))
)
import { InviteView } from './components/InviteView'
const AiChatModal = React.lazy(() =>
  import('./features/ai/AiChatModal').then((m) => ({ default: m.AiChatModal }))
)
import { generateAiContextHint } from './features/ai/utils'

function App() {
  const initialProjectId = new URLSearchParams(window.location.search).get('projectId') ?? null
  const initialView: 'overview' | 'project' | 'create' | 'login' =
    window.location.pathname.endsWith('/new') ? 'create' : initialProjectId ? 'project' : 'overview'

  const { currentUserId, currentUserName, login, logout, updateName } = useAuth()
  const {
    projects,
    activeProjectId,
    setActiveProjectId,
    activeProject,
    userProjects,
    isLoadingProject,
    upsertProject,
    upsertProjectAsyncById,
    deleteProject,
    addProject,
  } = useProjects(currentUserId, initialProjectId)

  const { userCache, setUserCache, getUserName } = useUserCache(projects)

  const [view, setView] = useState<'overview' | 'project' | 'create' | 'login'>(initialView)
  const [filter, setFilter] = useState<FilterKey>(() => {
    return (localStorage.getItem('taskpulse-filter') as FilterKey) || 'all'
  })
  const [showDone, setShowDone] = useState(() => {
    const saved = localStorage.getItem('taskpulse-showdone')
    return saved === null ? true : saved === 'true'
  })
  const [darkMode, setDarkMode] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('taskpulse-theme')
      if (saved) return saved === 'dark'
      return !!window.matchMedia?.('(prefers-color-scheme: dark)').matches
    }
    return false
  })
  const [newProject, setNewProject] = useState({ name: '', course: '' })
  const [loginForm, setLoginForm] = useState({ name: '', email: '' })
  const [loginError, setLoginError] = useState<string | null>(null)
  const [taskForm, setTaskForm] = useState({
    title: '',
    description: '',
    dueAt: '',
    members: [] as string[],
  })
  const [showTaskModal, setShowTaskModal] = useState(false)
  const [showSidebar, setShowSidebar] = useState(() => {
    if (typeof window !== 'undefined') {
      return window.innerWidth >= 768
    }
    return true
  })
  const [aiOpen, setAiOpen] = useState(false)
  const [expandedTasks, setExpandedTasks] = useState<Record<string, boolean>>({})
  const [nudgeFeedback, setNudgeFeedback] = useState<Record<string, 'sending' | 'sent' | 'error' | null>>({})

  const [deleteTarget, setDeleteTarget] = useState<{
    id: string
    name: string
    isOwner: boolean
  } | null>(null)
  const [deleteConfirmCode, setDeleteConfirmCode] = useState('')
  const [deleteConfirmInput, setDeleteConfirmInput] = useState('')

  const isMember = useMemo(() => {
    if (!currentUserId || !activeProject) return false
    return activeProject.members.includes(currentUserId)
  }, [currentUserId, activeProject])

  const prevProjectId = React.useRef(activeProjectId)
  const prevIsMember = React.useRef(isMember)

  useEffect(() => {
    // Detect if user lost membership of the CURRENT project (was kicked or left)
    const sameProject = prevProjectId.current === activeProjectId
    const lostMembership = prevIsMember.current && !isMember
    
    if (view === 'project' && activeProject && sameProject && lostMembership && !isLoadingProject) {
      handleGoToOverview()
    }
    
    prevProjectId.current = activeProjectId
    prevIsMember.current = isMember
  }, [activeProjectId, isMember, view, activeProject, isLoadingProject])

  const resolvedView =
    !currentUserId && (view === 'overview' || view === 'create')
      ? 'login'
      : view === 'project' && activeProject && !isMember
        ? 'invite'
        : view === 'project' && !activeProject && !activeProjectId
          ? 'overview'
          : view

  const memberList = useMemo(() => {
    if (!activeProject) return []
    const ids = Array.from(new Set(activeProject.members.filter(Boolean).map((m) => m.trim())))

    // Deduplicate by email if we have the data
    const seenEmails = new Set<string>()
    const uniqueIds: string[] = []

    for (const id of ids) {
      const email = userCache[id]?.email?.toLowerCase()
      if (email) {
        if (!seenEmails.has(email)) {
          seenEmails.add(email)
          uniqueIds.push(id)
        }
      } else {
        uniqueIds.push(id)
      }
    }
    return uniqueIds
  }, [activeProject, userCache])

  // Track task status changes to refresh AI context only when status updates
  const taskStatusSignature = useMemo(() => {
    if (!activeProject) return ''
    return activeProject.tasks
      .map((t) => `${t.id}:${t.status}`)
      .sort()
      .join('|')
  }, [activeProject])

  const aiContextHint = useMemo(() => {
    if (!activeProject) return undefined
    return generateAiContextHint(activeProject, currentUserName, getUserName, memberList)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeProject?.id, taskStatusSignature, currentUserName, getUserName, memberList])

  const tasksForView = useMemo(() => {
    if (!activeProject) return []
    let base = [...activeProject.tasks]

    // Apply status filter
    switch (filter) {
      case 'mine': 
        // Only show tasks where user is a member (has claimed or joined)
        base = base.filter((t) => t.members.includes(currentUserId || ''))
        break
      case 'open': 
        base = base.filter((t) => filterOpen([t]).length > 0)
        break
      case 'dueSoon': 
        base = base.filter((t) => filterDueSoon([t]).length > 0)
        break
      case 'overdue': 
        base = base.filter((t) => filterOverdue([t]).length > 0)
        break
    }

    // Filter out done tasks if needed
    if (!showDone) {
      base = base.filter((t) => t.status !== 'done')
    }

    // Sort: 1. Pinned (top), 2. Active vs Done (done to the bottom), 3. For Active: Due Date (nearest first), For Done: Recently Done (newest first)
    return base.sort((a, b) => {
      // 1. Pinned: top
      if (a.isPinned && !b.isPinned) return -1
      if (!a.isPinned && b.isPinned) return 1

      // 2. Status: done to the bottom
      if (a.status === 'done' && b.status !== 'done') return 1
      if (a.status !== 'done' && b.status === 'done') return -1

      // 3. Sorting within groups
      if (a.status === 'done' && b.status === 'done') {
        // Sort done tasks by doneAt descending (newest first)
        const timeA = new Date(a.doneAt || a.updatedAt).getTime()
        const timeB = new Date(b.doneAt || b.updatedAt).getTime()
        return timeB - timeA
      }

      // Default sort for active tasks: Due Date (nearest first)
      const timeA = new Date(a.dueAt).getTime()
      const timeB = new Date(b.dueAt).getTime()
      return timeA - timeB
    })
  }, [activeProject, filter, currentUserId, showDone])

  // Handlers
  const handleGoToOverview = () => {
    setView('overview')
    setActiveProjectId(null)
    const url = new URL(window.location.origin + '/')
    window.history.replaceState({}, '', url.toString())
  }

  const handleGoToProject = (id: string) => {
    setActiveProjectId(id)
    setFilter('all')
    setView('project')
    const url = new URL(window.location.origin + '/')
    url.searchParams.set('projectId', id)
    window.history.replaceState({}, '', url.toString())
  }

  const handleGoToCreate = () => {
    if (!currentUserId) {
      setView('login')
      return
    }
    setView('create')
    setActiveProjectId(null)
    const url = new URL(window.location.origin + '/new')
    window.history.replaceState({}, '', url.toString())
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    const name = loginForm.name.trim()
    const email = loginForm.email.trim().toLowerCase()

    if (!name || !email) {
      setLoginError('Please enter both name and email.')
      return
    }

    try {
      setLoginError(null)
      const existingUser = await getUserByEmail(email)

      if (existingUser) {
        let updatedUser = { ...existingUser }
        if (existingUser.name !== name) {
          updatedUser = { ...existingUser, name, updatedAt: new Date().toISOString() }
          await saveUser(updatedUser)
        }
        setUserCache((prev) => ({ ...prev, [updatedUser.id]: updatedUser }))
        login(updatedUser.id, name)
        handleGoToProject(initialProjectId || '')
        if (!initialProjectId) handleGoToOverview()
      } else {
        const newUserId = uuid()
        const newUser: User = {
          id: newUserId,
          name,
          email,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        }
        await saveUser(newUser)
        setUserCache((prev) => ({ ...prev, [newUserId]: newUser }))
        login(newUserId, name)
        handleGoToProject(initialProjectId || '')
        if (!initialProjectId) handleGoToOverview()
      }
    } catch (err) {
      setLoginError('An error occurred during login.')
    }
  }

  const handleCreateProject = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newProject.name.trim()) return
    const id = uuid()
    const created: Project = {
      id,
      name: newProject.name.trim(),
      course: newProject.course.trim() || null,
      members: currentUserId ? [currentUserId] : [],
      tasks: [],
      createdAt: new Date().toISOString(),
      ownerId: currentUserId || null,
    }
    await addProject(created)
    handleGoToProject(id)
    setNewProject({ name: '', course: '' })
  }

  const handleUpdateUserName = async (newName: string) => {
    if (!currentUserId || !newName.trim()) return
    try {
      const user = await getUserById(currentUserId)
      if (user) {
        const updatedUser = { ...user, name: newName.trim(), updatedAt: new Date().toISOString() }
        await saveUser(updatedUser)
        updateName(newName.trim())
        // Update the local cache immediately so the UI refreshes
        setUserCache((prev) => ({ ...prev, [currentUserId]: updatedUser }))
      }
    } catch (err) {
      console.error(err)
    }
  }

  const handleRemoveMember = async (memberId: string) => {
    if (!activeProject || !currentUserId || activeProject.ownerId !== currentUserId || memberId === currentUserId) return
    if (!window.confirm(`Remove ${getUserName(memberId)} from project?`)) return

    await upsertProjectAsyncById(activeProject.id, (p) => {
      const cleanedTasks = p.tasks.map((t) => {
        // Preserve completed tasks as-is
        if (t.status === 'done') return t

        const filteredMembers = t.members.filter((m) => m !== memberId)
        const wasOwner = t.takenBy === memberId
        return {
          ...t,
          members: filteredMembers,
          takenBy: wasOwner ? null : t.takenBy,
          status: wasOwner && t.status === 'in_progress' ? 'open' : t.status,
        }
      })

      return {
      ...p,
      members: p.members.filter((m) => m !== memberId),
        tasks: cleanedTasks,
      }
    })
  }

  const handleCreateTask = (e: React.FormEvent) => {
    e.preventDefault()
    if (!activeProject || !taskForm.title.trim() || !taskForm.dueAt || !currentUserId) return
    const newTask: Task = {
      id: uuid(),
      title: taskForm.title.trim(),
      description: taskForm.description.trim(),
      dueAt: taskForm.dueAt,
      creatorId: currentUserId,
      members: taskForm.members,
      takenBy: taskForm.members.length > 0 ? taskForm.members[0] : null,
      status: taskForm.members.length > 0 ? 'in_progress' : 'open',
      activity: [createActivity('created', `Posted by ${currentUserName || 'teammate'}`)],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
    upsertProject((p) => {
      return { ...p, tasks: [...p.tasks, newTask] }
    })
    setTaskForm({ title: '', description: '', dueAt: '', members: [] })
    setShowTaskModal(false)
  }

  const handleUpdateTask = (taskId: string, updater: (t: Task) => Task) => {
    upsertProject((p) => ({
      ...p,
      tasks: p.tasks.map((t) => (t.id === taskId ? updater(t) : t)),
    }))
  }

  const handleStatusChange = (task: Task, next: TaskStatus) => {
    if (task.status === next) return
    handleUpdateTask(task.id, (t) => ({
      ...t,
      status: next,
      doneAt: next === 'done' ? new Date().toISOString() : t.doneAt,
      activity: [...t.activity, createActivity('status_changed', `Status: ${statusLabels[t.status]} → ${statusLabels[next]}`)],
      updatedAt: new Date().toISOString(),
    }))
  }

  // "Leave" - leave a task you're part of
  const handleLeaveTask = (task: Task) => {
    if (!currentUserId) return
    handleUpdateTask(task.id, (t) => {
      const newMembers = t.members.filter(m => m !== currentUserId)
      // If no members left, task goes back to unclaimed (open)
      const newStatus = newMembers.length === 0 ? 'open' : t.status
      const newTakenBy = newMembers.length === 0 ? null : (t.takenBy === currentUserId ? newMembers[0] : t.takenBy)
      return {
      ...t,
        members: newMembers,
        takenBy: newTakenBy,
        status: newStatus,
        activity: [...t.activity, createActivity('member_left', `${currentUserName || 'Someone'} left`)],
      updatedAt: new Date().toISOString(),
      }
    })
  }

  const handleDueChange = (task: Task, next: string) => {
    handleUpdateTask(task.id, (t) => ({
      ...t,
      dueAt: next,
      activity: [...t.activity, createActivity('due_changed', `Due date updated to ${formatDue(next)}`)],
      updatedAt: new Date().toISOString(),
    }))
  }

  const handleDescriptionChange = (task: Task, next: string) => {
    handleUpdateTask(task.id, (t) => ({
      ...t,
      description: next,
      activity: [...t.activity, createActivity('description_changed', 'Description edited')],
      updatedAt: new Date().toISOString(),
    }))
  }

  const handleAddComment = (task: Task, text: string) => {
    if (!currentUserId || !text.trim()) return
    const newComment = {
      id: uuid(),
      authorId: currentUserId,
      text: text.trim(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
    handleUpdateTask(task.id, (t) => ({
      ...t,
      comments: [...(t.comments || []), newComment],
      updatedAt: new Date().toISOString(),
    }))
  }

  const handleUpdateComment = (task: Task, commentId: string, text: string) => {
    if (!text.trim()) return
    handleUpdateTask(task.id, (t) => ({
      ...t,
      comments: (t.comments || []).map((c) =>
        c.id === commentId ? { ...c, text: text.trim(), updatedAt: new Date().toISOString() } : c,
      ),
      updatedAt: new Date().toISOString(),
    }))
  }

  const handleDeleteComment = (task: Task, commentId: string) => {
    handleUpdateTask(task.id, (t) => ({
      ...t,
      comments: (t.comments || []).filter((c) => c.id !== commentId),
      updatedAt: new Date().toISOString(),
    }))
  }

  const handleDeleteTask = (task: Task) => {
    if (window.confirm(`Delete task "${task.title}"?`)) {
      upsertProject((p) => ({ ...p, tasks: p.tasks.filter((t) => t.id !== task.id) }))
    }
  }

  const handleNudge = async (task: Task) => {
    if (task.members.length === 0) return alert('No one has claimed this task yet!')

    // Check cooldown (3 hours)
    if (!canNudge(task)) {
      const nextNudge = getNextNudgeTime(task)
      if (nextNudge) {
        const hoursLeft = Math.ceil((nextNudge.getTime() - new Date().getTime()) / (1000 * 60 * 60))
        return alert(`Please wait ${hoursLeft} hour${hoursLeft !== 1 ? 's' : ''} before nudging again to avoid spamming team members (3h cooldown).`)
      }
    }
    
    const due = formatDue(task.dueAt)
    
    // Get emails from all members
    const emails = task.members.map((m) => userCache[m]?.email).filter(Boolean) as string[]
    if (emails.length === 0) return alert('No emails found!')

    try {
      setNudgeFeedback((prev) => ({ ...prev, [task.id]: 'sending' }))
      await sendNudgeEmails({
        taskTitle: task.title,
        dueAt: due,
        recipientEmails: emails,
        senderName: currentUserName || 'Teammate',
      })
      // Store the nudge timestamp
      handleUpdateTask(task.id, (t) => ({
        ...t,
        lastNudgedAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }))
      setNudgeFeedback((prev) => ({ ...prev, [task.id]: 'sent' }))
      setTimeout(() => setNudgeFeedback((prev) => ({ ...prev, [task.id]: null })), 3000)
    } catch (err) {
      setNudgeFeedback((prev) => ({ ...prev, [task.id]: 'error' }))
      setTimeout(() => setNudgeFeedback((prev) => ({ ...prev, [task.id]: null })), 3000)
    }
  }

  const handleAssignMembers = (task: Task, memberIds: string[]) => {
    handleUpdateTask(task.id, (t) => ({
      ...t,
      members: memberIds,
      status: memberIds.length > 0 ? (t.status === 'open' ? 'in_progress' : t.status) : 'open',
      updatedAt: new Date().toISOString(),
    }))
  }

  const handleToggleTaskPin = (task: Task) => {
    handleUpdateTask(task.id, (t) => ({
      ...t,
      isPinned: !t.isPinned,
      updatedAt: new Date().toISOString(),
    }))
  }

  const handleOpenDeleteModal = (project: Project) => {
    setDeleteTarget({ id: project.id, name: project.name, isOwner: project.ownerId === currentUserId })
    setDeleteConfirmCode(Math.random().toString(36).slice(2, 8).toUpperCase())
    setDeleteConfirmInput('')
  }

  const handleExecuteDelete = async () => {
    if (!deleteTarget) return
    const targetId = deleteTarget.id
    const isOwner = deleteTarget.isOwner

    // If leaving the active project, clear active project first to prevent auto-join useEffect
    if (activeProjectId === targetId) {
      handleGoToOverview()
    }

    if (isOwner) {
      await deleteProject(targetId)
    } else {
      await upsertProjectAsyncById(targetId, (p) => ({
        ...p,
        members: p.members.filter((m) => m !== currentUserId),
      }))
    }
    setDeleteTarget(null)
  }

  useEffect(() => {
    localStorage.setItem('taskpulse-filter', filter)
  }, [filter])

  useEffect(() => {
    localStorage.setItem('taskpulse-showdone', String(showDone))
  }, [showDone])

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark')
      document.body.classList.add('dark')
      localStorage.setItem('taskpulse-theme', 'dark')
    } else {
      document.documentElement.classList.remove('dark')
      document.body.classList.remove('dark')
      localStorage.setItem('taskpulse-theme', 'light')
    }
  }, [darkMode])

  return (
    <>
      {resolvedView === 'login' && (
        <LoginView
          loginForm={loginForm}
          setLoginForm={setLoginForm}
          onLogin={handleLogin}
          loginError={loginError}
        />
      )}
      {resolvedView === 'create' && (
        <CreateProjectView
          newProject={newProject}
          setNewProject={setNewProject}
          onCreateProject={handleCreateProject}
          onGoToOverview={handleGoToOverview}
        />
      )}
      {resolvedView === 'overview' && (
        <ProjectOverviewView
          currentUserName={currentUserName}
          currentUserId={currentUserId}
          userProjects={userProjects}
          darkMode={darkMode}
          onToggleDarkMode={() => setDarkMode(!darkMode)}
          onLogout={logout}
          onGoToCreate={handleGoToCreate}
          onGoToProject={handleGoToProject}
          onOpenDeleteModal={handleOpenDeleteModal}
        />
      )}
      {resolvedView === 'invite' && activeProject && (
        <InviteView
          project={activeProject}
          currentUserId={currentUserId}
          currentUserName={currentUserName}
          loginError={loginError}
          onJoin={async (name, emailInput) => {
            setLoginError(null)
            const email = emailInput.trim().toLowerCase()
            try {
              let userId: string
              const existingUser = await getUserByEmail(email)
              
              if (existingUser) {
                userId = existingUser.id
                const updatedUser = { ...existingUser, name, updatedAt: new Date().toISOString() }
                if (existingUser.name !== name) await saveUser(updatedUser)
                setUserCache((prev) => ({ ...prev, [userId]: updatedUser }))
              } else {
                userId = uuid()
                const newUser: User = {
                  id: userId,
                  name,
                  email,
                  createdAt: new Date().toISOString(),
                  updatedAt: new Date().toISOString(),
                }
                await saveUser(newUser)
                setUserCache((prev) => ({ ...prev, [userId]: newUser }))
              }
              
              login(userId, name)
            } catch (err) {
              setLoginError('Failed to join project.')
            }
          }}
          onConfirmJoin={async () => {
            if (currentUserId && activeProject) {
              await upsertProjectAsyncById(activeProject.id, (p) => ({
                ...p,
                members: ensureMemberList(p.members, currentUserId)
              }))
            }
          }}
          onDeclineJoin={handleGoToOverview}
          onSwitchUser={() => logout()}
          onGoBack={handleGoToOverview}
        />
      )}
      {resolvedView === 'project' && (
        activeProject ? (
          <ProjectDashboardView
            activeProject={activeProject}
            isLoadingProject={isLoadingProject}
            currentUserId={currentUserId}
            currentUserName={currentUserName}
            memberList={memberList}
            getUserName={getUserName}
            filter={filter}
            setFilter={setFilter}
            showDone={showDone}
            setShowDone={setShowDone}
            darkMode={darkMode}
            onToggleDarkMode={() => setDarkMode(!darkMode)}
            tasksForView={tasksForView}
            expandedTasks={expandedTasks}
            setExpandedTasks={setExpandedTasks}
            nudgeFeedback={nudgeFeedback}
            showSidebar={showSidebar}
            setShowSidebar={setShowSidebar}
            onRemoveMember={handleRemoveMember}
            onOpenDeleteModal={handleOpenDeleteModal}
            onGoToOverview={handleGoToOverview}
            onCopyLink={(link) => navigator.clipboard?.writeText(link)}
            onShowTaskModal={() => setShowTaskModal(true)}
            onStatusChange={handleStatusChange}
            onLeaveTask={handleLeaveTask}
            onDueChange={handleDueChange}
            onDescriptionChange={handleDescriptionChange}
            onAddComment={handleAddComment}
            onUpdateComment={handleUpdateComment}
            onDeleteComment={handleDeleteComment}
            onDeleteTask={handleDeleteTask}
            onNudge={handleNudge}
            onAssignMembers={handleAssignMembers}
            onUpdateUserName={handleUpdateUserName}
            onTogglePin={handleToggleTaskPin}
            onOpenAI={() => setAiOpen(true)}
            aiContextHint={aiContextHint}
          />
        ) : isLoadingProject ? (
          <div className="flex h-screen items-center justify-center bg-slate-50 dark:bg-slate-950 transition-colors duration-300">
            <div className="text-center space-y-4">
              <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-amber-500 border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]" />
              <p className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-widest">Loading Project...</p>
            </div>
          </div>
        ) : (
          <div className="flex h-screen items-center justify-center bg-slate-50 dark:bg-slate-950 transition-colors duration-300">
            <div className="text-center space-y-6 max-w-sm px-6">
              <div className="text-6xl animate-bounce">🕵️‍♂️</div>
              <div className="space-y-2">
                <h2 className="text-xl font-black text-slate-900 dark:text-white uppercase">Project Not Found</h2>
                <p className="text-sm font-bold text-slate-500 dark:text-slate-400">
                  This project might have been deleted or the link is incorrect.
                </p>
              </div>
              <button
                onClick={handleGoToOverview}
                className="w-full py-3 px-6 rounded-2xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-black uppercase tracking-widest hover:scale-[1.02] active:scale-[0.98] transition-all shadow-xl shadow-slate-200 dark:shadow-none"
              >
                Back to Overview
              </button>
            </div>
          </div>
        )
      )}

      <Suspense fallback={null}>
      {showTaskModal && (
        <TaskCreationModal
          taskForm={taskForm}
          setTaskForm={setTaskForm}
            projectMembers={activeProject?.members || []}
          getUserName={getUserName}
          onSubmit={handleCreateTask}
          onClose={() => setShowTaskModal(false)}
        />
      )}
      </Suspense>

      <Suspense fallback={null}>
      {deleteTarget && (
        <DeleteConfirmationModal
          deleteTarget={deleteTarget}
          deleteConfirmCode={deleteConfirmCode}
          deleteConfirmInput={deleteConfirmInput}
          setDeleteConfirmInput={setDeleteConfirmInput}
          onClose={() => setDeleteTarget(null)}
          onConfirm={handleExecuteDelete}
        />
      )}
      </Suspense>

      <Suspense fallback={null}>
      <AiChatModal
        open={aiOpen}
        onClose={() => setAiOpen(false)}
        projectName={activeProject?.name}
          contextHint={aiContextHint}
      />
      </Suspense>
    </>
  )
}

export default App
