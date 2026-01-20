import type React from 'react'

interface LoginViewProps {
  loginForm: { name: string; email: string }
  setLoginForm: React.Dispatch<React.SetStateAction<{ name: string; email: string }>>
  onLogin: (e: React.FormEvent) => void
  loginError: string | null
  onGoToOverview: () => void
}

export const LoginView = ({
  loginForm,
  setLoginForm,
  onLogin,
  loginError,
  onGoToOverview,
}: LoginViewProps) => {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 pb-12">
      <div className="mx-auto max-w-xl px-4 py-12 space-y-8">
        <header className="text-center space-y-2">
          <p className="text-xs font-black uppercase tracking-[0.2em] text-orange-600">TaskPulse</p>
          <h1 className="text-4xl font-black text-slate-900 tracking-tight">Login</h1>
          <p className="text-sm font-medium text-slate-500">Enter your details to get started.</p>
        </header>

        <section className="rounded-[2.5rem] bg-white p-8 shadow-xl shadow-slate-200 border border-slate-100">
          <form className="space-y-6" onSubmit={onLogin}>
            <div className="space-y-1.5">
              <label htmlFor="login-name" className="text-sm font-bold text-slate-700 ml-1">
                Name <span className="text-rose-500">*</span>
              </label>
              <input
                id="login-name"
                required
                name="login-name"
                value={loginForm.name}
                onChange={(e) => setLoginForm((p) => ({ ...p, name: e.target.value }))}
                className="w-full rounded-2xl border-2 border-slate-100 bg-slate-50 px-4 py-3.5 text-sm font-medium transition-all focus:border-orange-400 focus:bg-white focus:outline-none focus:ring-4 focus:ring-orange-50"
                placeholder="e.g. John Doe"
              />
            </div>
            <div className="space-y-1.5">
              <label htmlFor="login-email" className="text-sm font-bold text-slate-700 ml-1">
                Email <span className="text-rose-500">*</span>
              </label>
              <input
                id="login-email"
                required
                name="login-email"
                type="email"
                value={loginForm.email}
                onChange={(e) => setLoginForm((p) => ({ ...p, email: e.target.value }))}
                className="w-full rounded-2xl border-2 border-slate-100 bg-slate-50 px-4 py-3.5 text-sm font-medium transition-all focus:border-orange-400 focus:bg-white focus:outline-none focus:ring-4 focus:ring-orange-50"
                placeholder="e.g. john@example.com"
              />
            </div>
            {loginError && (
              <div className="rounded-2xl bg-rose-50 border border-rose-200 p-4">
                <p className="text-sm font-bold text-rose-700">{loginError}</p>
              </div>
            )}
            <button
              type="submit"
              className="w-full rounded-2xl bg-slate-900 px-4 py-4 text-sm font-black text-white shadow-lg transition-all hover:bg-slate-800 hover:-translate-y-0.5 active:translate-y-0"
            >
              Login
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

