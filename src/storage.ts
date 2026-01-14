import type { Project } from './types'

const PROJECTS_KEY = 'taskpulse.projects.v1'

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

export function loadMemberName(): string {
  // Member names are managed in component state
  return ''
}

export function saveMemberName() {
  // Member names are managed in component state
  return
}