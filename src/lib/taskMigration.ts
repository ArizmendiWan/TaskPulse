import type { Project, Task, TaskStatus, ActivityItem } from '../types'

/**
 * Legacy task format (pre-migration)
 */
interface LegacyTask {
  id: string
  title: string
  description: string
  dueAt: string
  owners?: string[]
  difficulty?: string
  status: string
  activity: Array<{
    id: string
    type: string
    note?: string
    at: string
  }>
  comments?: Array<{
    id: string
    authorId: string
    text: string
    createdAt: string
    updatedAt: string
  }>
  isPinned?: boolean
  createdAt: string
  updatedAt: string
  // New fields (may or may not exist)
  creatorId?: string
  members?: string[]
  takenBy?: string | null
}

/**
 * Converts old status values to new status values
 */
function migrateStatus(oldStatus: string, hasOwners: boolean): TaskStatus {
  switch (oldStatus) {
    case 'unassigned':
      return 'open'
    case 'not_started':
      // If it had owners but was "not_started", treat as in_progress since someone was assigned
      return hasOwners ? 'in_progress' : 'open'
    case 'in_progress':
      return 'in_progress'
    case 'done':
      return 'done'
    default:
      // For any unknown status, default based on whether it has owners
      return hasOwners ? 'in_progress' : 'open'
  }
}

/**
 * Migrates a single task from old format to new format
 */
export function migrateTask(task: LegacyTask, projectOwnerId: string | null): Task {
  // If task already has new format fields, it's already migrated
  if (task.creatorId !== undefined && task.members !== undefined && task.takenBy !== undefined) {
    return task as unknown as Task
  }

  const legacyOwners = task.owners || []
  const hasOwners = legacyOwners.length > 0

  // Determine creator: use first owner if available, otherwise project owner, otherwise 'unknown'
  const creatorId = task.creatorId || legacyOwners[0] || projectOwnerId || 'unknown'

  // Determine takenBy: if there were owners, the first one is the "taker"
  const takenBy = task.takenBy !== undefined ? task.takenBy : (hasOwners ? legacyOwners[0] : null)

  // Members: all owners become members
  const members = task.members !== undefined ? task.members : legacyOwners

  // Migrate status
  const newStatus = migrateStatus(task.status, hasOwners)

  // Build the migrated task, excluding undefined optional fields for Firebase compatibility
  const migratedTask: Task = {
    id: task.id,
    title: task.title,
    description: task.description,
    dueAt: task.dueAt,
    creatorId,
    members,
    takenBy,
    status: newStatus,
    activity: (task.activity || []) as ActivityItem[],
    createdAt: task.createdAt,
    updatedAt: task.updatedAt,
  }

  // Only add optional fields if they have values (Firebase doesn't accept undefined)
  if (task.comments !== undefined) {
    migratedTask.comments = task.comments
  }
  if (task.isPinned !== undefined) {
    migratedTask.isPinned = task.isPinned
  }

  return migratedTask
}

/**
 * Migrates all tasks in a project from old format to new format
 */
export function migrateProject(project: Project): Project {
  const migratedTasks = project.tasks.map((task) => 
    migrateTask(task as unknown as LegacyTask, project.ownerId)
  )

  return {
    ...project,
    tasks: migratedTasks,
  }
}

/**
 * Checks if a task needs migration
 */
export function needsMigration(task: unknown): boolean {
  const t = task as LegacyTask
  return t.creatorId === undefined || t.members === undefined || t.takenBy === undefined
}

/**
 * Checks if any task in a project needs migration
 */
export function projectNeedsMigration(project: Project): boolean {
  return project.tasks.some((task) => needsMigration(task))
}

