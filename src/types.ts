export type TaskStatus = 'open' | 'in_progress' | 'done'

export type ActivityType =
  | 'created'
  | 'status_changed'
  | 'member_joined'
  | 'member_left'
  | 'task_taken'
  | 'due_changed'
  | 'title_changed'
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
  creatorId: string
  members: string[] // people who have joined the task
  takenBy: string | null // the person who took responsibility
  status: TaskStatus
  activity: ActivityItem[]
  comments?: Comment[]
  isPinned?: boolean
  lastNudgedAt?: string // timestamp of last nudge sent
  doneAt?: string // timestamp when task was marked done
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

export type NotificationType = 'info' | 'success' | 'warning' | 'error'

export interface NotificationItem {
  id: string
  recipientId: string
  type: NotificationType
  title: string
  message: string
  createdAt: string
  read: boolean
  projectId?: string
  taskId?: string
  actorId?: string
  senderName?: string
  expiresAt?: string
}

