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

export interface Comment {
  id: string
  authorId: string
  text: string
  createdAt: string
  updatedAt: string
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
  comments?: Comment[]
  isPinned?: boolean
  createdAt: string
  updatedAt: string
}

export interface Project {
  id: string
  name: string
  course: string | null
  members: string[]
  tasks: Task[]
  createdAt: string
  ownerId: string | null
}

export interface User {
  id: string
  name: string
  email: string
  createdAt: string
  updatedAt: string
}

