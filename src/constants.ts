import type { ActivityItem, Project } from './types'
import { filterDueSoon, filterAtRisk, filterOverdue } from './lib/taskUtils'

export type FilterKey = 'all' | 'mine' | 'dueSoon' | 'atRisk' | 'overdue'

export const statusLabels: Record<string, string> = {
  unassigned: 'Unassigned',
  not_started: 'Not Started',
  in_progress: 'In Progress',
  done: 'Done',
  overdue: 'Overdue',
}

export const statusPills: Record<string, string> = {
  unassigned: 'bg-slate-50 text-slate-500 border border-slate-200',
  not_started: 'bg-amber-50 text-amber-700 border border-amber-200',
  in_progress: 'bg-blue-50 text-blue-700 border border-blue-200',
  done: 'bg-emerald-50 text-emerald-700 border border-emerald-200',
  overdue: 'bg-rose-50 text-rose-700 border border-rose-200',
}

export const filterLabels: Record<FilterKey, string> = {
  all: 'All',
  mine: 'My Tasks',
  dueSoon: 'Due Soon (<48h)',
  atRisk: 'At Risk',
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
  const atRisk = filterAtRisk(project.tasks).length
  const overdue = filterOverdue(project.tasks).length
  return { total, done, percentDone, dueSoon, atRisk, overdue }
}

