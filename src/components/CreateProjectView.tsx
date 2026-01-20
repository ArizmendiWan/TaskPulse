import type React from 'react'

interface CreateProjectViewProps {
  newProject: { name: string; course: string }
  setNewProject: React.Dispatch<React.SetStateAction<{ name: string; course: string }>>
  onCreateProject: (e: React.FormEvent) => void
  onGoToOverview: () => void
}

export const CreateProjectView = ({
  newProject,
  setNewProject,
  onCreateProject,
  onGoToOverview,
}: CreateProjectViewProps) => {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 pb-12">
      <div className="mx-auto max-w-xl px-4 py-12 space-y-8">
        <header className="text-center space-y-2">
          <p className="text-xs font-black uppercase tracking-[0.2em] text-amber-600">TaskPulse</p>
          <h1 className="text-4xl font-black text-slate-900 tracking-tight">Create a Project</h1>
          <p className="text-sm font-medium text-slate-500">
            Set up your team in seconds. No accounts, no hassle.
          </p>
        </header>

        <section className="rounded-[2.5rem] bg-white p-8 shadow-xl shadow-slate-200 border border-slate-100">
          <form className="space-y-6" onSubmit={onCreateProject}>
            <div className="space-y-1.5">
              <label htmlFor="project-name" className="text-sm font-bold text-slate-700 ml-1">
                Project Name <span className="text-rose-500">*</span>
              </label>
              <input
                id="project-name"
                required
                name="project-name"
                value={newProject.name}
                onChange={(e) => setNewProject((p) => ({ ...p, name: e.target.value }))}
                className="w-full rounded-2xl border-2 border-slate-100 bg-slate-50 px-4 py-3.5 text-sm font-medium transition-all focus:border-amber-400 focus:bg-white focus:outline-none focus:ring-4 focus:ring-amber-50"
                placeholder="e.g. CS394 Final Project"
              />
            </div>
            <div className="space-y-1.5">
              <label htmlFor="project-course" className="text-sm font-bold text-slate-700 ml-1">
                Course / Class <span className="text-slate-400 font-normal text-xs">(optional)</span>
              </label>
              <input
                id="project-course"
                name="project-course"
                value={newProject.course}
                onChange={(e) => setNewProject((p) => ({ ...p, course: e.target.value }))}
                className="w-full rounded-2xl border-2 border-slate-100 bg-slate-50 px-4 py-3.5 text-sm font-medium transition-all focus:border-amber-400 focus:bg-white focus:outline-none focus:ring-4 focus:ring-amber-50"
                placeholder="e.g. Agile Software Development"
              />
            </div>
            <button
              type="submit"
              className="w-full rounded-2xl bg-slate-900 px-4 py-4 text-sm font-black text-white shadow-lg transition-all hover:bg-slate-800 hover:-translate-y-0.5 active:translate-y-0"
            >
              Create Project & Get Link
            </button>
          </form>
        </section>

        <div className="text-center">
          <button
            type="button"
            onClick={onGoToOverview}
            className="group inline-flex items-center gap-2 text-sm font-bold text-slate-400 hover:text-slate-600 transition-colors"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="m15 18-6-6 6-6" />
            </svg>
            Back to Overview
          </button>
        </div>
      </div>
    </div>
  )
}

