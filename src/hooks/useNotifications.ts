import { useCallback, useEffect, useMemo, useState } from 'react'
import type { NotificationItem, NotificationType } from '../types'
import { loadNotifications, saveNotifications } from '../storage'
import { uuid } from '../constants'

const MAX_NOTIFICATIONS = 200

const hasNonEnglishChars = (value: string) => /[^\u0000-\u007f]/.test(value)

const pruneNotifications = (items: NotificationItem[]) => {
  const now = Date.now()
  return items.filter((item) => {
    if (!item.expiresAt) return true
    return new Date(item.expiresAt).getTime() > now
  }).filter((item) => !(hasNonEnglishChars(item.title) || hasNonEnglishChars(item.message)))
}

interface AddNotificationInput {
  type: NotificationType
  title: string
  message: string
  projectId?: string
  taskId?: string
  actorId?: string
  expiresAt?: string
}

export function useNotifications(userId: string | null, activeProjectId?: string | null) {
  const [notifications, setNotifications] = useState<NotificationItem[]>(() =>
    pruneNotifications(loadNotifications(userId)),
  )

  useEffect(() => {
    setNotifications(pruneNotifications(loadNotifications(userId)))
  }, [userId])

  useEffect(() => {
    saveNotifications(userId, notifications)
  }, [userId, notifications])

  const addNotification = useCallback((input: AddNotificationInput) => {
    const newItem: NotificationItem = {
      id: uuid(),
      type: input.type,
      title: input.title,
      message: input.message,
      createdAt: new Date().toISOString(),
      read: false,
      projectId: input.projectId,
      taskId: input.taskId,
      actorId: input.actorId,
      expiresAt: input.expiresAt,
    }

    setNotifications((prev) => {
      const next = [newItem, ...prev]
      const pruned = pruneNotifications(next)
      return pruned.slice(0, MAX_NOTIFICATIONS)
    })
  }, [])

  const markRead = useCallback((id: string) => {
    setNotifications((prev) => prev.map((item) => (item.id === id ? { ...item, read: true } : item)))
  }, [])

  const markAllRead = useCallback(() => {
    setNotifications((prev) => prev.map((item) => (item.read ? item : { ...item, read: true })))
  }, [])

  const clearRead = useCallback(() => {
    setNotifications((prev) => prev.filter((item) => !item.read))
  }, [])

  const visibleNotifications = useMemo(() => {
    if (!activeProjectId) return notifications
    return notifications.filter((item) => !item.projectId || item.projectId === activeProjectId)
  }, [notifications, activeProjectId])

  const unreadCount = useMemo(
    () => visibleNotifications.filter((item) => !item.read).length,
    [visibleNotifications],
  )

  return {
    notifications: visibleNotifications,
    unreadCount,
    addNotification,
    markRead,
    markAllRead,
    clearRead,
  }
}
