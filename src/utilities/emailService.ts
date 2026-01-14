// Email service to send nudge emails via Cloud Function
import { httpsCallable, getFunctions } from 'firebase/functions';

export interface NudgeEmailPayload {
  taskTitle: string;
  dueAt: string;
  recipientEmails: string[];
  senderName: string;
}

export async function sendNudgeEmails(payload: NudgeEmailPayload): Promise<void> {
  try {
    const functions = getFunctions();
    const sendNudgeEmail = httpsCallable(functions, 'sendNudgeEmail');
    await sendNudgeEmail(payload);
  } catch (error) {
    console.error('Failed to send nudge emails:', error);
    throw error;
  }
}
