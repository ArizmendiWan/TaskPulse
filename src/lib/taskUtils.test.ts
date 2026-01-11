import { beforeEach, describe, expect, it, vi } from 'vitest'
import {
  deriveStatus,
  filterAtRisk,
  filterDueSoon,
  filterMyTasks,
  filterOverdue,
  isAtRisk,
  isDueSoon,
  isOverdue,
} from './taskUtils'
import type { Task } from '../types'

const baseTask: Task = {
  id: 't1',
  title: 'Sample',
  description: '',
  dueAt: '2025-01-02T00:00',
  owners: [],
  difficulty: '',
  status: 'unassigned',
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
  it('detects overdue tasks', () => {
    const task: Task = { ...baseTask, dueAt: '2024-12-30T00:00:00Z', status: 'not_started' }
    expect(isOverdue(task)).toBe(true)
    expect(deriveStatus(task)).toBe('overdue')
  })

  it('detects due soon tasks within 48h', () => {
    const task: Task = { ...baseTask, dueAt: '2025-01-01T12:00' }
    expect(isDueSoon(task)).toBe(true)
  })

  it('marks at risk when unstarted and due soon', () => {
    const task: Task = { ...baseTask, dueAt: '2025-01-01T18:00', status: 'unassigned' }
    expect(isAtRisk(task)).toBe(true)
  })

  it('marks at risk when within 24h and not in progress', () => {
    const task: Task = { ...baseTask, dueAt: '2025-01-01T10:00', status: 'not_started' }
    expect(isAtRisk(task)).toBe(true)
  })

  it('does not mark at risk when in progress inside 24h window', () => {
    const task: Task = { ...baseTask, dueAt: '2025-01-01T10:00', status: 'in_progress' }
    expect(isAtRisk(task)).toBe(false)
  })

  it('filters by owner and overdue', () => {
    const tasks: Task[] = [
      { ...baseTask, id: '1', owners: ['Alex'], status: 'not_started' },
      { ...baseTask, id: '2', owners: ['Mei'], status: 'not_started', dueAt: '2024-12-30T00:00' },
    ]
    expect(filterMyTasks(tasks, 'Alex')).toHaveLength(1)
    expect(filterOverdue(tasks)).toHaveLength(1)
  })

  it('filters due soon and at risk collections', () => {
    const tasks: Task[] = [
      { ...baseTask, id: '1', dueAt: '2025-01-01T12:00', status: 'unassigned' },
      { ...baseTask, id: '2', dueAt: '2025-02-01T12:00', status: 'not_started' },
    ]
    expect(filterDueSoon(tasks)).toHaveLength(1)
    expect(filterAtRisk(tasks)).toHaveLength(1)
  })
})

