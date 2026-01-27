import type { Task, TaskStatus } from '../types'

const HOUR_MS = 1000 * 60 * 60

export type DerivedStatus = TaskStatus | 'overdue' | 'expired'

/**
 * A task is "expired" if it's still open (never taken) and past due date.
 */
export function isExpired(task: Task, now = new Date()): boolean {
  return task.status === 'open' && new Date(task.dueAt).getTime() < now.getTime()
}

/**
 * A task is "overdue" if it was taken (in_progress) but not completed by due date.
 */
export function isOverdue(task: Task, now = new Date()): boolean {
  return task.status === 'in_progress' && new Date(task.dueAt).getTime() < now.getTime()
}

/**
 * Check if task is past due (either expired or overdue).
 */
export function isPastDue(task: Task, now = new Date()): boolean {
  return task.status !== 'done' && new Date(task.dueAt).getTime() < now.getTime()
}

export function deriveStatus(task: Task, now = new Date()): DerivedStatus {
  if (isExpired(task, now)) return 'expired'
  if (isOverdue(task, now)) return 'overdue'
  return task.status
}

export function isDueSoon(task: Task, now = new Date(), thresholdHours = 48): boolean {
  if (task.status === 'done') return false
  const diffHours = (new Date(task.dueAt).getTime() - now.getTime()) / HOUR_MS
  return diffHours >= 0 && diffHours <= thresholdHours
}

export function isAtRisk(task: Task, now = new Date()): boolean {
  if (task.status === 'done') return false
  const diffHours = (new Date(task.dueAt).getTime() - now.getTime()) / HOUR_MS
  
  // Past due tasks are always at risk
  if (diffHours < 0) return true

  const isDueSoonWindow = diffHours >= 0 && diffHours <= 48
  const isCriticalWindow = diffHours >= 0 && diffHours <= 24
  const notTaken = task.status === 'open'
  const notInProgress = task.status !== 'in_progress'

  return (isDueSoonWindow && notTaken) || (isCriticalWindow && notInProgress)
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
  const pinned = tasks.filter((t) => t.isPinned)
  const active = tasks.filter((t) => !t.isPinned && t.status !== 'done')
  const done = tasks.filter((t) => !t.isPinned && t.status === 'done')

  const sortFn = (a: Task, b: Task) => new Date(a.dueAt).getTime() - new Date(b.dueAt).getTime()

  return [...pinned.sort(sortFn), ...active.sort(sortFn), ...done.sort(sortFn)]
}

export function filterMyTasks(tasks: Task[], userId: string | null): Task[] {
  if (!userId) return []
  // Only show tasks where user is a member (has claimed or joined)
  return sortByDue(tasks.filter((t) => t.members.includes(userId)))
}

export function filterOpen(tasks: Task[]): Task[] {
  return sortByDue(tasks.filter((t) => t.status === 'open'))
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

export function getCountdown(dueAt: string, now = new Date()): string {
  const diffMs = new Date(dueAt).getTime() - now.getTime()
  if (diffMs <= 0) return '0h 0m'
  
  const totalMinutes = Math.floor(diffMs / (1000 * 60))
  const hours = Math.floor(totalMinutes / 60)
  const mins = totalMinutes % 60
  
  return `${hours}h ${mins}m`
}

/**
 * Check if task can be nudged (3 hour cooldown)
 */
export function canNudge(task: Task, now = new Date()): boolean {
  if (!task.lastNudgedAt) return true
  const lastNudged = new Date(task.lastNudgedAt).getTime()
  const cooldownHours = 3
  const cooldownMs = cooldownHours * HOUR_MS
  return (now.getTime() - lastNudged) >= cooldownMs
}

/**
 * Get the time when the next nudge can be sent
 */
export function getNextNudgeTime(task: Task): Date | null {
  if (!task.lastNudgedAt) return null
  const lastNudged = new Date(task.lastNudgedAt).getTime()
  const cooldownHours = 3
  const cooldownMs = cooldownHours * HOUR_MS
  return new Date(lastNudged + cooldownMs)
}

