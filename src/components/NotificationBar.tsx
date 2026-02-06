import { useMemo, useState } from 'react'
import type { NotificationItem, NotificationType } from '../types'

interface NotificationBarProps {
  notifications: NotificationItem[]
  unreadCount: number
  onMarkRead: (id: string) => void
  onMarkAllRead: () => void
  onClearRead: () => void
}

const typeStyles: Record<NotificationType, string> = {
  info: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-200',
  success: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300',
  warning: 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300',
  error: 'bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-300',
}

const formatTime = (iso: string) => {
  const date = new Date(iso)
  if (Number.isNaN(date.getTime())) return ''
  return date.toLocaleString()
}

export const NotificationBar = ({
  notifications,
  unreadCount,
  onMarkRead,
  onMarkAllRead,
  onClearRead,
}: NotificationBarProps) => {
  const [open, setOpen] = useState(false)

  const latest = notifications[0]
  const latestText = useMemo(() => {
    if (!latest) return 'No notifications yet'
    return `${latest.title}: ${latest.message}`
  }, [latest])

  return (
    <div className="relative">
      <div className="flex items-center justify-between gap-4 rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl px-4 py-3 shadow-sm">
        <div className="flex items-center gap-3 min-w-0">
          <div className="relative">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="text-amber-600 dark:text-amber-400"
            >
              <path d="M18 8a6 6 0 0 0-12 0c0 7-3 9-3 9h18s-3-2-3-9" />
              <path d="M13.73 21a2 2 0 0 1-3.46 0" />
            </svg>
            {unreadCount > 0 && (
              <span className="absolute -top-1.5 -right-1.5 inline-flex h-4 min-w-4 items-center justify-center rounded-full bg-rose-500 text-[9px] font-black text-white px-1">
                {unreadCount}
              </span>
            )}
          </div>
          <div className="min-w-0">
            <p className="text-[10px] font-black uppercase tracking-widest text-amber-600 dark:text-amber-400">
              Notifications
            </p>
            <p className="text-xs font-bold text-slate-700 dark:text-slate-200 truncate max-w-[240px] sm:max-w-md">
              {latestText}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={() => setOpen((prev) => !prev)}
            className="text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700 transition-all"
          >
            {open ? 'Collapse' : 'Expand'}
          </button>
          {unreadCount > 0 && (
            <button
              type="button"
              onClick={onMarkAllRead}
              className="text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-xl bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-200 dark:hover:bg-emerald-900/50 transition-all"
            >
              Mark all read
            </button>
          )}
          {notifications.some((n) => n.read) && (
            <button
              type="button"
              onClick={onClearRead}
              className="text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-all"
            >
              Clear read
            </button>
          )}
        </div>
      </div>

      {open && (
        <div className="mt-3 space-y-2">
          {notifications.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-slate-200 dark:border-slate-800 px-4 py-6 text-center text-xs font-bold text-slate-500 dark:text-slate-400">
              No notifications
            </div>
          ) : (
            notifications.slice(0, 10).map((item) => (
              <div
                key={item.id}
                className={`rounded-2xl border px-4 py-3 flex flex-col gap-1.5 ${
                  item.read
                    ? 'border-slate-200/70 dark:border-slate-800/70 bg-white/70 dark:bg-slate-900/60'
                    : 'border-amber-200/70 dark:border-amber-900/60 bg-amber-50/70 dark:bg-amber-900/20'
                }`}
              >
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className={`text-[9px] font-black uppercase tracking-widest px-2 py-1 rounded-full ${typeStyles[item.type]}`}>
                      {item.type}
                    </span>
                    <p className="text-xs font-black text-slate-800 dark:text-slate-100 truncate">
                      {item.title}
                    </p>
                  </div>
                  <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 shrink-0">
                    {formatTime(item.createdAt)}
                  </span>
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-300">
                  {item.message}
                </p>
                {!item.read && (
                  <button
                    type="button"
                    onClick={() => onMarkRead(item.id)}
                    className="self-start text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700 transition-all"
                  >
                    Mark read
                  </button>
                )}
              </div>
            ))
          )}
        </div>
      )}
    </div>
  )
}
