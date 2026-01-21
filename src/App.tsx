import { useMemo, useState, useEffect } from 'react'
import type React from 'react'
import type { Project, Task, TaskStatus, User } from './types'
import { getUserByEmail, saveUser, getUserById } from './lib/userUtils'
import { sendNudgeEmails } from './utilities/emailService'
import {
  filterAtRisk,
  filterDueSoon,
  filterOverdue,
  formatDue,
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
import { TaskCreationModal } from './components/TaskCreationModal'
import { DeleteConfirmationModal } from './components/DeleteConfirmationModal'
import { AiChatModal } from './features/ai/AiChatModal'
import { generateAiContextHint } from './features/ai/utils'

function App() {
  const initialProjectId = new URLSearchParams(window.location.search).get('projectId') ?? null
  const initialView: 'overview' | 'project' | 'create' | 'login' =
    window.location.pathname.endsWith('/new') ? 'create' : initialProjectId ? 'project' : 'overview'

  const { currentUserId, currentUserName, login, logout, updateName } = useAuth()
  const {
    projects,
    setProjects,
    activeProjectId,
    setActiveProjectId,
    activeProject,
    userProjects,
    isLoadingProject,
    upsertProject,
    upsertProjectAsyncById,
    deleteProject,
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
  const [memberNameInput, setMemberNameInput] = useState('')
  const [memberEmailInput, setMemberEmailInput] = useState('')
  const [newProject, setNewProject] = useState({ name: '', course: '' })
  const [loginForm, setLoginForm] = useState({ name: '', email: '' })
  const [loginError, setLoginError] = useState<string | null>(null)
  const [taskForm, setTaskForm] = useState({
    title: '',
    description: '',
    dueAt: '',
    owners: [] as string[],
    difficulty: '',
  })
  const [showTaskModal, setShowTaskModal] = useState(false)
  const [showSidebar, setShowSidebar] = useState(true)
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

  const resolvedView = !currentUserId && view !== 'create' ? 'login' : view === 'project' && !activeProject && !activeProjectId ? 'overview' : view

  const memberList = useMemo(
    () => (activeProject ? Array.from(new Set(activeProject.members.filter(Boolean))) : []),
    [activeProject],
  )

  const tasksForView = useMemo(() => {
    if (!activeProject) return []
    let base = [...activeProject.tasks]

    // Apply status filter
    switch (filter) {
      case 'mine': base = base.filter((t) => t.owners.includes(currentUserId || '')); break
      case 'dueSoon': base = base.filter((t) => filterDueSoon([t]).length > 0); break
      case 'atRisk': base = base.filter((t) => filterAtRisk([t]).length > 0); break
      case 'overdue': base = base.filter((t) => filterOverdue([t]).length > 0); break
    }

    // Filter out done tasks if needed
    if (!showDone) {
      base = base.filter((t) => t.status !== 'done')
    }

    // Sort: 1. Pinned (top), 2. Active vs Done (done to the bottom), 3. Due Date (nearest first)
    return base.sort((a, b) => {
      // 1. Pinned: top
      if (a.isPinned && !b.isPinned) return -1
      if (!a.isPinned && b.isPinned) return 1

      // 2. Status: done to the bottom
      if (a.status === 'done' && b.status !== 'done') return 1
      if (a.status !== 'done' && b.status === 'done') return -1

      // 3. Due Date: nearest first
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
    setProjects([...projects, created])
    handleGoToProject(id)
    setNewProject({ name: '', course: '' })
  }

  const handleJoinProject = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!activeProject || !memberNameInput.trim() || !memberEmailInput.trim()) return
    const trimmed = memberNameInput.trim()
    const email = memberEmailInput.trim().toLowerCase()

    try {
      const existingUser = await getUserByEmail(email)
      let userId: string
      if (existingUser) {
        const updatedUser = { ...existingUser, name: trimmed, updatedAt: new Date().toISOString() }
        if (existingUser.name !== trimmed) {
          await saveUser(updatedUser)
        }
        login(existingUser.id, trimmed)
        userId = existingUser.id
        // Update local cache
        setUserCache((prev) => ({ ...prev, [userId]: updatedUser }))
      } else {
        userId = `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
        const newUser: User = {
          id: userId,
          name: trimmed,
          email,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        }
        await saveUser(newUser)
        login(userId, trimmed)
        // Update local cache
        setUserCache((prev) => ({ ...prev, [userId]: newUser }))
      }
      upsertProject((p) => ({ ...p, members: ensureMemberList(p.members, userId) }))
      setMemberNameInput('')
      setMemberEmailInput('')
    } catch (err) {
      console.error(err)
    }
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
    await upsertProjectAsyncById(activeProject.id, (p) => ({
      ...p,
      members: p.members.filter((m) => m !== memberId),
    }))
  }

  const handleCreateTask = (e: React.FormEvent) => {
    e.preventDefault()
    if (!activeProject || !taskForm.title.trim() || !taskForm.dueAt) return
    const newTask: Task = {
      id: uuid(),
      title: taskForm.title.trim(),
      description: taskForm.description.trim(),
      dueAt: taskForm.dueAt,
      owners: taskForm.owners,
      difficulty: (taskForm.difficulty as Task['difficulty']) || '',
      status: taskForm.owners.length > 0 ? 'not_started' : 'unassigned',
      activity: [createActivity('created', `Created by ${currentUserName || 'teammate'}`)],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
    upsertProject((p) => {
      let members = p.members
      taskForm.owners.forEach((o) => (members = ensureMemberList(members, o)))
      return { ...p, members, tasks: [...p.tasks, newTask] }
    })
    setTaskForm({ title: '', description: '', dueAt: '', owners: [], difficulty: '' })
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
      activity: [...t.activity, createActivity('status_changed', `Status: ${statusLabels[t.status]} → ${statusLabels[next]}`)],
      updatedAt: new Date().toISOString(),
    }))
  }

  const handleOwnerChange = (task: Task, ownerId: string) => {
    const isAlreadyOwner = task.owners.includes(ownerId)
    const nextOwners = isAlreadyOwner ? task.owners.filter((o) => o !== ownerId) : [...task.owners, ownerId]
    handleUpdateTask(task.id, (t) => ({
      ...t,
      owners: nextOwners,
      status: nextOwners.length > 0 ? (t.status === 'unassigned' ? 'not_started' : t.status) : 'unassigned',
      activity: [...t.activity, createActivity('owner_changed', isAlreadyOwner ? `Removed owner: ${getUserName(ownerId)}` : `Added owner: ${getUserName(ownerId)}`)],
      updatedAt: new Date().toISOString(),
    }))
    if (!isAlreadyOwner) upsertProject((p) => ({ ...p, members: ensureMemberList(p.members, ownerId) }))
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
    if (task.owners.length === 0) return alert('Assign someone first!')
    const due = formatDue(task.dueAt)
    const emails = task.owners.map((o) => userCache[o]?.email).filter(Boolean) as string[]
    if (emails.length === 0) return alert('No emails found!')

    try {
      setNudgeFeedback((prev) => ({ ...prev, [task.id]: 'sending' }))
      await sendNudgeEmails({
        taskTitle: task.title,
        dueAt: due,
        recipientEmails: emails,
        senderName: currentUserName || 'Teammate',
      })
      setNudgeFeedback((prev) => ({ ...prev, [task.id]: 'sent' }))
      setTimeout(() => setNudgeFeedback((prev) => ({ ...prev, [task.id]: null })), 3000)
    } catch (err) {
      setNudgeFeedback((prev) => ({ ...prev, [task.id]: 'error' }))
      setTimeout(() => setNudgeFeedback((prev) => ({ ...prev, [task.id]: null })), 3000)
    }
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

  // Auto-join if visitor has projectId but not in members
  useEffect(() => {
    // Only auto-join if we are currently in the project view
    if (view === 'project' && currentUserId && activeProject && !activeProject.members.includes(currentUserId)) {
      upsertProject((p) => ({ ...p, members: ensureMemberList(p.members, currentUserId) }))
    }
  }, [currentUserId, activeProject, view])

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
      {resolvedView === 'project' && activeProject && (
        <ProjectDashboardView
          activeProject={activeProject}
          isLoadingProject={isLoadingProject}
          currentUserId={currentUserId}
          currentUserName={currentUserName}
          memberList={memberList}
          getUserName={getUserName}
          memberNameInput={memberNameInput}
          setMemberNameInput={setMemberNameInput}
          memberEmailInput={memberEmailInput}
          setMemberEmailInput={setMemberEmailInput}
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
          onJoinProject={handleJoinProject}
          onRemoveMember={handleRemoveMember}
          onOpenDeleteModal={handleOpenDeleteModal}
          onGoToOverview={handleGoToOverview}
          onCopyLink={(link) => navigator.clipboard?.writeText(link)}
          onShowTaskModal={() => setShowTaskModal(true)}
          onStatusChange={handleStatusChange}
          onOwnerChange={handleOwnerChange}
          onDueChange={handleDueChange}
          onDescriptionChange={handleDescriptionChange}
          onAddComment={handleAddComment}
          onUpdateComment={handleUpdateComment}
          onDeleteComment={handleDeleteComment}
          onDeleteTask={handleDeleteTask}
          onNudge={handleNudge}
          onUpdateUserName={handleUpdateUserName}
          onTogglePin={handleToggleTaskPin}
          onOpenAI={() => setAiOpen(true)}
        />
      )}

      {showTaskModal && (
        <TaskCreationModal
          taskForm={taskForm}
          setTaskForm={setTaskForm}
          activeProject={activeProject}
          currentUserId={currentUserId}
          getUserName={getUserName}
          onSubmit={handleCreateTask}
          onClose={() => setShowTaskModal(false)}
        />
      )}

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

      <AiChatModal
        open={aiOpen}
        onClose={() => setAiOpen(false)}
        projectName={activeProject?.name}
        contextHint={
          activeProject
            ? generateAiContextHint(
                activeProject,
                currentUserName,
                getUserName,
                memberList
              )
            : undefined
        }
      />
    </>
  )
}

export default App
