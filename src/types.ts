export type TaskDifficulty = 'S' | 'M' | 'L' | ''
export type TaskStatus = 'unassigned' | 'not_started' | 'in_progress' | 'done'

export type ActivityType =
  | 'created'
  | 'status_changed'
  | 'owner_changed'
  | 'due_changed'
  | 'description_changed'

export interface ActivityItem {
  id: string
  type: ActivityType
  note?: string
  at: string
}

export interface Task {
  id: string
  title: string
  description: string
  dueAt: string
  owners: string[]
  difficulty: TaskDifficulty
  status: TaskStatus
  activity: ActivityItem[]
  createdAt: string
  updatedAt: string
}

export interface Project {
  id: string
  name: string
  course?: string
  members: string[]
  tasks: Task[]
  createdAt: string
}

