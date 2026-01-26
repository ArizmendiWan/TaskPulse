import type { ActivityItem, Project } from './types'
import { filterDueSoon, filterOpen, filterOverdue } from './lib/taskUtils'
import { theme } from './theme'

export type FilterKey = 'all' | 'mine' | 'open' | 'dueSoon' | 'overdue'

export const statusLabels: Record<string, string> = {
  open: 'Unclaimed',
  in_progress: 'In Progress',
  done: 'Done',
  expired: 'Expired',
  overdue: 'Overdue',
}

export const statusPills: Record<string, string> = {
  open: theme.colors.status.unassigned.pill, // reuse unassigned style for open
  in_progress: theme.colors.status.in_progress.pill,
  done: theme.colors.status.done.pill,
  expired: 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-slate-700',
  overdue: theme.colors.status.overdue.pill,
}

export const filterLabels: Record<FilterKey, string> = {
  all: 'All',
  mine: 'My Tasks',
  open: 'Unclaimed',
  dueSoon: 'Due Soon',
  overdue: 'Overdue',
}

export function uuid() {
  return (
    globalThis.crypto?.randomUUID?.() ??
    `id-${Date.now().toString(36)}-${Math.random().toString(16).slice(2)}`
  )
}

export function projectShareLink(projectId: string) {
  const url = new URL(window.location.href)
  url.searchParams.set('projectId', projectId)
  return url.toString()
}

export function ensureMemberList(members: string[], userId: string) {
  if (!userId) return members
  if (members.includes(userId)) return members
  return [...members, userId]
}

export function createActivity(type: ActivityItem['type'], note?: string): ActivityItem {
  return {
    id: uuid(),
    type,
    note,
    at: new Date().toISOString(),
  }
}

export function projectStats(project: Project) {
  const total = project.tasks.length
  const done = project.tasks.filter((t) => t.status === 'done').length
  const percentDone = total === 0 ? 0 : Math.min(100, Math.round((done / total) * 100))
  const dueSoon = filterDueSoon(project.tasks).length
  const unclaimed = filterOpen(project.tasks).length
  const overdue = filterOverdue(project.tasks).length
  return { total, done, percentDone, dueSoon, unclaimed, overdue }
}

