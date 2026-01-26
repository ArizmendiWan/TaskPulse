import React from 'react'
import type { Project } from '../types'
import { theme } from '../theme'

interface InviteViewProps {
  project: Project
  currentUserId: string | null
  currentUserName: string | null
  onJoin: (name: string, email: string) => void
  onConfirmJoin: () => void
  onDeclineJoin: () => void
  onSwitchUser: () => void
  onGoBack: () => void
  loginError: string | null
}

export const InviteView = ({
  project,
  currentUserId,
  currentUserName,
  onJoin,
  onConfirmJoin,
  onDeclineJoin,
  onSwitchUser,
  onGoBack,
  loginError,
}: InviteViewProps) => {
  const [name, setName] = React.useState('')
  const [email, setEmail] = React.useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onJoin(name, email)
  }

  return (
    <div className={`min-h-screen ${theme.colors.ui.background} ${theme.colors.ui.text} flex items-center justify-center p-4 transition-colors duration-300`}>
      <div className="max-w-md w-full space-y-8 animate-in fade-in zoom-in duration-500">
        <header className="text-center space-y-4">
          <div className="inline-block p-4 rounded-[2rem] bg-amber-100 dark:bg-amber-900/30 text-4xl mb-2 shadow-xl shadow-amber-200/20">
            👋
          </div>
          <div className="space-y-1">
            <p className="text-xs font-black uppercase tracking-[0.2em] text-amber-600">You're Invited</p>
            <h1 className={`text-3xl font-black ${theme.colors.ui.text} tracking-tight leading-tight`}>
              Join {project.name}
            </h1>
            {project.course && (
              <p className="text-sm font-black text-amber-600 uppercase tracking-[0.2em] mt-1">
                {project.course}
              </p>
            )}
          </div>
        </header>

        <section className={`rounded-[2.5rem] ${theme.colors.ui.surface} p-8 shadow-2xl shadow-slate-200 dark:shadow-black/50 border ${theme.colors.ui.border}`}>
          {currentUserId ? (
            /* Logged in user - simple Yes/No confirmation */
            <div className="space-y-8 text-center">
              <div className="space-y-4">
                <p className={`text-sm font-bold ${theme.colors.ui.textMuted}`}>
                  Join this project as
                </p>
                <div className="flex items-center justify-center gap-3 py-4">
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-amber-500 to-amber-600 flex items-center justify-center text-white font-black text-2xl shadow-lg shadow-amber-200/50 dark:shadow-none">
                    {currentUserName?.charAt(0).toUpperCase()}
                  </div>
                  <div className="text-left">
                  <p className={`text-xl font-black ${theme.colors.ui.text} tracking-tight`}>
                    {currentUserName}
                  </p>
                    <p className={`text-xs font-bold ${theme.colors.ui.textLight}`}>
                      Ready to collaborate
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={onDeclineJoin}
                  className={`flex-1 rounded-2xl border-2 ${theme.colors.ui.border} px-4 py-4 text-sm font-black ${theme.colors.ui.textMuted} hover:${theme.colors.ui.background} hover:border-rose-200 hover:text-rose-600 transition-all`}
                >
                  NO, GO BACK
                </button>
                <button
                  onClick={onConfirmJoin}
                  className={`flex-1 rounded-2xl ${theme.colors.action.primary.bg} px-4 py-4 text-sm font-black ${theme.colors.action.primary.text} shadow-xl transition-all ${theme.colors.action.primary.hover} hover:-translate-y-1 active:translate-y-0`}
                >
                  YES, JOIN
                </button>
              </div>

              <button
                onClick={onSwitchUser}
                className={`text-[10px] font-black ${theme.colors.ui.textLight} hover:${theme.colors.ui.text} uppercase tracking-[0.2em] transition-colors`}
              >
                Not {currentUserName}? Switch account
              </button>
            </div>
          ) : (
            /* Not logged in - show login form with project context */
            <div className="space-y-6">
              <div className={`text-center pb-4 border-b ${theme.colors.ui.border}`}>
                <p className={`text-xs font-black uppercase tracking-widest ${theme.colors.ui.textLight}`}>
                  Sign in to join
                </p>
              </div>

              <form className="space-y-5" onSubmit={handleSubmit}>
              <div className="space-y-2">
                <label className={`text-[10px] font-black uppercase tracking-[0.2em] ${theme.colors.ui.textLight} ml-1`}>
                  Your Name
                </label>
                <input
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className={`w-full rounded-2xl border-2 ${theme.colors.ui.input} px-5 py-4 text-sm font-black focus:outline-none transition-all`}
                  placeholder="e.g. Alex Smith"
                />
              </div>
              <div className="space-y-2">
                <label className={`text-[10px] font-black uppercase tracking-[0.2em] ${theme.colors.ui.textLight} ml-1`}>
                  Your Email
                </label>
                <input
                  required
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className={`w-full rounded-2xl border-2 ${theme.colors.ui.input} px-5 py-4 text-sm font-black focus:outline-none transition-all`}
                  placeholder="e.g. alex@example.com"
                />
              </div>

              {loginError && (
                <div className="rounded-2xl bg-rose-50 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-900/50 p-4">
                  <p className="text-sm font-bold text-rose-700 dark:text-rose-400">{loginError}</p>
                </div>
              )}

              <button
                type="submit"
                className={`w-full rounded-2xl ${theme.colors.action.primary.bg} px-4 py-4 text-sm font-black ${theme.colors.action.primary.text} shadow-xl transition-all ${theme.colors.action.primary.hover} hover:-translate-y-1 active:translate-y-0`}
              >
                  SIGN IN & JOIN PROJECT
              </button>
            </form>
            </div>
          )}
        </section>

        <div className="flex flex-col items-center gap-8">
          <p className={`text-center text-[11px] font-bold ${theme.colors.ui.textLight} px-8 leading-relaxed`}>
            By joining, you'll be able to see tasks, take responsibility, and collaborate with the team in <span className="text-amber-600 font-black">{project.name}</span>.
          </p>
          
          <button
            onClick={onGoBack}
            className={`flex items-center gap-2 text-[10px] font-black ${theme.colors.ui.textMuted} hover:${theme.colors.ui.text} uppercase tracking-[0.2em] transition-colors group`}
          >
            <svg
              className="transition-transform group-hover:-translate-x-1"
              xmlns="http://www.w3.org/2000/svg"
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="m15 18-6-6 6-6" />
            </svg>
            Back to Projects
          </button>
        </div>
      </div>
    </div>
  )
}
