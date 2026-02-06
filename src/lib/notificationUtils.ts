import {
  collection,
  addDoc,
  query,
  where,
  limit,
  onSnapshot,
  doc,
  updateDoc,
  writeBatch,
  getDocs,
  type Unsubscribe,
} from 'firebase/firestore'
import { db } from './firebase'
import type { NotificationItem } from '../types'

const NOTIFICATIONS_COLLECTION = 'notifications'
const MAX_VISIBLE = 50

/**
 * Send an in-app notification to a specific user.
 * Creates a document in Firestore that the recipient will pick up via real-time listener.
 */
export async function sendInAppNotification(notification: Omit<NotificationItem, 'id'>): Promise<string> {
  try {
    const docRef = await addDoc(collection(db, NOTIFICATIONS_COLLECTION), notification)
    console.log('[notifications] sent notification:', docRef.id)
    return docRef.id
  } catch (err) {
    console.error('[notifications] failed to send notification:', err)
    throw err
  }
}

/**
 * Send in-app notifications to multiple recipients (e.g. all task members).
 */
export async function sendInAppNotifications(
  recipientIds: string[],
  base: Omit<NotificationItem, 'id' | 'recipientId'>,
): Promise<void> {
  try {
    console.log('[notifications] Preparing to send to recipients:', recipientIds)
    const batch = writeBatch(db)
    
    for (const recipientId of recipientIds) {
      const docRef = doc(collection(db, NOTIFICATIONS_COLLECTION))
      const notification = { ...base, recipientId }
      console.log('[notifications] Adding notification for recipient:', recipientId, 'data:', { title: notification.title, message: notification.message.substring(0, 50) + '...' })
      batch.set(docRef, notification)
    }
    
    console.log('[notifications] Committing batch...')
    await batch.commit()
    console.log('[notifications] ✅ Batch committed successfully to', recipientIds.length, 'recipients')
  } catch (err: any) {
    console.error('[notifications] ❌ Batch send failed:', err)
    console.error('[notifications] Error code:', err?.code)
    console.error('[notifications] Error message:', err?.message)
    
    // If permission denied, provide helpful error message
    if (err?.code === 'permission-denied') {
      console.error(
        '[notifications] PERMISSION DENIED: Firestore security rules are blocking writes to the notifications collection.',
      )
      console.error(
        '[notifications] You need to add rules to allow writes. Example:',
      )
      console.error(
        `match /notifications/{notificationId} {
  allow read: if true; // or add proper auth checks
  allow write: if true; // or add proper auth checks
}`,
      )
    }
    throw err
  }
}

/**
 * Subscribe to real-time notifications for a user.
 * Returns an unsubscribe function.
 *
 * NOTE: We intentionally avoid `orderBy` in the Firestore query to prevent
 * requiring a composite index (which must be created manually in the Firebase console).
 * Instead we sort by `createdAt` descending on the client side.
 */
export function subscribeToNotifications(
  userId: string,
  callback: (notifications: NotificationItem[]) => void,
): Unsubscribe {
  const q = query(
    collection(db, NOTIFICATIONS_COLLECTION),
    where('recipientId', '==', userId),
    limit(MAX_VISIBLE),
  )

  console.log('[notifications] Setting up real-time listener for user:', userId)

  return onSnapshot(
    q,
    (snapshot) => {
      console.log('[notifications] Snapshot received:', {
        size: snapshot.size,
        hasPendingWrites: snapshot.metadata.hasPendingWrites,
        fromCache: snapshot.metadata.fromCache,
      })
      
      const items: NotificationItem[] = snapshot.docs.map((d) => {
        const data = d.data() as Omit<NotificationItem, 'id'>
        return {
          ...data,
          id: d.id,
        }
      })
      
      // Sort client-side: newest first
      items.sort((a, b) => (b.createdAt || '').localeCompare(a.createdAt || ''))
      
      console.log('[notifications] Processed', items.length, 'notifications, calling callback')
      callback(items)
    },
    (error) => {
      console.error('[notifications] Real-time listener error:', error)
      console.error('[notifications] Error code:', error.code)
      console.error('[notifications] Error message:', error.message)
      
      // If the error message contains an index creation URL, log it prominently
      if (error.message?.includes('index')) {
        console.error(
          '[notifications] A Firestore index may be required. Check the URL in the error above to create it.',
        )
      }
      
      // If permission denied, this is likely a Firestore security rules issue
      if (error.code === 'permission-denied') {
        console.error(
          '[notifications] PERMISSION DENIED: Firestore security rules are blocking access to the notifications collection.',
        )
        console.error(
          '[notifications] You need to add rules to allow reads/writes. Example:',
        )
        console.error(
          `match /notifications/{notificationId} {
  allow read: if request.auth != null && resource.data.recipientId == request.auth.uid;
  allow write: if request.auth != null;
}`,
        )
      }
    },
  )
}

/**
 * Mark a single notification as read.
 */
export async function markNotificationRead(notificationId: string): Promise<void> {
  try {
    await updateDoc(doc(db, NOTIFICATIONS_COLLECTION, notificationId), { read: true })
  } catch (err) {
    console.error('[notifications] failed to mark read:', err)
    throw err
  }
}

/**
 * Mark all unread notifications as read for a user.
 */
export async function markAllNotificationsRead(userId: string): Promise<void> {
  try {
    const q = query(
      collection(db, NOTIFICATIONS_COLLECTION),
      where('recipientId', '==', userId),
      where('read', '==', false),
    )
    const snapshot = await getDocs(q)
    if (snapshot.empty) return

    const batch = writeBatch(db)
    snapshot.docs.forEach((d) => batch.update(d.ref, { read: true }))
    await batch.commit()
  } catch (err) {
    console.error('[notifications] failed to mark all read:', err)
    throw err
  }
}

/**
 * Delete all read notifications for a user.
 */
export async function clearReadNotifications(userId: string): Promise<void> {
  try {
    const q = query(
      collection(db, NOTIFICATIONS_COLLECTION),
      where('recipientId', '==', userId),
      where('read', '==', true),
    )
    const snapshot = await getDocs(q)
    if (snapshot.empty) return

    const batch = writeBatch(db)
    snapshot.docs.forEach((d) => batch.delete(d.ref))
    await batch.commit()
  } catch (err) {
    console.error('[notifications] failed to clear read:', err)
    throw err
  }
}
