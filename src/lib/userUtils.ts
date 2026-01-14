import { doc, setDoc } from 'firebase/firestore'
import { db } from './firebase'
import type { User } from '../types'

/**
 * Save a user to Firestore
 */
export async function saveUser(user: User): Promise<void> {
  try {
    await setDoc(doc(db, 'users', user.id), user)
    console.log('User saved successfully:', user.id)
  } catch (error) {
    console.error('Failed to save user to Firestore:', error)
    throw error
  }
}
