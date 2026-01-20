export const theme = {
  colors: {
    status: {
      unassigned: {
        bg: 'bg-slate-50 dark:bg-slate-800/50',
        text: 'text-slate-500 dark:text-slate-400',
        border: 'border-slate-200 dark:border-slate-700',
        pill: 'bg-slate-50 text-slate-500 border border-slate-200 dark:bg-slate-800/50 dark:text-slate-400 dark:border-slate-700',
      },
      not_started: {
        bg: 'bg-amber-50 dark:bg-amber-900/20',
        text: 'text-amber-700 dark:text-amber-400',
        border: 'border-amber-200 dark:border-amber-800/50',
        pill: 'bg-amber-50 text-amber-700 border border-amber-200 dark:bg-amber-900/20 dark:text-amber-400 dark:border-amber-800/50',
      },
      in_progress: {
        bg: 'bg-blue-50 dark:bg-blue-900/20',
        text: 'text-blue-700 dark:text-blue-400',
        border: 'border-blue-200 dark:border-blue-800/50',
        pill: 'bg-blue-50 text-blue-700 border border-blue-200 dark:bg-blue-900/20 dark:text-blue-400 dark:border-blue-800/50',
      },
      done: {
        bg: 'bg-emerald-50 dark:bg-emerald-900/20',
        text: 'text-emerald-700 dark:text-emerald-400',
        border: 'border-emerald-200 dark:border-emerald-800/50',
        pill: 'bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-900/20 dark:text-emerald-400 dark:border-emerald-800/50',
      },
      overdue: {
        bg: 'bg-rose-50 dark:bg-rose-900/20',
        text: 'text-rose-700 dark:text-rose-400',
        border: 'border-rose-200 dark:border-rose-800/50',
        pill: 'bg-rose-50 text-rose-700 border border-rose-200 dark:bg-rose-900/20 dark:text-rose-400 dark:border-rose-800/50',
      },
      at_risk: {
        bg: 'bg-rose-600 dark:bg-rose-500',
        text: 'text-white',
        pill: 'bg-rose-600 text-white dark:bg-rose-500',
      },
      soon: {
        bg: 'bg-amber-500 dark:bg-amber-600',
        text: 'text-white',
        pill: 'bg-amber-500 text-white dark:bg-amber-600',
      },
    },
    action: {
      primary: {
        bg: 'bg-slate-900 dark:bg-white',
        text: 'text-white dark:text-slate-900',
        hover: 'hover:bg-slate-800 dark:hover:bg-slate-100',
      },
      secondary: {
        bg: 'bg-slate-50 dark:bg-slate-800',
        text: 'text-slate-600 dark:text-slate-300',
        hover: 'hover:bg-slate-100 dark:hover:bg-slate-700',
      },
      danger: {
        bg: 'bg-rose-50 dark:bg-rose-900/20',
        text: 'text-rose-600 dark:text-rose-400',
        hover: 'hover:bg-rose-100 dark:hover:bg-rose-900/40',
      },
      success: {
        bg: 'bg-emerald-600 dark:bg-emerald-500',
        text: 'text-white',
        hover: 'hover:bg-emerald-500 dark:hover:bg-emerald-400',
      },
      checkbox: {
        checked: 'bg-emerald-600 border-emerald-600 dark:bg-emerald-500 dark:border-emerald-500',
        unchecked: 'border-slate-300 dark:border-slate-600',
      },
      nudge: {
        idle: 'bg-rose-600 text-white hover:bg-rose-700 dark:bg-rose-500 dark:hover:bg-rose-600',
        sending: 'bg-rose-600 text-white dark:bg-rose-500',
        sent: 'bg-emerald-600 text-white dark:bg-emerald-500',
        error: 'bg-rose-50 text-rose-700 border border-rose-200 dark:bg-rose-900/20 dark:text-rose-400 dark:border-rose-800/50',
      },
    },
    ui: {
      background: 'bg-slate-50 dark:bg-slate-950',
      surface: 'bg-white dark:bg-slate-900',
      border: 'border-slate-100 dark:border-slate-800',
      borderStrong: 'border-slate-200 dark:border-slate-700',
      text: 'text-slate-900 dark:text-slate-100',
      textMuted: 'text-slate-500 dark:text-slate-400',
      textLight: 'text-slate-400 dark:text-slate-500',
      input: 'bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 border-slate-100 dark:border-slate-800 focus:bg-white dark:focus:bg-slate-900 focus:border-amber-400 dark:focus:border-amber-500 transition-all outline-none',
    },
  },
} as const

