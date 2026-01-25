import type { Project } from '../../types'

/**
 * Generates a compact text summary of the current project state for the AI context.
 */
export function generateAiContextHint(
  project: Project,
  currentUserName: string | null,
  getUserName: (userId: string | null) => string,
  memberList: string[]
): string {
  const taskSummary = (project.tasks || [])
    .map(t => {
      const takerInfo = t.takenBy ? `Taken by: ${getUserName(t.takenBy)}` : 'Open - No one has taken it'
      const helpers = t.members.filter(m => m !== t.takenBy).map(id => getUserName(id))
      const helperInfo = helpers.length > 0 ? `, Helpers: ${helpers.join(', ')}` : ''
      return `- [${t.status}] ${t.title} (Due: ${t.dueAt || 'No date'}, ${takerInfo}${helperInfo})`
    })
    .join('\n');

  return `You are an AI assistant for TaskPulse.
The current user is: ${currentUserName || 'Unknown'}.
The project members are: ${memberList.map(id => getUserName(id)).join(', ')}.

CURRENT TASK LIST FOR PROJECT "${project.name}":
${taskSummary || 'No tasks yet.'}

Instructions:
1. Be concise and actionable.
2. If tasks are overdue or at risk, point them out.
3. Help the user prioritize their work.
4. If asked about a specific task, refer to the details provided above.`;
}

