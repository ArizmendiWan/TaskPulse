import type React from 'react'
import { theme } from '../theme'

interface LoginViewProps {
  loginForm: { name: string; email: string }
  setLoginForm: React.Dispatch<React.SetStateAction<{ name: string; email: string }>>
  onLogin: (e: React.FormEvent) => void
  loginError: string | null
}

export const LoginView = ({
  loginForm,
  setLoginForm,
  onLogin,
  loginError,
}: LoginViewProps) => {
  return (
    <div className={`min-h-screen ${theme.colors.ui.background} ${theme.colors.ui.text} pb-12 transition-colors duration-300`}>
      <div className="mx-auto max-w-xl px-4 py-12 space-y-8">
        <header className="text-center space-y-2">
          <p className="text-xs font-black uppercase tracking-[0.2em] text-orange-600">TaskPulse</p>
          <h1 className={`text-4xl font-black ${theme.colors.ui.text} tracking-tight`}>Login</h1>
          <p className={`text-sm font-medium ${theme.colors.ui.textMuted}`}>Enter your details to get started.</p>
        </header>

        <section className={`rounded-[2.5rem] ${theme.colors.ui.surface} p-8 shadow-xl shadow-slate-200 dark:shadow-black/50 border ${theme.colors.ui.border}`}>
          <form className="space-y-6" onSubmit={onLogin}>
            <div className="space-y-1.5">
              <label htmlFor="login-name" className={`text-sm font-bold ${theme.colors.ui.text} ml-1`}>
                Name <span className="text-rose-500">*</span>
              </label>
              <input
                id="login-name"
                required
                name="login-name"
                value={loginForm.name}
                onChange={(e) => setLoginForm((p) => ({ ...p, name: e.target.value }))}
                className={`w-full rounded-2xl border-2 ${theme.colors.ui.input} px-4 py-3.5 text-sm font-medium transition-all focus:outline-none focus:ring-4 focus:ring-orange-50 dark:focus:ring-orange-950/20`}
                placeholder="e.g. John Doe"
              />
            </div>
            <div className="space-y-1.5">
              <label htmlFor="login-email" className={`text-sm font-bold ${theme.colors.ui.text} ml-1`}>
                Email <span className="text-rose-500">*</span>
              </label>
              <input
                id="login-email"
                required
                name="login-email"
                type="email"
                value={loginForm.email}
                onChange={(e) => setLoginForm((p) => ({ ...p, email: e.target.value }))}
                className={`w-full rounded-2xl border-2 ${theme.colors.ui.input} px-4 py-3.5 text-sm font-medium transition-all focus:outline-none focus:ring-4 focus:ring-orange-50 dark:focus:ring-orange-950/20`}
                placeholder="e.g. john@example.com"
              />
            </div>
            {loginError && (
              <div className="rounded-2xl bg-rose-50 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-900/50 p-4">
                <p className="text-sm font-bold text-rose-700 dark:text-rose-400">{loginError}</p>
              </div>
            )}
            <button
              type="submit"
              className={`w-full rounded-2xl ${theme.colors.action.primary.bg} px-4 py-4 text-sm font-black ${theme.colors.action.primary.text} shadow-lg transition-all ${theme.colors.action.primary.hover} hover:-translate-y-0.5 active:translate-y-0`}
            >
              Login
            </button>
          </form>
        </section>
      </div>
    </div>
  )
}

