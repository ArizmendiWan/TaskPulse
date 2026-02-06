// Email service to send nudge emails via Vercel API route
export interface NudgeEmailPayload {
  taskTitle: string
  dueAt: string
  recipientEmails: string[]
  senderName: string
  message?: string
}

export async function sendNudgeEmails(payload: NudgeEmailPayload): Promise<void> {
  try {
    const response = await fetch('/api/send-nudge', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })

    if (!response.ok) {
      const errorText = await response.text().catch(() => 'Failed to send nudge emails.')
      throw new Error(errorText)
    }
  } catch (error) {
    console.error('Failed to send nudge emails:', error)
    throw error
  }
}
