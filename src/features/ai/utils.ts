import type { Project } from '../../types'
import { deriveStatus, isDueSoon, isPastDue, formatDue } from '../../lib/taskUtils'

export const DEFAULT_SYSTEM_PROMPT = `You are TaskPulse AI, a concise project coach.

Style
- Reply in Markdown with short headings and 3–6 bullet/numbered steps.
- Start with the key answer, highlight dates and owners in **bold**.
- Keep replies under ~160 words unless the user asks for more.

What to do
- Surface overdue, at-risk, and unclaimed work; propose the next concrete move.
- If the user asks how to use TaskPulse, give a quick tour: post a task, set due date, claim/join/leave, update status, add comments, pin tasks, hide done, filters (All/Mine/Unclaimed/Due Soon/Overdue), send email nudges, copy/share invite link or QR, toggle dark mode, rename yourself in the sidebar.
- Offer practical, low-friction steps; avoid generic productivity advice.

Ground rules
- Only use features that exist in TaskPulse; do not invent new UI.
- If something is unclear, ask a brief clarifying question instead of guessing.`

/**
 * Generates a system prompt that combines base behavior + project snapshot.
 */
export function generateAiContextHint(
  project: Project,
  currentUserName: string | null,
  getUserName: (userId: string | null) => string,
  memberList: string[]
): string {
  const now = new Date()
  const tasks = project.tasks || []

  const byDue = [...tasks].sort(
    (a, b) => new Date(a.dueAt).getTime() - new Date(b.dueAt).getTime()
  )
  const taskLines = byDue.slice(0, 18).map((t) => {
    const derived = deriveStatus(t, now)
    const risk =
      isPastDue(t, now) ? 'OVERDUE' : isDueSoon(t, now) ? 'DUE SOON' : derived.toUpperCase()
    const owner = t.takenBy ? getUserName(t.takenBy) : 'Unclaimed'
    const helpers = t.members.filter((m) => m !== t.takenBy)
    const helperInfo = helpers.length ? ` | Helpers: ${helpers.map(getUserName).join(', ')}` : ''
    return `- ${t.title} — ${formatDue(t.dueAt)} • ${risk} • Owner: ${owner}${helperInfo}`
  })

  const overdueCount = tasks.filter((t) => isPastDue(t, now)).length
  const dueSoonCount = tasks.filter((t) => isDueSoon(t, now)).length
  const openCount = tasks.filter((t) => t.status === 'open').length
  const total = tasks.length

  const truncated =
    tasks.length > taskLines.length ? `(+${tasks.length - taskLines.length} more tasks)` : ''

  const members = memberList.map((id) => getUserName(id)).join(', ') || 'No members'

  return `${DEFAULT_SYSTEM_PROMPT}

Project snapshot
- Project: ${project.name}
- You are: ${currentUserName || 'Unknown'}
- Members: ${members}
- Stats: Total ${total}, Overdue ${overdueCount}, Due soon ${dueSoonCount}, Unclaimed ${openCount}

Tasks (by due date) ${truncated}
${taskLines.join('\n') || 'No tasks yet.'}`
}
