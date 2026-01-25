import { beforeEach, describe, expect, it, vi } from 'vitest'
import {
  deriveStatus,
  filterDueSoon,
  filterMyTasks,
  filterOpen,
  isDueSoon,
  isExpired,
  isOverdue,
  sortByDue,
} from '../lib/taskUtils'
import type { Task } from '../types'

const baseTask: Task = {
  id: 't1',
  title: 'Sample',
  description: '',
  dueAt: '2025-01-02T00:00',
  creatorId: 'creator1',
  members: [],
  takenBy: null,
  status: 'open',
  activity: [],
  createdAt: '2025-01-01T00:00',
  updatedAt: '2025-01-01T00:00',
}

const now = new Date('2025-01-01T00:00:00Z')

beforeEach(() => {
  vi.useFakeTimers()
  vi.setSystemTime(now)
})

describe('task utils', () => {
  it('detects expired tasks (open and past due)', () => {
    const task: Task = { ...baseTask, dueAt: '2024-12-30T00:00:00Z', status: 'open' }
    expect(isExpired(task)).toBe(true)
    expect(deriveStatus(task)).toBe('expired')
  })

  it('detects overdue tasks (in_progress and past due)', () => {
    const task: Task = { ...baseTask, dueAt: '2024-12-30T00:00:00Z', status: 'in_progress', takenBy: 'user1' }
    expect(isOverdue(task)).toBe(true)
    expect(deriveStatus(task)).toBe('overdue')
  })

  it('detects due soon tasks within 48h', () => {
    const task: Task = { ...baseTask, dueAt: '2025-01-01T12:00' }
    expect(isDueSoon(task)).toBe(true)
  })

  it('does not mark done tasks as due soon', () => {
    const task: Task = { ...baseTask, dueAt: '2025-01-01T12:00', status: 'done' }
    expect(isDueSoon(task)).toBe(false)
  })

  it('filters by user involvement (creator, taker, or member)', () => {
    const tasks: Task[] = [
      { ...baseTask, id: '1', creatorId: 'Alex', status: 'open' },
      { ...baseTask, id: '2', creatorId: 'other', takenBy: 'Mei', status: 'in_progress' },
      { ...baseTask, id: '3', creatorId: 'other', members: ['Alex'], status: 'in_progress', takenBy: 'someone' },
    ]
    expect(filterMyTasks(tasks, 'Alex')).toHaveLength(2) // creator of 1, member of 3
    expect(filterMyTasks(tasks, 'Mei')).toHaveLength(1) // taker of 2
  })

  it('filters open tasks', () => {
    const tasks: Task[] = [
      { ...baseTask, id: '1', status: 'open' },
      { ...baseTask, id: '2', status: 'in_progress', takenBy: 'user1' },
      { ...baseTask, id: '3', status: 'open' },
    ]
    expect(filterOpen(tasks)).toHaveLength(2)
  })

  it('filters due soon tasks', () => {
    const tasks: Task[] = [
      { ...baseTask, id: '1', dueAt: '2025-01-01T12:00', status: 'open' },
      { ...baseTask, id: '2', dueAt: '2025-02-01T12:00', status: 'open' },
    ]
    expect(filterDueSoon(tasks)).toHaveLength(1)
  })

  it('sorts tasks by due date ascending (earliest first)', () => {
    const tasks: Task[] = [
      { ...baseTask, id: '1', dueAt: '2025-01-01T12:00' },
      { ...baseTask, id: '2', dueAt: '2025-01-05T12:00' },
      { ...baseTask, id: '3', dueAt: '2025-01-03T12:00' },
    ]
    const sorted = sortByDue(tasks)
    expect(sorted[0].id).toBe('1') // Jan 1
    expect(sorted[1].id).toBe('3') // Jan 3
    expect(sorted[2].id).toBe('2') // Jan 5
  })
})
