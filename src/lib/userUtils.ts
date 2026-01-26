import { doc, setDoc, collection, query, where, getDocs, getDoc } from 'firebase/firestore'
import { db } from './firebase'
import type { User, Project } from '../types'

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

/**
 * Find a user by email in Firestore
 */
export async function getUserByEmail(email: string): Promise<User | null> {
  try {
    const usersRef = collection(db, 'users')
    const q = query(usersRef, where('email', '==', email))

    const querySnapshot = await getDocs(q)

    if (querySnapshot.empty) {
      console.log('No user found with email:', email)
      return null
    }

    const userData = querySnapshot.docs[0].data() as User
    console.log('User found:', userData.id)
    return userData
  } catch (error) {
    console.error('Failed to fetch user by email:', error)
    throw error
  }
}

/**
 * Fetch a user by ID from Firestore
 */
export async function getUserById(userId: string): Promise<User | null> {
  try {
    // Users are stored with document id === user.id (see saveUser()).
    // Using getDoc is faster and avoids index/field mismatch issues.
    const snap = await getDoc(doc(db, 'users', userId))
    if (!snap.exists()) {
      console.log('No user found with id:', userId)
      return null
    }
    return snap.data() as User
  } catch (error) {
    console.error('Failed to fetch user by id:', error)
    throw error
  }
}

/**
 * Fetch all projects belonging to a user (as owner or member)
 */
export async function getUserProjects(userId: string): Promise<Project[]> {
  try {
    const projectsRef = collection(db, 'projects')
    
    // Query projects where user is owner
    const ownerQuery = query(projectsRef, where('ownerId', '==', userId))
    const ownerSnapshot = await getDocs(ownerQuery)
    
    // Query projects where user is a member
    const memberQuery = query(projectsRef, where('members', 'array-contains', userId))
    const memberSnapshot = await getDocs(memberQuery)
    
    // Combine results and remove duplicates
    const projectsMap = new Map<string, Project>()
    
    ownerSnapshot.docs.forEach((doc) => {
      projectsMap.set(doc.id, doc.data() as Project)
    })
    
    memberSnapshot.docs.forEach((doc) => {
      projectsMap.set(doc.id, doc.data() as Project)
    })
    
    const projects = Array.from(projectsMap.values())
    console.log(`Fetched ${projects.length} projects for user ${userId}`)
    return projects
  } catch (error) {
    console.error('Failed to fetch user projects:', error)
    throw error
  }
}
