import nodemailer from 'nodemailer'

type NudgeEmailPayload = {
  taskTitle: string
  dueAt: string
  recipientEmails: string[]
  senderName: string
  message?: string
}

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method Not Allowed' })
    return
  }

  const { taskTitle, dueAt, recipientEmails, senderName, message } = (req.body || {}) as NudgeEmailPayload

  if (!taskTitle || !dueAt || !senderName || !Array.isArray(recipientEmails)) {
    res.status(400).json({ error: 'Invalid request payload.' })
    return
  }

  const recipients = recipientEmails.filter((email) => typeof email === 'string' && email.trim())
  if (recipients.length === 0) {
    res.status(400).json({ error: 'No recipient emails provided.' })
    return
  }

  const gmailUser = process.env.GMAIL_USER
  const gmailPassword = process.env.GMAIL_APP_PASSWORD

  if (!gmailUser || !gmailPassword) {
    res.status(500).json({ error: 'Email service is not configured.' })
    return
  }

  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: gmailUser,
      pass: gmailPassword,
    },
  })

  const subject = `TaskPulse Reminder: ${taskTitle}`
  const text = message
    ? `${message}\n\n— ${senderName} via TaskPulse`
    : `Hey — "${taskTitle}" is due ${dueAt}. Can you start it or update the status?\n\nFrom ${senderName}`

  try {
    await transporter.sendMail({
      from: `TaskPulse <${gmailUser}>`,
      to: recipients.join(','),
      subject,
      text,
    })
    res.status(200).json({ ok: true })
  } catch (error) {
    console.error('Failed to send nudge email:', error)
    res.status(500).json({ error: 'Failed to send email.' })
  }
}

