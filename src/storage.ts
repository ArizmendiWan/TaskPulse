import type { NotificationItem, Project } from './types'

const PROJECTS_KEY = 'taskpulse.projects.v1'
const USER_ID_KEY = 'taskpulse.user_id.v1'
const USER_NAME_KEY = 'taskpulse.user_name.v1'
const NOTIFICATIONS_KEY = 'taskpulse.notifications.v1'

export function loadProjects(): Project[] {
  if (typeof localStorage === 'undefined') return []
  try {
    const raw = localStorage.getItem(PROJECTS_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw) as Project[]
    return Array.isArray(parsed) ? parsed : []
  } catch (err) {
    console.warn('Failed to read projects from storage', err)
    return []
  }
}

export function saveProjects(projects: Project[]) {
  if (typeof localStorage === 'undefined') return
  try {
    localStorage.setItem(PROJECTS_KEY, JSON.stringify(projects))
  } catch (err) {
    console.warn('Failed to save projects to storage', err)
  }
}

export function clearProjects() {
  if (typeof localStorage === 'undefined') return
  try {
    localStorage.removeItem(PROJECTS_KEY)
  } catch (err) {
    console.warn('Failed to clear projects', err)
  }
}

export function loadMemberId(): string | null {
  if (typeof localStorage === 'undefined') return null
  return localStorage.getItem(USER_ID_KEY)
}

export function loadMemberName(): string | null {
  if (typeof localStorage === 'undefined') return null
  return localStorage.getItem(USER_NAME_KEY)
}

export function saveMemberInfo(id: string | null, name: string | null) {
  if (typeof localStorage === 'undefined') return
  try {
    if (id) localStorage.setItem(USER_ID_KEY, id)
    else localStorage.removeItem(USER_ID_KEY)

    if (name) localStorage.setItem(USER_NAME_KEY, name)
    else localStorage.removeItem(USER_NAME_KEY)
  } catch (err) {
    console.warn('Failed to save member info', err)
  }
}

function getNotificationsKey(userId: string | null) {
  return userId ? `${NOTIFICATIONS_KEY}.${userId}` : `${NOTIFICATIONS_KEY}.anon`
}

export function loadNotifications(userId: string | null): NotificationItem[] {
  if (typeof localStorage === 'undefined') return []
  try {
    const raw = localStorage.getItem(getNotificationsKey(userId))
    if (!raw) return []
    const parsed = JSON.parse(raw) as NotificationItem[]
    return Array.isArray(parsed) ? parsed : []
  } catch (err) {
    console.warn('Failed to read notifications from storage', err)
    return []
  }
}

export function saveNotifications(userId: string | null, notifications: NotificationItem[]) {
  if (typeof localStorage === 'undefined') return
  try {
    localStorage.setItem(getNotificationsKey(userId), JSON.stringify(notifications))
  } catch (err) {
    console.warn('Failed to save notifications to storage', err)
  }
}