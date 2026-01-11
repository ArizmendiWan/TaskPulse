import type React from 'react'
import { useEffect, useMemo, useState } from 'react'
import { loadMemberName, loadProjects, saveMemberName, saveProjects } from './storage'
import type { ActivityItem, Project, Task, TaskStatus } from './types'
import {
  deriveStatus,
  filterAtRisk,
  filterDueSoon,
  filterMyTasks,
  filterOverdue,
  formatDue,
  isAtRisk,
  isDueSoon,
  isOverdue,
  sortByDue,
} from './lib/taskUtils'

type FilterKey = 'all' | 'mine' | 'dueSoon' | 'atRisk' | 'overdue'

const statusLabels: Record<string, string> = {
  unassigned: 'Unassigned',
  assigned: 'Assigned',
  in_progress: 'In Progress',
  done: 'Done',
  overdue: 'Overdue',
}

const statusPills: Record<string, string> = {
  unassigned: 'bg-slate-50 text-slate-500 border border-slate-200',
  assigned: 'bg-amber-50 text-amber-700 border border-amber-200',
  in_progress: 'bg-blue-50 text-blue-700 border border-blue-200',
  done: 'bg-emerald-50 text-emerald-700 border border-emerald-200',
  overdue: 'bg-rose-50 text-rose-700 border border-rose-200',
}

const filterLabels: Record<FilterKey, string> = {
  all: 'All',
  mine: 'My Tasks',
  dueSoon: 'Due Soon (<48h)',
  atRisk: 'At Risk',
  overdue: 'Overdue',
}

function uuid() {
  return (
    globalThis.crypto?.randomUUID?.() ??
    `id-${Date.now().toString(36)}-${Math.random().toString(16).slice(2)}`
  )
}

function projectShareLink(projectId: string) {
  const url = new URL(window.location.href)
  url.searchParams.set('projectId', projectId)
  return url.toString()
}

function ensureMemberList(members: string[], name: string) {
  const trimmed = name.trim()
  if (!trimmed) return members
  if (members.includes(trimmed)) return members
  return [...members, trimmed]
}

function createActivity(type: ActivityItem['type'], note?: string): ActivityItem {
  return {
    id: uuid(),
    type,
    note,
    at: new Date().toISOString(),
  }
}

function projectStats(project: Project) {
  const total = project.tasks.length
  const done = project.tasks.filter((t) => t.status === 'done').length
  const percentDone = total === 0 ? 0 : Math.min(100, Math.round((done / total) * 100))
  const dueSoon = filterDueSoon(project.tasks).length
  const atRisk = filterAtRisk(project.tasks).length
  const overdue = filterOverdue(project.tasks).length
  return { total, done, percentDone, dueSoon, atRisk, overdue }
}

