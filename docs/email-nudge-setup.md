# Email Nudge Feature Setup Guide

## Overview
When users click the "Nudge" button on a task, the app will:
1. Copy the nudge message to clipboard (existing behavior)
2. Send email notifications to all assigned task owners

## Setup Steps

### 1. Install Firebase CLI (if not already installed)
```bash
npm install -g firebase-tools
firebase login
```

### 2. Initialize Firebase Functions (if not already done)
```bash
cd /Users/kidus/Documents/demo/TaskPulse
firebase init functions
```

### 3. Install Dependencies for Cloud Functions
```bash
cd functions
npm install nodemailer
npm install --save-dev @types/nodemailer
```

### 4. Configure Email Service

#### Option A: Gmail (Recommended for small projects)
1. Enable 2-Factor Authentication on your Gmail account
2. Generate an App Password:
   - Go to [Google Account Security](https://myaccount.google.com/security)
   - Find "App passwords" 
   - Generate a password for "Mail" and "Windows Computer"
3. Set environment variables in Firebase:
   ```bash
   firebase functions:config:set gmail.email="your-email@gmail.com"
   firebase functions:config:set gmail.password="your-app-password"
   ```

#### Option B: SendGrid (Recommended for production)
1. Create a [SendGrid](https://sendgrid.com) account
2. Generate an API key
3. Set environment variable:
   ```bash
   firebase functions:config:set sendgrid.api_key="your-sendgrid-api-key"
   ```

Then update `functions/src/sendNudgeEmail.ts` to use SendGrid:
```typescript
const sgMail = require('@sendgrid/mail');
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

// Replace nodemailer with sgMail.send()
```

### 5. Update Functions Code
Update the email configuration in `functions/src/sendNudgeEmail.ts`:

**For Gmail:**
```typescript
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: functions.config().gmail.email,
    pass: functions.config().gmail.password,
  },
});
```

### 6. Deploy Cloud Functions
```bash
cd /Users/kidus/Documents/demo/TaskPulse
firebase deploy --only functions
```

### 7. Enable Cloud Functions API
If you get an error, enable the Cloud Functions API:
1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Select your project `taskpulse-9ce68`
3. Search for "Cloud Functions API"
4. Click "Enable"

## Testing

1. In your TaskPulse app, create a task and assign it to team members
2. Click the "Nudge" button
3. Check that:
   - The message is copied to clipboard
   - Email notifications are sent (check spam folder if not in inbox)

## Troubleshooting

### Emails not sending:
- Check Cloud Functions logs in Firebase Console
- Verify email configuration is correct
- For Gmail: Make sure you're using an App Password, not your regular password
- For SendGrid: Verify API key is correct

### "Functions not found" error:
- Make sure you deployed: `firebase deploy --only functions`
- Check that functions are deployed in Firebase Console → Functions

### CORS errors:
- Update `functions/src/sendNudgeEmail.ts` to handle CORS if calling from different domain

## Cost Considerations

- **Google Cloud Functions**: Free tier includes 2M invocations/month
- **Gmail**: Free (with limitations)
- **SendGrid**: Free tier includes 100 emails/day

For production, SendGrid is more reliable and scalable.
