/**
 * TaskPulse Color Theme
 * 
 * Primary: Indigo/Violet - Modern, professional, energetic
 * Accent: Amber/Orange - Warmth, urgency, attention
 * Success: Emerald - Growth, completion, positive
 * Danger: Rose - Warning, urgency, attention needed
 */

export const theme = {
  colors: {
    // Brand colors
    brand: {
      primary: 'text-slate-800 dark:text-slate-100',
      primaryBg: 'bg-slate-800 dark:bg-slate-700',
      accent: 'text-amber-500 dark:text-amber-400',
      accentBg: 'bg-amber-500 dark:bg-amber-400',
    },

    // Task status colors
    status: {
      // Unclaimed/Open tasks
      unassigned: {
        bg: 'bg-slate-50 dark:bg-slate-800/50',
        text: 'text-slate-500 dark:text-slate-300',
        border: 'border-slate-200 dark:border-slate-700',
        pill: 'bg-gradient-to-r from-slate-100 to-slate-50 text-slate-600 border border-slate-200 dark:from-slate-800 dark:to-slate-800/50 dark:text-slate-300 dark:border-slate-700',
      },
      // Legacy - keeping for compatibility
      not_started: {
        bg: 'bg-amber-50 dark:bg-amber-900/20',
        text: 'text-amber-700 dark:text-amber-400',
        border: 'border-amber-200 dark:border-amber-800/50',
        pill: 'bg-gradient-to-r from-amber-100 to-amber-50 text-amber-700 border border-amber-200 dark:from-amber-900/30 dark:to-amber-900/20 dark:text-amber-400 dark:border-amber-800/50',
      },
      // In Progress - actively being worked on
      in_progress: {
        bg: 'bg-sky-50 dark:bg-sky-900/20',
        text: 'text-sky-700 dark:text-sky-400',
        border: 'border-sky-200 dark:border-sky-800/50',
        pill: 'bg-gradient-to-r from-sky-100 to-sky-50 text-sky-700 border border-sky-200 dark:from-sky-900/30 dark:to-sky-900/20 dark:text-sky-400 dark:border-sky-800/50',
      },
      // Done - completed successfully
      done: {
        bg: 'bg-emerald-50 dark:bg-emerald-900/20',
        text: 'text-emerald-700 dark:text-emerald-400',
        border: 'border-emerald-200 dark:border-emerald-800/50',
        pill: 'bg-gradient-to-r from-emerald-100 to-emerald-50 text-emerald-700 border border-emerald-200 dark:from-emerald-900/30 dark:to-emerald-900/20 dark:text-emerald-400 dark:border-emerald-800/50',
      },
      // Overdue - past due date, needs attention
      overdue: {
        bg: 'bg-rose-50 dark:bg-rose-900/20',
        text: 'text-rose-700 dark:text-rose-400',
        border: 'border-rose-200 dark:border-rose-800/50',
        pill: 'bg-gradient-to-r from-rose-100 to-rose-50 text-rose-700 border border-rose-200 dark:from-rose-900/30 dark:to-rose-900/20 dark:text-rose-400 dark:border-rose-800/50',
      },
      // Expired - unclaimed and past due
      expired: {
        bg: 'bg-slate-100 dark:bg-slate-800',
        text: 'text-slate-500 dark:text-slate-500',
        pill: 'bg-slate-200 text-slate-500 dark:bg-slate-700 dark:text-slate-400',
      },
      // Due soon - approaching deadline
      soon: {
        bg: 'bg-amber-500 dark:bg-amber-500',
        text: 'text-white',
        pill: 'bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-sm shadow-amber-200 dark:shadow-amber-900/30',
      },
    },

    // Action button colors
    action: {
      primary: {
        bg: 'bg-gradient-to-r from-slate-800 to-slate-700 dark:from-slate-700 dark:to-slate-600',
        text: 'text-white',
        hover: 'hover:from-slate-700 hover:to-slate-600 dark:hover:from-slate-600 dark:hover:to-slate-500',
      },
      secondary: {
        bg: 'bg-slate-100 dark:bg-slate-800',
        text: 'text-slate-700 dark:text-slate-300',
        hover: 'hover:bg-slate-200 dark:hover:bg-slate-700',
      },
      danger: {
        bg: 'bg-rose-50 dark:bg-rose-900/20',
        text: 'text-rose-600 dark:text-rose-400',
        hover: 'hover:bg-rose-100 dark:hover:bg-rose-900/40',
      },
      success: {
        bg: 'bg-gradient-to-r from-emerald-500 to-teal-500 dark:from-emerald-500 dark:to-teal-500',
        text: 'text-white',
        hover: 'hover:from-emerald-600 hover:to-teal-600',
      },
      checkbox: {
        checked: 'bg-slate-700 border-slate-700 dark:bg-slate-600 dark:border-slate-600',
        unchecked: 'border-slate-300 dark:border-slate-600',
      },
      nudge: {
        notify: 'bg-rose-50 dark:bg-rose-900/20 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-800/50 hover:bg-rose-100 dark:hover:bg-rose-900/30',
        cooldown: 'bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-300 cursor-not-allowed opacity-50',
        sending: 'bg-rose-500 text-white',
        sentButton: 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white',
        error: 'bg-rose-50 text-rose-700 border border-rose-200 dark:bg-rose-900/20 dark:text-rose-400 dark:border-rose-800/50',
        // Status badge buttons
        overdue: {
          active: 'bg-rose-600 text-white hover:bg-rose-500',
          disabled: 'bg-rose-300',
        },
        dueSoon: {
          active: 'bg-rose-50 dark:bg-rose-900/20 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-800/50 hover:bg-rose-100 dark:hover:bg-rose-900/30',
          disabled: 'bg-rose-100 dark:bg-rose-900/30 text-rose-600 dark:text-rose-400 cursor-default',
        },
        sent: {
          badge: 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400',
        },
        failed: {
          badge: 'bg-rose-100 dark:bg-rose-900/30 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-800/50',
        },
      },
      // Task action buttons
      task: {
        claim: 'bg-amber-500 text-white hover:bg-amber-600 shadow-md shadow-amber-200/50 dark:shadow-amber-900/30',
        join: 'bg-amber-500 text-white hover:bg-amber-600 shadow-md shadow-amber-200/50 dark:shadow-amber-900/30',
        finish: 'bg-emerald-600 text-white hover:bg-emerald-500 shadow-md shadow-emerald-200/50 dark:shadow-emerald-900/30',
        leave: 'border-2 border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-500 dark:text-slate-400 hover:border-rose-300 hover:text-rose-600 dark:hover:border-rose-700 dark:hover:text-rose-400',
      },
    },

    // Task card themed containers
    taskCard: {
      done: 'border-emerald-400 dark:border-emerald-600 bg-emerald-50 dark:bg-emerald-900/40',
      expired: 'border-slate-300 dark:border-slate-600 bg-slate-100/80 dark:bg-slate-800/60 opacity-80',
      overdue: 'border-rose-500 dark:border-rose-500 bg-rose-100 dark:bg-rose-900/80',
      dueSoon: 'border-rose-300 dark:border-rose-700 bg-rose-50 dark:bg-rose-900/40',
      unclaimed: 'border-amber-300 dark:border-amber-700 bg-amber-50 dark:bg-amber-900/40',
      default: 'border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 hover:border-slate-400 dark:hover:border-slate-500 hover:shadow-md dark:hover:shadow-black/50',
    },

    // UI element colors
    ui: {
      background: 'bg-slate-50 dark:bg-slate-950',
      surface: 'bg-white dark:bg-slate-900',
      surfaceHover: 'hover:bg-slate-50 dark:hover:bg-slate-800',
      border: 'border-slate-100 dark:border-slate-800',
      borderStrong: 'border-slate-200 dark:border-slate-700',
      text: 'text-slate-900 dark:text-slate-100',
      textMuted: 'text-slate-600 dark:text-slate-300',
      textLight: 'text-slate-400 dark:text-slate-400',
      textEmerald: 'text-emerald-600 dark:text-emerald-400',
      textAmber: 'text-amber-600 dark:text-amber-400',
      textRose: 'text-rose-600 dark:text-rose-400',
      bgEmeraldSubtle: 'bg-emerald-50/30 dark:bg-emerald-900/10',
      input: 'bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100 border-slate-200 dark:border-slate-700 focus:bg-white dark:focus:bg-slate-800 focus:border-amber-400 dark:focus:border-amber-500 focus:ring-2 focus:ring-amber-100 dark:focus:ring-amber-900/30 transition-all outline-none',
    },

    // Special effects
    effects: {
      glow: {
        primary: 'shadow-lg shadow-slate-200/50 dark:shadow-slate-900/30',
        success: 'shadow-lg shadow-emerald-200/50 dark:shadow-emerald-900/30',
        danger: 'shadow-lg shadow-rose-200/50 dark:shadow-rose-900/30',
        warning: 'shadow-lg shadow-amber-200/50 dark:shadow-amber-900/30',
      },
    },
  },
} as const
