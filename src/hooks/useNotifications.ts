import { useCallback, useEffect, useMemo, useState } from 'react'
import type { NotificationItem } from '../types'
import {
  subscribeToNotifications,
  markNotificationRead,
  markAllNotificationsRead,
  clearReadNotifications,
} from '../lib/notificationUtils'

export function useNotifications(userId: string | null, activeProjectId?: string | null) {
  const [notifications, setNotifications] = useState<NotificationItem[]>([])

  // Subscribe to real-time Firestore notifications
  useEffect(() => {
    if (!userId) {
      console.log('[useNotifications] No userId, clearing notifications')
      setNotifications([])
      return
    }

    console.log('[useNotifications] Setting up subscription for user:', userId)

    let isActive = true
    const unsubscribe = subscribeToNotifications(userId, (items) => {
      if (!isActive) {
        console.warn('[useNotifications] Received callback after unmount, ignoring')
        return
      }
      console.log('[useNotifications] Received', items.length, 'notifications:', items.map(i => ({ id: i.id, title: i.title, read: i.read })))
      setNotifications(items)
    })

    return () => {
      console.log('[useNotifications] Cleaning up subscription for user:', userId)
      isActive = false
      unsubscribe()
    }
  }, [userId])

  const markRead = useCallback(async (id: string) => {
    // Optimistic update
    setNotifications((prev) => prev.map((item) => (item.id === id ? { ...item, read: true } : item)))
    try {
      await markNotificationRead(id)
    } catch (err) {
      console.error('Failed to mark notification as read:', err)
    }
  }, [])

  const markAllRead = useCallback(async () => {
    if (!userId) return
    // Optimistic update
    setNotifications((prev) => prev.map((item) => (item.read ? item : { ...item, read: true })))
    try {
      await markAllNotificationsRead(userId)
    } catch (err) {
      console.error('Failed to mark all notifications as read:', err)
    }
  }, [userId])

  const clearRead = useCallback(async () => {
    if (!userId) return
    // Optimistic update
    setNotifications((prev) => prev.filter((item) => !item.read))
    try {
      await clearReadNotifications(userId)
    } catch (err) {
      console.error('Failed to clear read notifications:', err)
    }
  }, [userId])

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
    allNotifications: notifications,
    unreadCount,
    totalUnreadCount: notifications.filter((item) => !item.read).length,
    markRead,
    markAllRead,
    clearRead,
  }
}
