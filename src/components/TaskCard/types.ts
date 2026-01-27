import type { Task, TaskStatus } from '../../types'

export interface TaskCardProps {
  task: Task
  expanded: boolean
  onToggleExpand: (taskId: string) => void
  onStatusChange: (task: Task, next: TaskStatus) => void
  onLeaveTask: (task: Task) => void
  onDueChange: (task: Task, next: string) => void
  onDescriptionChange: (task: Task, next: string) => void
  onAddComment: (task: Task, text: string) => void
  onUpdateComment: (task: Task, commentId: string, text: string) => void
  onDeleteComment: (task: Task, commentId: string) => void
  onDeleteTask: (task: Task) => void
  onNudge: (task: Task) => void
  onTogglePin: (task: Task) => void
  getUserName: (userId: string | null) => string
  onAssignMembers: (task: Task, memberIds: string[]) => void
  projectMembers: string[]
  nudgeFeedback: Record<string, 'sending' | 'sent' | 'error' | null>
  currentUserId: string | null
}

export interface TaskCardHeaderProps {
  task: Task
  onToggleExpand: (taskId: string) => void
  onTogglePin: (task: Task) => void
  getUserName: (userId: string | null) => string
  expanded: boolean
  expired: boolean
  overdue: boolean
  dueSoon: boolean
  hasClaimed: boolean
  memberNames: string[]
}

export interface TaskCardActionsProps {
  task: Task
  onLeaveTask: (task: Task) => void
  onStatusChange: (task: Task, next: TaskStatus) => void
  onAssignMembers: (task: Task, memberIds: string[]) => void
  projectMembers: string[]
  getUserName: (userId: string | null) => string
  canLeave: boolean
  isMember: boolean
  expired: boolean
}

export interface TaskStatusBadgesProps {
  task: Task
  onNudge: (task: Task) => void
  nudgeFeedback: Record<string, 'sending' | 'sent' | 'error' | null>
  isUnclaimed: boolean
  expired: boolean
  overdue: boolean
  dueSoon: boolean
}

export interface TaskCommentsProps {
  task: Task
  onAddComment: (task: Task, text: string) => void
  onUpdateComment: (task: Task, commentId: string, text: string) => void
  onDeleteComment: (task: Task, commentId: string) => void
  getUserName: (userId: string | null) => string
  currentUserId: string | null
}

export interface TaskActivityProps {
  task: Task
}

