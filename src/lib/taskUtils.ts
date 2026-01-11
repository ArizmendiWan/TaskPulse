import type { Task, TaskStatus } from '../types'

const HOUR_MS = 1000 * 60 * 60

export type DerivedStatus = TaskStatus | 'overdue'

export function isOverdue(task: Task, now = new Date()): boolean {
  return task.status !== 'done' && new Date(task.dueAt).getTime() < now.getTime()
}

export function deriveStatus(task: Task, now = new Date()): DerivedStatus {
  return isOverdue(task, now) ? 'overdue' : task.status
}

export function isDueSoon(task: Task, now = new Date(), thresholdHours = 48): boolean {
  if (task.status === 'done') return false
  const diffHours = (new Date(task.dueAt).getTime() - now.getTime()) / HOUR_MS
  return diffHours >= 0 && diffHours <= thresholdHours
}

export function isAtRisk(task: Task, now = new Date()): boolean {
  if (task.status === 'done') return false
  const diffHours = (new Date(task.dueAt).getTime() - now.getTime()) / HOUR_MS
  const isDueSoonWindow = diffHours >= 0 && diffHours <= 48
  const isCriticalWindow = diffHours >= 0 && diffHours <= 24
  const notStarted = task.status === 'unassigned' || task.status === 'assigned'
  const notMoving = task.status !== 'in_progress'

  return (isDueSoonWindow && notStarted) || (isCriticalWindow && notMoving)
}

export function formatDue(dueAt: string): string {
  const dt = new Date(dueAt)
  if (Number.isNaN(dt.getTime())) return 'No due date'
  return new Intl.DateTimeFormat(undefined, {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  }).format(dt)
}

export function sortByDue(tasks: Task[]): Task[] {
  return [...tasks].sort(
    (a, b) => new Date(a.dueAt).getTime() - new Date(b.dueAt).getTime(),
  )
}

export function filterMyTasks(tasks: Task[], owner: string | null): Task[] {
  if (!owner) return []
  return sortByDue(tasks.filter((t) => t.owner === owner))
}

export function filterDueSoon(tasks: Task[], now = new Date()): Task[] {
  return sortByDue(tasks.filter((t) => isDueSoon(t, now)))
}

export function filterAtRisk(tasks: Task[], now = new Date()): Task[] {
  return sortByDue(tasks.filter((t) => isAtRisk(t, now)))
}

export function filterOverdue(tasks: Task[], now = new Date()): Task[] {
  return sortByDue(tasks.filter((t) => isOverdue(t, now)))
}

