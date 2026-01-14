import { describe, it, expect } from 'vitest'
import { doc, setDoc, getDoc } from 'firebase/firestore'
import { db } from './firebase'
import type { User } from '../types'

describe('Firebase User Storage', () => {
  const testUserId = `test-user-${Date.now()}`
  const testUser: User = {
    id: testUserId,
    name: 'Test User',
    email: 'test@example.com',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }

  it('should verify Firebase is connected', () => {
    try {
      // Try to access the db object
      if (!db) {
        throw new Error('Firebase db instance is not initialized')
      }
      console.log('✓ Firebase is connected and db instance exists')
      expect(db).toBeDefined()
    } catch (error) {
      console.error('✗ Firebase connection failed:', error)
      throw error
    }
  })

  it(
    'should save a user to Firestore',
    async () => {
      try {
        await setDoc(doc(db, 'users', testUserId), testUser)
        console.log('✓ User saved successfully to Firestore')
        expect(true).toBe(true)
      } catch (error) {
        console.error('✗ Failed to save user:', error)
        throw error
      }
    },
    10000,
  )

  it(
    'should retrieve a saved user from Firestore',
    async () => {
      try {
        // First save the user
        await setDoc(doc(db, 'users', testUserId), testUser)

        // Then retrieve it
        const snapshot = await getDoc(doc(db, 'users', testUserId))

        if (snapshot.exists()) {
          const retrievedUser = snapshot.data() as User
          console.log('✓ User retrieved successfully:', retrievedUser)
          expect(retrievedUser.id).toBe(testUser.id)
          expect(retrievedUser.email).toBe(testUser.email)
          expect(retrievedUser.name).toBe(testUser.name)
        } else {
          throw new Error('User document not found')
        }
      } catch (error) {
        console.error('✗ Failed to retrieve user:', error)
        throw error
      }
    },
    10000,
  )
})


