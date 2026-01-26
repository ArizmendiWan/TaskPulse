import { useState, useEffect, useMemo } from 'react'
import { doc, onSnapshot, setDoc, getDoc, deleteDoc } from 'firebase/firestore'
import { db } from '../lib/firebase'
import type { Project } from '../types'
import { saveProjects } from '../storage'
import { getUserProjects } from '../lib/userUtils'
import { migrateProject, projectNeedsMigration } from '../lib/taskMigration'

/**
 * Helper to migrate a project and optionally persist the migration
 */
function migrateAndPersist(project: Project, shouldPersist = true): Project {
  if (!projectNeedsMigration(project)) {
    return project
  }
  
  const migrated = migrateProject(project)
  
  // Persist the migrated data back to Firebase
  if (shouldPersist) {
    setDoc(doc(db, 'projects', migrated.id), migrated).catch((err) =>
      console.warn('Failed to persist migrated project:', err)
    )
  }
  
  return migrated
}

export const useProjects = (currentUserId: string | null, initialProjectId: string | null) => {
  const [projects, setProjects] = useState<Project[]>([])
  const [activeProjectId, setActiveProjectId] = useState<string | null>(initialProjectId)
  const [isLoadingProject, setIsLoadingProject] = useState(!!initialProjectId)

  const activeProject = useMemo(
    () => projects.find((p) => p.id === activeProjectId) ?? null,
    [projects, activeProjectId],
  )

  const userProjects = useMemo(
    () =>
      currentUserId
        ? projects.filter((p) => p.ownerId === currentUserId || p.members.includes(currentUserId))
        : [],
    [projects, currentUserId],
  )

  // Cache projects to localStorage
  useEffect(() => {
    if (currentUserId && projects.length > 0) {
      saveProjects(projects)
    }
  }, [projects, currentUserId])

  // Firebase Real-time Sync for active project
  useEffect(() => {
    if (!activeProjectId) return

    const docRef = doc(db, 'projects', activeProjectId)
    const unsubscribe = onSnapshot(docRef, (snapshot) => {
      setIsLoadingProject(false)
      if (snapshot.exists()) {
        const rawData = snapshot.data() as Project
        const data = migrateAndPersist(rawData)
        setProjects((prev) => {
          const exists = prev.some((p) => p.id === data.id)
          if (exists) {
            const existing = prev.find((p) => p.id === data.id)
            if (JSON.stringify(existing) === JSON.stringify(data)) return prev
            return prev.map((p) => (p.id === data.id ? data : p))
          }
          return [...prev, data]
        })
      }
    })

    return () => unsubscribe()
  }, [activeProjectId])

  // Handle joining via link
  useEffect(() => {
    if (initialProjectId && !projects.find((p) => p.id === initialProjectId)) {
      const fetchProject = async () => {
        try {
          const docRef = doc(db, 'projects', initialProjectId)
          const snap = await getDoc(docRef)
          if (snap.exists()) {
            const rawData = snap.data() as Project
            const data = migrateAndPersist(rawData)
            setProjects((prev) => {
              if (prev.find((p) => p.id === data.id)) return prev
              return [...prev, data]
            })
          }
        } catch (err) {
          console.error('Failed to fetch project from Firebase', err)
        } finally {
          setIsLoadingProject(false)
        }
      }
      fetchProject()
    }
  }, [initialProjectId, projects])

  // Load user projects when logged in
  useEffect(() => {
    if (!currentUserId) return

    const load = async () => {
      try {
        const rawUserProjects = await getUserProjects(currentUserId)
        // Migrate all loaded projects
        const migratedProjects = rawUserProjects.map((p) => migrateAndPersist(p))
        setProjects((prev) => {
          const merged = [...prev]
          migratedProjects.forEach((up) => {
            if (!merged.some((p) => p.id === up.id)) {
              merged.push(up)
            }
          })
          return merged
        })
      } catch (err) {
        console.error('Failed to load user projects:', err)
      }
    }

    load()
  }, [currentUserId])

  const upsertProject = (mapper: (project: Project) => Project) => {
    setProjects((prev) => {
      const next = prev.map((p) => (p.id === activeProjectId ? mapper(p) : p))
      const updated = next.find((p) => p.id === activeProjectId)
      if (updated) {
        setDoc(doc(db, 'projects', updated.id), updated).catch((err) =>
          console.error('Firebase sync error:', err),
        )
      }
      return next
    })
  }

  const upsertProjectAsyncById = async (projectId: string, mapper: (project: Project) => Project) => {
    return new Promise<Project | null>((resolve) => {
      setProjects((prev) => {
        const next = prev.map((p) => (p.id === projectId ? mapper(p) : p))
        const updated = next.find((p) => p.id === projectId)
        if (updated) {
          setDoc(doc(db, 'projects', updated.id), updated)
            .then(() => resolve(updated))
            .catch((err) => {
              console.error('Firebase sync error:', err)
              resolve(null)
            })
        } else {
          resolve(null)
        }
        return next
      })
    })
  }

  const deleteProject = async (id: string) => {
    setProjects((prev) => prev.filter((p) => p.id !== id))
    await deleteDoc(doc(db, 'projects', id))
  }

  const addProject = async (project: Project) => {
    setProjects((prev) => [...prev, project])
    await setDoc(doc(db, 'projects', project.id), project)
  }

  return {
    projects,
    setProjects,
    activeProjectId,
    setActiveProjectId,
    activeProject,
    userProjects,
    isLoadingProject,
    setIsLoadingProject,
    upsertProject,
    upsertProjectAsyncById,
    deleteProject,
    addProject,
  }
}



