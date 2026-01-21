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
    .map(t => `- [${t.status}] ${t.title} (Due: ${t.dueAt || 'No date'}, Owner: ${t.owners.map(id => getUserName(id)).join(', ') || 'Unassigned'})`)
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

