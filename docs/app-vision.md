Name
	•	The app is called TaskPulse.

Users
	•	Users are college students working on short-term group projects (2–10 weeks).
	•	They coordinate in messy group chats and often suffer from vague ownership and missed deadlines.

Value proposition

A lightweight task tracker that makes who owns what and what’s due next painfully obvious—so student teams stop missing due dates and stop arguing about responsibility.

Key features

Team / project setup (no accounts)
	•	No authentication (no email, no passwords).
	•	A user creates a Project with:
	•	Project name (required)
	•	Course/class (optional)
	•	Project creation lives on its own page (e.g., /new); project dashboards never show the creation form.
	•	The app generates a shareable invite link for that project.
	•	Opening the invite link lands directly on the project dashboard (no create view), with a join prompt for name only.
	•	Teammates join by opening the link and entering their display name.
	•	Names are stored per project and used for task assignment. The project dashboard shows all members.
	•	Each project page is task-first: it only shows that project’s tasks, members, filters, and activity—no cross-project data.
	•	Projects overview lives one level up: it lists all projects with a concise task summary (e.g., count of tasks, % done, how many due soon/overdue/at risk).
	•	Project dashboards prioritize task monitoring in the main content area. Team info and project meta live in a left sidebar that can be collapsed/hidden to keep focus on tasks.
	•	Primary actions hierarchy: “Add task” is the primary CTA in the project dashboard. “Projects overview” is navigation and is shown as back button (left arrow). “Create new project” lives in the overview or a secondary control (not inline with task actions).

Task creation and assignment
	•	Task creation opens from a primary button into a floating panel/modal so the dashboard stays focused on monitoring.
	•	Create tasks with:
	•	Title (required)
	•	Description (optional)
	•	Due date/time (required)
	•	Owner (a member name; tasks can start Unassigned)
	•	Difficulty (optional: S/M/L) if you want a lightweight planning signal

Status tracking

Statuses are intentionally simple:
	•	Unassigned
	•	Assigned
	•	In Progress
	•	Done
	•	Overdue (automatic when past due and not done)

Deadline-first views (the “edge”)

Each project has quick filters/tabs:
	•	All (sorted by due date)
	•	My Tasks (owner = me)
	•	Due Soon (due within 48 hours, not done)
	•	At Risk (due soon AND not started)
	•	Due < 48h and status is Unassigned/Assigned
	•	Due < 24h and status is not In Progress/Done (high risk)
	•	Overdue (past due, not done)

Accountability nudges (no notifications required)
	•	Each At Risk task has a Nudge button that generates a copyable message like:
“Hey — ‘Draft intro’ is due tomorrow. Can you start it or update the status?”

Activity history (tiny but powerful)
	•	Each task keeps an event log:
	•	created
	•	assigned/owner changed
	•	status changed
	•	due date changed
	•	Activity is visible on the Task Details page to reduce confusion and disputes.

Local-only storage
	•	Persist everything locally (e.g., localStorage or IndexedDB).
	•	The “invite link” works on the same device by encoding projectId in the URL; this is fine for prototype/demo.

Example scenario
	•	Alex creates a new project called “CS394 Final Project” and gets an invite link.
	•	Alex posts the link in the group chat.
	•	Mei opens the link, types “Mei”, and joins. Jordan does the same.
	•	Alex creates tasks: “Outline”, “Prototype UI”, “Write report”, each with due dates.
	•	They assign owners.
	•	Two days later, TaskPulse flags “Write report” as At Risk (due soon, not started).
	•	Alex clicks Nudge, copies the message, and pastes it into the chat.
	•	The team finishes the class without missing another due date.

Coding notes (high level)
	•	Keep UI mobile-friendly and fast: creating a task should take < 15 seconds.
	•	Compute Overdue/At Risk at render time based on current time + dueAt.
	•	Provide clean, reusable filtering functions for “Due Soon / At Risk / Overdue / My Tasks”.

Testing notes
	•	Unit tests for:
	•	Overdue computation
	•	At Risk logic (48h/24h thresholds)
	•	Filters (My Tasks, Due Soon, Overdue)
	•	Basic UI test: create a task → see it appear in the correct filter after status changes.