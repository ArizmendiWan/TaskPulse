# Email Nudge Feature Setup Guide (Vercel + Gmail)

## Overview
When users click the "Nudge" button on a task, the app will:
1. Copy the nudge message to clipboard (existing behavior)
2. Call a Vercel API route (`/api/send-nudge`)
3. The API route sends email notifications to all assigned task owners via Gmail SMTP

This setup does **not** use Firebase Functions or Firebase CLI.

## Setup Steps

### 1. Install nodemailer (already used by the API route)
```bash
npm install nodemailer
```

### 2. Create Gmail App Password
1. Enable 2‑Step Verification on your Gmail account
2. Go to [Google Account Security](https://myaccount.google.com/security)
3. Open **App passwords**
4. Generate a password for **Mail**

### 3. Configure Environment Variables
Add these in **Vercel → Project → Settings → Environment Variables**:

```
GMAIL_USER=your-email@gmail.com
GMAIL_APP_PASSWORD=your-app-password
```

For local development, add to `.env`:
```
GMAIL_USER=your-email@gmail.com
GMAIL_APP_PASSWORD=your-app-password
```

### 4. API Route
The API route is implemented at:
```
api/send-nudge.ts
```

It uses Gmail SMTP to send messages to recipients.

### 5. Frontend Call
The frontend uses:
```
src/utilities/emailService.ts
```
which calls `/api/send-nudge` with a JSON payload.

## Testing
1. Create a task and assign owners with emails
2. Click the "Nudge" button
3. Confirm:
   - The message is copied to clipboard
   - Emails arrive in recipients' inboxes (check spam)

## Troubleshooting
### Emails not sending
- Ensure `GMAIL_USER` and `GMAIL_APP_PASSWORD` are set in Vercel
- Verify App Password is active
- Check Vercel Function logs

### 401 or auth errors
- App Password is incorrect
- 2‑Step Verification not fully enabled

## Cost Considerations
- Vercel Functions are free on the Hobby tier (with limits)
- Gmail is free but has daily sending limits
