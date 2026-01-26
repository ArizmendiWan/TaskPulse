import { useState, useEffect } from 'react'
import type { User, Project } from '../types'
import { getUserById } from '../lib/userUtils'

export const useUserCache = (projects: Project[]) => {
  const [userCache, setUserCache] = useState<Record<string, User>>({})

  const getUserName = (userId: string | null): string => {
    if (!userId) return 'Unknown'
    return userCache[userId]?.name || userId
  }

  useEffect(() => {
    const fetchUserDetails = async () => {
      const usersToFetch = new Set<string>()

      projects.forEach((project) => {
        project.members.forEach((memberId) => usersToFetch.add(memberId))
        project.tasks.forEach((task) => {
          if (task.creatorId) usersToFetch.add(task.creatorId)
          if (task.takenBy) usersToFetch.add(task.takenBy)
          // Handle both new (members) and legacy (owners) task structure
          const taskMembers = task.members || (task as unknown as { owners?: string[] }).owners || []
          taskMembers.forEach((memberId) => usersToFetch.add(memberId))
        })
      })

      for (const userId of usersToFetch) {
        if (!userCache[userId]) {
          try {
            const user = await getUserById(userId)
            if (user) {
              setUserCache((prev) => ({ ...prev, [userId]: user }))
            }
          } catch (err) {
            console.error('Failed to fetch user:', userId, err)
          }
        }
      }
    }

    if (projects.length > 0) {
      fetchUserDetails()
    }
  }, [projects])

  return { userCache, setUserCache, getUserName }
}



