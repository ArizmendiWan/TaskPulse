import type { Project } from './types'

const PROJECTS_KEY = 'taskpulse.projects.v1'
const MEMBER_KEY_PREFIX = 'taskpulse.member.'

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

export function loadMemberName(projectId: string | null): string {
  if (!projectId || typeof localStorage === 'undefined') return ''
  return localStorage.getItem(`${MEMBER_KEY_PREFIX}${projectId}`) ?? ''
}

export function saveMemberName(projectId: string | null, name: string) {
  if (!projectId || typeof localStorage === 'undefined') return
  try {
    localStorage.setItem(`${MEMBER_KEY_PREFIX}${projectId}`, name)
  } catch (err) {
    console.warn('Failed to save member name', err)
  }
}