function App() {
  const initialProjectId =
    new URLSearchParams(window.location.search).get('projectId') ?? null
  const initialView: 'overview' | 'project' | 'create' =
    window.location.pathname.endsWith('/new')
      ? 'create'
      : initialProjectId
        ? 'project'
        : 'overview'

  const [projects, setProjects] = useState<Project[]>(() => loadProjects())
  const [activeProjectId, setActiveProjectId] = useState<string | null>(
    initialProjectId,
  )
  const [view, setView] = useState<'overview' | 'project' | 'create'>(initialView)
  const [memberNameInput, setMemberNameInput] = useState('')
  const [currentMember, setCurrentMember] = useState<string>(() =>
    loadMemberName(initialProjectId),
  )
  const [filter, setFilter] = useState<FilterKey>('all')
  const [newProject, setNewProject] = useState({ name: '', course: '' })
  const [taskForm, setTaskForm] = useState({
    title: '',
    description: '',
    dueAt: '',
    owner: '',
    difficulty: '',
  })
  const [showTaskModal, setShowTaskModal] = useState(false)
  const [showSidebar, setShowSidebar] = useState(true)
  const [expandedTasks, setExpandedTasks] = useState<Record<string, boolean>>({})
  const activeProject = useMemo(
    () => projects.find((p) => p.id === activeProjectId) ?? null,
    [projects, activeProjectId],
  )
  const resolvedView: 'overview' | 'project' | 'create' =
    view === 'project' && !activeProject ? 'overview' : view
  const memberList = useMemo(
    () =>
      activeProject
        ? Array.from(new Set(activeProject.members.filter((m) => m && m.trim())))
        : [],
    [activeProject],
  )

  useEffect(() => {
    saveProjects(projects)
  }, [projects])

  useEffect(() => {
    if (!activeProjectId) return
    const storedName = loadMemberName(activeProjectId)
    setCurrentMember(storedName)
    setMemberNameInput(storedName)
  }, [activeProjectId])

  useEffect(() => {
    if (activeProjectId) saveMemberName(activeProjectId, currentMember)
  }, [activeProjectId, currentMember])

  const tasksForView = useMemo(() => {
    if (!activeProject) return []
    const base = sortByDue(activeProject.tasks)
    switch (filter) {
      case 'mine':
        return filterMyTasks(base, currentMember || null)
      case 'dueSoon':
        return filterDueSoon(base)
      case 'atRisk':
        return filterAtRisk(base)
      case 'overdue':
        return filterOverdue(base)
      default:
        return base
    }
  }, [activeProject, filter, currentMember])

  function upsertProject(mapper: (project: Project) => Project) {
    setProjects((prev) =>
      prev.map((p) => (p.id === activeProjectId ? mapper(p) : p)),
    )
  }

  function goToOverview() {
    setView('overview')
    setActiveProjectId(null)
    const url = new URL(window.location.origin + '/')
    window.history.replaceState({}, '', url.toString())
  }

  function goToCreate() {
    setView('create')
    setActiveProjectId(null)
    const url = new URL(window.location.origin + '/new')
    window.history.replaceState({}, '', url.toString())
  }

  function goToProject(id: string) {
    setActiveProjectId(id)
    setFilter('all')
    setView('project')
    const url = new URL(window.location.origin + '/')
    url.searchParams.set('projectId', id)
    window.history.replaceState({}, '', url.toString())
  }

  function handleCreateProject(e: React.FormEvent) {
    e.preventDefault()
    if (!newProject.name.trim()) return
    const id = uuid()
    const now = new Date().toISOString()
    const created: Project = {
      id,
      name: newProject.name.trim(),
      course: newProject.course.trim() || undefined,
      members: [],
      tasks: [],
      createdAt: now,
    }
    const nextProjects = [...projects, created]
    setProjects(nextProjects)
    setCurrentMember('')
    setMemberNameInput('')
    setNewProject({ name: '', course: '' })
    goToProject(id)
  }

  function handleJoinProject(e: React.FormEvent) {
    e.preventDefault()
    if (!activeProject || !memberNameInput.trim()) return
    const trimmed = memberNameInput.trim()
    setCurrentMember(trimmed)
    upsertProject((project) => ({
      ...project,
      members: ensureMemberList(project.members, trimmed),
    }))
  }

  function handleCreateTask(e: React.FormEvent) {
    e.preventDefault()
    if (!activeProject || !taskForm.title.trim() || !taskForm.dueAt) return
    const now = new Date().toISOString()
    const status: TaskStatus = taskForm.owner ? 'assigned' : 'unassigned'
    const newTask: Task = {
      id: uuid(),
      title: taskForm.title.trim(),
      description: taskForm.description.trim(),
      dueAt: taskForm.dueAt,
      owner: taskForm.owner.trim(),
      difficulty: (taskForm.difficulty as Task['difficulty']) || '',
      status,
      activity: [
        createActivity(
          'created',
          `Created by ${currentMember || 'teammate'}`.trim(),
        ),
      ],
      createdAt: now,
      updatedAt: now,
    }

    setProjects((prev) =>
      prev.map((project) =>
        project.id === activeProject.id
          ? {
              ...project,
              members: ensureMemberList(project.members, taskForm.owner),
              tasks: [...project.tasks, newTask],
            }
          : project,
      ),
    )

    setTaskForm({
      title: '',
      description: '',
      dueAt: '',
      owner: '',
      difficulty: '',
    })
    setShowTaskModal(false)
  }

  function updateTask(taskId: string, updater: (task: Task) => Task) {
    if (!activeProject) return
    setProjects((prev) =>
      prev.map((project) =>
        project.id === activeProject.id
          ? { ...project, tasks: project.tasks.map((t) => (t.id === taskId ? updater(t) : t)) }
          : project,
      ),
    )
  }

  function handleStatusChange(task: Task, next: TaskStatus) {
    if (task.status === next) return
    updateTask(task.id, (t) => ({
      ...t,
      status: next,
      activity: [
        ...t.activity,
        createActivity('status_changed', `Status: ${statusLabels[t.status]} → ${statusLabels[next]}`),
      ],
      updatedAt: new Date().toISOString(),
    }))
  }

  function handleOwnerChange(task: Task, next: string) {
    if (task.owner === next) return
    updateTask(task.id, (t) => ({
      ...t,
      owner: next,
      status: next ? (t.status === 'unassigned' ? 'assigned' : t.status) : 'unassigned',
      activity: [
        ...t.activity,
        createActivity(
          'owner_changed',
          next
            ? `Owner: ${t.owner || 'Unassigned'} → ${next}`
            : `Owner cleared (was ${t.owner || 'Unassigned'})`,
        ),
      ],
      updatedAt: new Date().toISOString(),
    }))
    if (activeProject) {
      upsertProject((project) => ({
        ...project,
        members: ensureMemberList(project.members, next),
      }))
    }
  }

  function handleDueChange(task: Task, next: string) {
    if (!next || task.dueAt === next) return
    updateTask(task.id, (t) => ({
      ...t,
      dueAt: next,
      activity: [
        ...t.activity,
        createActivity('due_changed', `Due date updated to ${formatDue(next)}`),
      ],
      updatedAt: new Date().toISOString(),
    }))
  }

  function handleDescriptionChange(task: Task, next: string) {
    updateTask(task.id, (t) => ({
      ...t,
      description: next,
      activity: [
        ...t.activity,
        createActivity('description_changed', 'Description edited'),
      ],
      updatedAt: new Date().toISOString(),
    }))
  }

  function copyLink(link: string) {
    if (!link) return
    navigator.clipboard?.writeText(link).catch(() => {})
  }

  function copyNudge(task: Task) {
    const message = `Hey — “${task.title}” is due ${formatDue(task.dueAt)}. Can you start it or update the status?`
    navigator.clipboard?.writeText(message).catch(() => {})
  }

  if (resolvedView === 'create') {
    return (
      <div className="min-h-screen bg-slate-50 text-slate-900 pb-12">
        <div className="mx-auto max-w-xl px-4 py-12 space-y-8">
          <header className="text-center space-y-2">
            <p className="text-xs font-black uppercase tracking-[0.2em] text-amber-600">
              TaskPulse
            </p>
            <h1 className="text-4xl font-black text-slate-900 tracking-tight">Create a Project</h1>
            <p className="text-sm font-medium text-slate-500">
              Set up your team in seconds. No accounts, no hassle.
            </p>
          </header>

          <section className="rounded-[2.5rem] bg-white p-8 shadow-xl shadow-slate-200 border border-slate-100">
            <form className="space-y-6" onSubmit={handleCreateProject}>
              <div className="space-y-1.5">
                <label className="text-sm font-bold text-slate-700 ml-1">
                  Project Name <span className="text-rose-500">*</span>
                </label>
                <input
                  required
                  name="project-name"
                  value={newProject.name}
                  onChange={(e) => setNewProject((p) => ({ ...p, name: e.target.value }))}
                  className="w-full rounded-2xl border-2 border-slate-100 bg-slate-50 px-4 py-3.5 text-sm font-medium transition-all focus:border-amber-400 focus:bg-white focus:outline-none focus:ring-4 focus:ring-amber-50"
                  placeholder="e.g. CS394 Final Project"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-bold text-slate-700 ml-1">
                  Course / Class <span className="text-slate-400 font-normal text-xs">(optional)</span>
                </label>
                <input
                  name="project-course"
                  value={newProject.course}
                  onChange={(e) => setNewProject((p) => ({ ...p, course: e.target.value }))}
                  className="w-full rounded-2xl border-2 border-slate-100 bg-slate-50 px-4 py-3.5 text-sm font-medium transition-all focus:border-amber-400 focus:bg-white focus:outline-none focus:ring-4 focus:ring-amber-50"
                  placeholder="e.g. Agile Software Development"
                />
              </div>
              <button
                type="submit"
                className="w-full rounded-2xl bg-slate-900 px-4 py-4 text-sm font-black text-white shadow-lg transition-all hover:bg-slate-800 hover:-translate-y-0.5 active:translate-y-0"
              >
                Create Project & Get Link
              </button>
            </form>
          </section>

          <div className="text-center">
            <button
              type="button"
              onClick={goToOverview}
              className="group inline-flex items-center gap-2 text-sm font-bold text-slate-400 hover:text-slate-600 transition-colors"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
              Back to Overview
            </button>
          </div>
        </div>
      </div>
    )
  }

  if (resolvedView === 'overview') {
    return (
      <div className="min-h-screen bg-slate-50 text-slate-900 pb-12">
        <div className="mx-auto max-w-6xl px-4 py-12 space-y-10">
          <header className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
            <div className="space-y-2">
              <p className="text-xs font-black uppercase tracking-[0.2em] text-amber-600">
                TaskPulse
              </p>
              <h1 className="text-4xl font-black text-slate-900 tracking-tight">Your Projects</h1>
              <p className="text-sm font-medium text-slate-500 max-w-md">
                A birds-eye view of all your group projects and their current status.
              </p>
            </div>
            <button
              type="button"
              onClick={goToCreate}
              className="inline-flex items-center gap-2 rounded-2xl bg-amber-600 px-6 py-3 text-sm font-black text-white shadow-lg shadow-amber-200 transition-all hover:bg-amber-500 hover:-translate-y-0.5 active:translate-y-0"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"/><path d="M12 5v14"/></svg>
              New Project
            </button>
          </header>

          {projects.length === 0 ? (
            <section className="rounded-[2.5rem] border-4 border-dashed border-slate-200 bg-white p-16 text-center">
              <div className="mx-auto w-16 h-16 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-300 mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="18" x="3" y="3" rx="2"/><path d="M3 9h18"/><path d="M9 21V9"/></svg>
              </div>
              <h3 className="text-xl font-bold text-slate-900">No projects yet</h3>
              <p className="mt-2 text-slate-500 max-w-xs mx-auto text-sm font-medium">
                Create your first project to start tracking tasks and coordinating with your team.
              </p>
              <button
                onClick={goToCreate}
                className="mt-8 rounded-xl bg-slate-900 px-8 py-3 text-sm font-black text-white hover:bg-slate-800 transition-all"
              >
                Get Started
              </button>
            </section>
          ) : (
            <section className="grid gap-6 md:grid-cols-2">
              {projects.map((project) => {
                const stats = projectStats(project)
                return (
                  <div
                    key={project.id}
                    className="group relative rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm transition-all hover:shadow-xl hover:shadow-slate-200/50 hover:-translate-y-1"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="space-y-1 min-w-0">
                        <h2 className="text-xl font-black text-slate-900 truncate tracking-tight">{project.name}</h2>
                        {project.course && (
                          <p className="text-sm font-bold text-amber-600 truncate">{project.course}</p>
                        )}
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mt-1">
                          {project.tasks.length} tasks · {project.members.length} members
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => goToProject(project.id)}
                        className="shrink-0 rounded-xl bg-slate-900 px-4 py-2 text-[11px] font-black text-white hover:bg-slate-800 transition-colors"
                      >
                        OPEN
                      </button>
                    </div>

                    <div className="mt-6 grid grid-cols-2 gap-3">
                      <div className="rounded-2xl bg-slate-50 p-3 border border-slate-100">
                        <p className="text-[10px] font-black uppercase tracking-wider text-slate-400">Progress</p>
                        <div className="mt-1 flex items-baseline gap-1">
                          <p className="text-lg font-black text-slate-900">{stats.percentDone}%</p>
                          <p className="text-[10px] font-bold text-slate-400">DONE</p>
                        </div>
                        <div className="mt-2 h-1.5 w-full rounded-full bg-slate-200 overflow-hidden">
                          <div 
                            className="h-full bg-emerald-500 transition-all duration-500" 
                            style={{ width: `${stats.percentDone}%` }}
                          />
                        </div>
                      </div>
                      
                      <div className="rounded-2xl bg-amber-50 p-3 border border-amber-100">
                        <p className="text-[10px] font-black uppercase tracking-wider text-amber-600">Due Soon</p>
                        <p className="mt-1 text-lg font-black text-amber-900">{stats.dueSoon}</p>
                        <p className="text-[10px] font-bold text-amber-700/60">NEXT 48H</p>
                      </div>

                      <div className="rounded-2xl bg-rose-50 p-3 border border-rose-100">
                        <p className="text-[10px] font-black uppercase tracking-wider text-rose-600">At Risk</p>
                        <p className="mt-1 text-lg font-black text-rose-900">{stats.atRisk}</p>
                        <p className="text-[10px] font-bold text-rose-700/60">NOT STARTED</p>
                      </div>

                      <div className="rounded-2xl bg-rose-900 p-3">
                        <p className="text-[10px] font-black uppercase tracking-wider text-rose-300">Overdue</p>
                        <p className="mt-1 text-lg font-black text-white">{stats.overdue}</p>
                        <p className="text-[10px] font-bold text-rose-400">CRITICAL</p>
                      </div>
                    </div>
                  </div>
                )
              })}
            </section>
          )}
        </div>
      </div>
    )
  }

  // Project dashboard view (task-first, single project)
  return (
    <div className="flex h-screen bg-slate-50 text-slate-900 overflow-hidden font-sans">
      {/* VS Code Style Sidebar / Narrow Strip */}
      {activeProject && (
        <aside 
          className={`${showSidebar ? 'w-80' : 'w-16'} border-r border-slate-200 bg-white flex flex-col h-full shrink-0 z-20 shadow-xl shadow-slate-200/50 transition-all duration-300 ease-in-out relative`}
        >
          {/* Toggle Button - VS Code Style */}
          <button
            onClick={() => setShowSidebar(!showSidebar)}
            className="absolute -right-3 top-1/2 -translate-y-1/2 w-6 h-12 bg-white border border-slate-200 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-900 hover:border-slate-900 transition-all shadow-sm z-30 group"
          >
            <svg 
              className={`transition-transform duration-300 ${showSidebar ? 'rotate-0' : 'rotate-180'}`} 
              xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"
            >
              <path d="m15 18-6-6 6-6"/>
            </svg>
          </button>

          <div className="flex flex-col h-full overflow-hidden">
            {/* Sidebar Header */}
            <div className={`p-6 border-b border-slate-100 flex flex-col transition-all duration-300 ${showSidebar ? 'opacity-100' : 'opacity-0 scale-90'}`}>
              {showSidebar && (
                <>
                  <div className="flex items-center justify-between mb-4">
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-amber-600">Project Info</p>
                  </div>
                  <div>
                    <h3 className="text-xl font-black text-slate-900 tracking-tight leading-tight truncate">{activeProject.name}</h3>
                    {activeProject.course && (
                      <p className="mt-1 text-sm font-bold text-amber-600 truncate">{activeProject.course}</p>
                    )}
                  </div>
                  <div className="flex items-center gap-4 pt-4">
                    <div className="text-center">
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Tasks</p>
                      <p className="text-lg font-black text-slate-900">{activeProject.tasks.length}</p>
                    </div>
                    <div className="h-8 w-px bg-slate-100" />
                    <div className="text-center">
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Team</p>
                      <p className="text-lg font-black text-slate-900">{activeProject.members.length}</p>
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* Collapsed State Icon - Show when NOT showSidebar */}
            {!showSidebar && (
              <div className="flex flex-col items-center py-6 gap-6 transition-all duration-300">
                <div className="w-10 h-10 rounded-xl bg-amber-600 flex items-center justify-center text-white font-black text-lg shadow-lg shadow-amber-200">
                  {activeProject.name.charAt(0).toUpperCase()}
                </div>
                <div className="flex flex-col gap-4">
                  <div className="w-8 h-8 rounded-lg bg-slate-100 flex flex-col items-center justify-center border border-slate-200">
                    <p className="text-[8px] font-black text-slate-400 leading-none">{activeProject.tasks.length}</p>
                    <p className="text-[6px] font-bold text-slate-400 uppercase">TKS</p>
                  </div>
                  <div className="w-8 h-8 rounded-lg bg-slate-100 flex flex-col items-center justify-center border border-slate-200">
                    <p className="text-[8px] font-black text-slate-400 leading-none">{activeProject.members.length}</p>
                    <p className="text-[6px] font-bold text-slate-400 uppercase">MEM</p>
                  </div>
                </div>
              </div>
            )}

            {/* Sidebar Scrollable Content */}
            <div className={`flex-1 overflow-y-auto p-6 space-y-8 transition-all duration-300 ${showSidebar ? 'opacity-100' : 'opacity-0 scale-95 pointer-events-none'}`}>
              {showSidebar && (
                <>
                  {/* Teammates Section */}
                  <div className="space-y-4">
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Teammates</p>
                    {memberList.length === 0 ? (
                      <p className="text-sm italic text-slate-400 font-medium px-1">No one has joined yet.</p>
                    ) : (
                      <div className="space-y-2">
                        {memberList.map((member) => (
                          <div
                            key={member}
                            className={`flex items-center gap-3 p-2 rounded-xl border-2 transition-all ${
                              member === currentMember
                                ? 'bg-amber-50 border-amber-200 shadow-sm'
                                : 'bg-slate-50 border-transparent hover:border-slate-100'
                            }`}
                          >
                            <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-black ${
                              member === currentMember ? 'bg-amber-200 text-amber-700' : 'bg-slate-200 text-slate-500'
                            }`}>
                              {member.charAt(0).toUpperCase()}
                            </div>
                            <span className="text-sm font-bold text-slate-700 truncate">
                              {member} {member === currentMember && '(You)'}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Dynamic Join/Profile Section */}
                  <div className="pt-4 border-t border-slate-100">
                    {!currentMember ? (
                      <div className="rounded-2xl border-2 border-amber-200 bg-amber-50 p-4 space-y-3">
                        <div className="space-y-1">
                          <h4 className="text-sm font-black text-amber-900 uppercase tracking-tight">Join the Team</h4>
                          <p className="text-[11px] font-bold text-amber-800/70">Enter your name to start.</p>
                        </div>
                        <form className="space-y-2" onSubmit={handleJoinProject}>
                          <input
                            required
                            name="member-name"
                            value={memberNameInput}
                            onChange={(e) => setMemberNameInput(e.target.value)}
                            className="w-full rounded-xl border-2 border-amber-100 bg-white px-3 py-2 text-sm font-bold focus:border-amber-400 focus:outline-none focus:ring-4 focus:ring-amber-200/20"
                            placeholder="Your name"
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
                        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">My Profile</p>
                        <div className="mt-3 flex items-center justify-between group">
                          <div className="flex items-center gap-2 min-w-0">
                            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shrink-0" />
                            <span className="text-sm font-black text-slate-900 truncate">{currentMember}</span>
                          </div>
                          <button
                            onClick={() => {
                              setCurrentMember('')
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

            {/* Sidebar Footer */}
            <div className={`p-6 bg-slate-50 border-t border-slate-100 transition-all duration-300 ${showSidebar ? 'opacity-100' : 'opacity-0 translate-y-4 pointer-events-none'}`}>
              {showSidebar && (
                <button
                  onClick={goToOverview}
                  className="w-full flex items-center justify-center gap-2 rounded-xl bg-white border-2 border-slate-200 p-3 text-xs font-black text-slate-600 hover:border-slate-900 hover:text-slate-900 transition-all"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
                  BACK TO PROJECTS
                </button>
              )}
            </div>

            {/* Collapsed State Overview Button */}
            {!showSidebar && (
              <div className="p-3 mb-4 mt-auto flex flex-col items-center">
                <button
                  onClick={goToOverview}
                  className="w-10 h-10 rounded-xl bg-slate-900 flex items-center justify-center text-white shadow-lg hover:bg-slate-800 transition-all"
                  title="Back to Overview"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
                </button>
              </div>
            )}
          </div>
        </aside>
      )}

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col min-w-0 h-full overflow-hidden relative">
        {/* Top Bar */}
        {activeProject && (
          <header className="h-20 border-b border-slate-200 bg-white flex items-center justify-between px-4 md:px-12 shrink-0 z-10 shadow-sm">
            <div className="flex items-center gap-4 md:gap-8 min-w-0">
              <div className="min-w-0">
                <p className="hidden md:block text-[10px] font-black uppercase tracking-[0.2em] text-amber-600 mb-0.5">Project</p>
                <h1 className="text-lg md:text-xl font-black text-slate-900 tracking-tight truncate max-w-[120px] sm:max-w-[200px] lg:max-w-md">
                  {activeProject.name}
                </h1>
              </div>
              
              <div className="h-10 w-px bg-slate-100 hidden sm:block" />
              
              <div className="flex flex-col gap-1 min-w-0">
                <p className="hidden md:block text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Invite Link</p>
                <div className="flex items-center gap-1 sm:gap-2">
                  <p className="hidden sm:block text-xs font-bold text-slate-600 truncate max-w-[100px] lg:max-w-[300px]">
                    {projectShareLink(activeProject.id)}
                  </p>
                  <button
                    type="button"
                    onClick={() => copyLink(projectShareLink(activeProject.id))}
                    className="p-2 rounded-xl bg-slate-50 border-2 border-transparent hover:border-slate-200 text-slate-400 hover:text-slate-900 transition-all flex items-center gap-2"
                    title="Copy Link"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><rect width="14" height="14" x="8" y="8" rx="2" ry="2"/><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/></svg>
                    <span className="hidden lg:block text-[10px] font-black uppercase tracking-widest">Copy Link</span>
                  </button>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setShowTaskModal(true)}
                className="rounded-xl bg-emerald-600 px-5 md:px-8 py-3 md:py-3.5 text-xs md:text-sm font-black text-white hover:bg-emerald-500 shadow-xl shadow-emerald-100 transition-all hover:-translate-y-0.5 active:translate-y-0 shrink-0"
              >
                <span className="hidden sm:inline">ADD TASK</span>
                <span className="sm:hidden">+ TASK</span>
              </button>
            </div>
          </header>
        )}

        <div className="flex-1 overflow-y-auto px-4 pt-6 pb-12 md:px-12">
          <div className="max-w-4xl mx-auto space-y-6">
            {!activeProject ? (
              <section className="rounded-[3rem] border-4 border-dashed border-slate-200 bg-white p-16 text-center">
                <h3 className="text-2xl font-black text-slate-900">Project not found</h3>
                <p className="mt-2 font-bold text-slate-400">The project link might be broken or expired.</p>
                <button
                  onClick={goToOverview}
                  className="mt-8 rounded-2xl bg-slate-900 px-8 py-3 text-sm font-black text-white hover:bg-slate-800 transition-all"
                >
                  BACK TO OVERVIEW
                </button>
              </section>
            ) : (
              <div className="space-y-6 pb-20">
                <div className="flex flex-wrap items-center gap-2">
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

                <div className="space-y-6">
                  {tasksForView.length === 0 ? (
                    <div className="py-20 text-center rounded-[3rem] border-4 border-dashed border-slate-100">
                      <p className="text-sm font-black text-slate-300 uppercase tracking-[0.2em]">No tasks found</p>
                      <p className="mt-1 text-xs font-bold text-slate-400">Try adjusting your filters or add a task.</p>
                    </div>
                  ) : (
                    tasksForView.map((task) => {
                      const derived = deriveStatus(task)
                      const isRisk = isAtRisk(task)
                      const soon = isDueSoon(task)
                      const overdue = isOverdue(task)
                      
                      return (
                        <div
                          key={task.id}
                          className={`group relative rounded-[2.5rem] border-2 transition-all duration-300 ${
                            overdue 
                              ? 'border-rose-100 bg-rose-50/20' 
                              : isRisk 
                                ? 'border-amber-100 bg-amber-50/20' 
                                : 'border-slate-100 bg-white hover:border-slate-200 hover:shadow-xl hover:shadow-slate-200/50'
                          } p-6 md:p-8`}
                        >
                          <div className="flex flex-col gap-6">
                            <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-6">
                              <div className="space-y-3 min-w-0">
                                <div className="flex flex-wrap items-center gap-2">
                                  <span className={`inline-flex items-center rounded-lg px-2.5 py-1 text-[10px] font-black uppercase tracking-wider shadow-sm ${statusPills[derived]}`}>
                                    {statusLabels[derived]}
                                  </span>
                                  {soon && !overdue && (
                                    <span className="rounded-lg bg-amber-500 px-2.5 py-1 text-[10px] font-black uppercase tracking-wider text-white shadow-sm">
                                      DUE SOON
                                    </span>
                                  )}
                                  {isRisk && (
                                    <span className="rounded-lg bg-rose-600 px-2.5 py-1 text-[10px] font-black uppercase tracking-wider text-white shadow-sm animate-pulse">
                                      AT RISK
                                    </span>
                                  )}
                                  {task.difficulty && (
                                    <span className="rounded-lg bg-slate-900 px-2 py-1 text-[10px] font-black text-white shadow-sm">
                                      {task.difficulty}
                                    </span>
                                  )}
                                </div>
                                <h4 className="text-2xl font-black text-slate-900 tracking-tight leading-tight">
                                  {task.title}
                                </h4>
                                {task.description && (
                                  <p className="text-sm font-bold text-slate-500 line-clamp-2 leading-relaxed">
                                    {task.description}
                                  </p>
                                )}
                              </div>

                              <div className="shrink-0 flex flex-row md:flex-col items-center md:items-end gap-3">
                                {isRisk && (
                                  <button
                                    type="button"
                                    onClick={() => copyNudge(task)}
                                    className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-5 py-2.5 text-xs font-black text-white shadow-lg shadow-slate-200 hover:bg-slate-800 transition-all hover:-translate-y-1"
                                  >
                                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="m22 2-7 20-4-9-9-4Z"/><path d="M22 2 11 13"/></svg>
                                    NUDGE
                                  </button>
                                )}
                                <button
                                  type="button"
                                  onClick={() => setExpandedTasks(prev => ({ ...prev, [task.id]: !prev[task.id] }))}
                                  className="rounded-xl border-2 border-slate-100 p-2.5 text-slate-400 hover:text-slate-900 hover:border-slate-900 transition-all"
                                >
                                  <svg className={`transition-transform duration-300 ${expandedTasks[task.id] ? 'rotate-180' : ''}`} xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6"/></svg>
                                </button>
                              </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-2">
                              <div className="space-y-2">
                                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1">Owner</p>
                                <select
                                  value={task.owner}
                                  onChange={(e) => handleOwnerChange(task, e.target.value)}
                                  className="w-full rounded-2xl border-2 border-slate-50 bg-slate-50 px-4 py-3 text-xs font-black text-slate-700 focus:border-amber-400 focus:bg-white focus:outline-none transition-all"
                                >
                                  <option value="">Unassigned</option>
                                  {[...new Set([...activeProject.members, currentMember].filter(Boolean))].map(
                                    (member) => (
                                      <option key={member} value={member}>
                                        {member}
                                      </option>
                                    ),
                                  )}
                                </select>
                              </div>

                              <div className="space-y-2">
                                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1">Status</p>
                                <select
                                  value={task.status}
                                  onChange={(e) => handleStatusChange(task, e.target.value as TaskStatus)}
                                  className="w-full rounded-2xl border-2 border-slate-50 bg-slate-50 px-4 py-3 text-xs font-black text-slate-700 focus:border-amber-400 focus:bg-white focus:outline-none transition-all"
                                >
                                  <option value="unassigned">Unassigned</option>
                                  <option value="assigned">Assigned</option>
                                  <option value="in_progress">In Progress</option>
                                  <option value="done">Done</option>
                                </select>
                              </div>

                              <div className="space-y-2">
                                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1">Due Date</p>
                                <input
                                  type="datetime-local"
                                  value={task.dueAt}
                                  onChange={(e) => handleDueChange(task, e.target.value)}
                                  className="w-full rounded-2xl border-2 border-slate-50 bg-slate-50 px-4 py-3 text-[11px] font-black text-slate-700 focus:border-amber-400 focus:bg-white focus:outline-none transition-all"
                                />
                              </div>
                            </div>

                            {expandedTasks[task.id] && (
                              <div className="mt-4 space-y-8 rounded-[2rem] bg-slate-50 border-2 border-slate-100 p-8 animate-in slide-in-from-top-4 duration-300">
                                <div className="space-y-4">
                                  <div className="flex items-center gap-2">
                                    <div className="w-1.5 h-6 bg-amber-400 rounded-full" />
                                    <p className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-900">
                                      Activity Log
                                    </p>
                                  </div>
                                  <div className="space-y-4 pl-3 relative before:absolute before:left-0 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200">
                                    {task.activity.map((item) => (
                                      <div key={item.id} className="relative pl-6">
                                        <div className="absolute left-[-5px] top-1.5 h-2.5 w-2.5 rounded-full bg-white border-2 border-slate-300" />
                                        <div className="space-y-1">
                                          <div className="flex flex-wrap items-center gap-3">
                                            <span className="text-[10px] font-black uppercase tracking-wider text-slate-900 px-2 py-0.5 bg-slate-200 rounded-md">
                                              {item.type.replace('_', ' ')}
                                            </span>
                                            <span className="text-[10px] font-black text-slate-400">
                                              {formatDue(item.at).toUpperCase()}
                                            </span>
                                          </div>
                                          <p className="text-sm font-bold text-slate-600">{item.note}</p>
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                                <div className="space-y-4">
                                  <div className="flex items-center gap-2">
                                    <div className="w-1.5 h-6 bg-slate-900 rounded-full" />
                                    <p className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-900">
                                      Detailed Notes
                                    </p>
                                  </div>
                                  <textarea
                                    value={task.description}
                                    onChange={(e) => handleDescriptionChange(task, e.target.value)}
                                    className="w-full rounded-[2rem] border-2 border-white bg-white p-6 text-sm font-bold text-slate-700 focus:border-amber-400 focus:bg-white focus:outline-none transition-all resize-none shadow-sm"
                                    placeholder="Add more details or updates for the team..."
                                    rows={5}
                                  />
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      )
                    })
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Task Creation Modal */}
      {showTaskModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/80 backdrop-blur-md px-4">
          <div
            role="dialog"
            aria-modal="true"
            aria-label="New task"
            className="w-full max-w-xl rounded-[3rem] bg-white p-10 shadow-2xl transition-all animate-in fade-in zoom-in duration-300"
          >
            <div className="flex items-start justify-between">
              <div className="space-y-2">
                <p className="text-[11px] font-black uppercase tracking-[0.3em] text-amber-600">TaskPulse</p>
                <h3 className="text-3xl font-black text-slate-900 tracking-tight">Add a Task</h3>
                <p className="text-sm font-bold text-slate-500">
                  Keep it clear so the team knows what to do.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowTaskModal(false)}
                className="rounded-full bg-slate-50 p-3 text-slate-400 hover:bg-slate-100 hover:text-slate-900 transition-all"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
              </button>
            </div>
            
            <form className="mt-10 space-y-6" onSubmit={handleCreateTask}>
              <div className="space-y-2">
                <label className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1">Task Title <span className="text-rose-500">*</span></label>
                <input
                  required
                  name="task-title"
                  value={taskForm.title}
                  onChange={(e) => setTaskForm((t) => ({ ...t, title: e.target.value }))}
                  className="w-full rounded-[1.5rem] border-2 border-slate-50 bg-slate-50 px-6 py-4 text-sm font-black focus:border-amber-400 focus:bg-white focus:outline-none transition-all"
                  placeholder="e.g. Write report introduction"
                />
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1">Due Date <span className="text-rose-500">*</span></label>
                  <input
                    required
                    type="datetime-local"
                    name="task-due"
                    value={taskForm.dueAt}
                    onChange={(e) => setTaskForm((t) => ({ ...t, dueAt: e.target.value }))}
                    className="w-full rounded-[1.5rem] border-2 border-slate-50 bg-slate-50 px-6 py-4 text-[13px] font-black focus:border-amber-400 focus:bg-white focus:outline-none transition-all"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1">Difficulty</label>
                  <select
                    name="task-difficulty"
                    value={taskForm.difficulty}
                    onChange={(e) => setTaskForm((t) => ({ ...t, difficulty: e.target.value }))}
                    className="w-full rounded-[1.5rem] border-2 border-slate-50 bg-slate-50 px-6 py-4 text-sm font-black focus:border-amber-400 focus:bg-white focus:outline-none transition-all"
                  >
                    <option value="">Select...</option>
                    <option value="S">S (Tiny)</option>
                    <option value="M">M (Medium)</option>
                    <option value="L">L (Big)</option>
                  </select>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1">Owner</label>
                <input
                  name="task-owner"
                  value={taskForm.owner}
                  onChange={(e) => setTaskForm((t) => ({ ...t, owner: e.target.value }))}
                  list="member-options-modal"
                  className="w-full rounded-[1.5rem] border-2 border-slate-50 bg-slate-50 px-6 py-4 text-sm font-black focus:border-amber-400 focus:bg-white focus:outline-none transition-all"
                  placeholder="Unassigned"
                />
                <datalist id="member-options-modal">
                  {activeProject?.members.map((member) => (
                    <option key={member} value={member} />
                  ))}
                  {currentMember && <option value={currentMember} />}
                </datalist>
              </div>

              <div className="space-y-2">
                <label className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1">Description</label>
                <textarea
                  name="task-description"
                  value={taskForm.description}
                  onChange={(e) => setTaskForm((t) => ({ ...t, description: e.target.value }))}
                  rows={3}
                  className="w-full rounded-[1.5rem] border-2 border-slate-50 bg-slate-50 px-6 py-4 text-sm font-black focus:border-amber-400 focus:bg-white focus:outline-none transition-all resize-none"
                  placeholder="Add some details..."
                />
              </div>

              <div className="flex gap-4 pt-4">
                <button
                  type="button"
                  onClick={() => setShowTaskModal(false)}
                  className="flex-1 rounded-[1.5rem] border-2 border-slate-100 px-6 py-4 text-sm font-black text-slate-500 hover:bg-slate-50 transition-colors"
                >
                  CANCEL
                </button>
                <button
                  type="submit"
                  className="flex-[1.5] rounded-[1.5rem] bg-slate-900 px-6 py-4 text-sm font-black text-white shadow-xl shadow-slate-200 hover:bg-slate-800 hover:-translate-y-1 active:translate-y-0 transition-all"
                >
                  CREATE TASK
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default App
