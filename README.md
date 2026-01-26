# TaskPulse ⚡️

TaskPulse is a modern, collaborative task management application designed for agile teams. It prioritizes clarity, urgency, and seamless collaboration without the friction of traditional project management tools.

## 🚀 Key Features

- **Collaborative Workspace**: Powered by Firebase, TaskPulse allows teams to work together in real-time. Just share a link to invite teammates.
- **Urgency-Driven Sorting**: Tasks are intelligently categorized as "At Risk" or "Overdue" based on deadlines, ensuring your team focuses on what matters most.
- **Smart Pinning 📌**: Pin critical tasks to the top of the list for the entire team.
- **Live Commenting**: Collaborative discussion directly on task cards to keep context where the work happens.
- **Email Nudges ✈️**: Send instant email reminders to task owners with a single click.
- **Dark Mode Support 🌙**: A beautiful, robust dark theme that respects your system preferences and is persistent across sessions.
- **Persistent View Settings**: Your filters, "Hide Done" preferences, and sidebar state are saved locally for a consistent experience.
- **Zero-Friction Identity**: No complex passwords. Join projects with just a name and email. Change your display name anytime directly from the sidebar.

## 🛠 Tech Stack

- **Frontend**: React 18, TypeScript, Vite
- **Styling**: Tailwind CSS v4 (with a centralized `theme.ts` system)
- **Database**: Firebase Firestore
- **Testing**: Vitest, React Testing Library
- **Deployment**: Vercel ready

## 📦 Project Structure

```text
src/
├── components/     # UI Views and Components (TaskCard, Sidebar, etc.)
├── hooks/          # Custom hooks for Auth, Projects, and User Caching
├── lib/            # Firebase config and business logic utilities
├── tests/          # Comprehensive test suite
├── theme.ts        # Centralized design system and color tokens
└── types.ts        # Global TypeScript definitions
```

## ⚡️ Quick Start

### 1. Installation

```bash
npm install
```

### 2. Environment Setup

Create a `.env` file in the root directory with your Firebase configuration:

```env
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_auth_domain
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_storage_bucket
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
```

### 3. Development

```bash
npm run dev
```

### 4. Testing

```bash
# Run all tests
npm test

# Run tests in UI mode
npx vitest --ui
```

## 🎨 Design System

TaskPulse uses a centralized theme system located in `src/theme.ts`. This allows for:
- Consistent color palettes across light and dark modes.
- Easy global updates to UI elements (buttons, inputs, status pills).
- Robust Tailwind v4 integration using semantic color tokens.

---
Built for **CS394 Agile Software Development**.
