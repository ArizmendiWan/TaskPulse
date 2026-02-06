import { useState, useRef, useEffect } from 'react'
import type { NotificationItem } from '../types'
import { theme } from '../theme'

interface NotificationBellProps {
  notifications: NotificationItem[]
  unreadCount: number
  onMarkRead: (id: string) => void
  onMarkAllRead: () => void
  onClearRead: () => void
}

const formatTime = (iso: string) => {
  const date = new Date(iso)
  if (Number.isNaN(date.getTime())) return ''
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffMins = Math.floor(diffMs / 60000)
  if (diffMins < 1) return 'Just now'
  if (diffMins < 60) return `${diffMins}m ago`
  const diffHours = Math.floor(diffMins / 60)
  if (diffHours < 24) return `${diffHours}h ago`
  const diffDays = Math.floor(diffHours / 24)
  if (diffDays < 7) return `${diffDays}d ago`
  return date.toLocaleDateString()
}

export const NotificationBell = ({
  notifications,
  unreadCount,
  onMarkRead,
  onMarkAllRead,
  onClearRead,
}: NotificationBellProps) => {
  const [open, setOpen] = useState(false)
  const panelRef = useRef<HTMLDivElement>(null)

  // Close on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(event.target as Node)) {
        setOpen(false)
      }
    }
    if (open) {
      document.addEventListener('mousedown', handleClickOutside)
    }
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [open])

  return (
    <div className="relative" ref={panelRef}>
      {/* Bell Button */}
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className={`relative p-2 md:p-2.5 rounded-xl transition-all ${
          open
            ? theme.colors.notification.bell.active
            : `${theme.colors.action.secondary.bg} ${theme.colors.action.secondary.text} ${theme.colors.action.secondary.hover}`
        } shadow-sm`}
        title="Notifications"
        aria-label={`Notifications${unreadCount > 0 ? ` (${unreadCount} unread)` : ''}`}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M18 8a6 6 0 0 0-12 0c0 7-3 9-3 9h18s-3-2-3-9" />
          <path d="M13.73 21a2 2 0 0 1-3.46 0" />
        </svg>
        {unreadCount > 0 && (
          <span className={`absolute -top-1 -right-1 inline-flex h-5 min-w-5 items-center justify-center rounded-full ${theme.colors.notification.bell.badge} text-[10px] font-black px-1 animate-in zoom-in duration-200`}>
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown Panel */}
      {open && (
        <div className={`absolute top-full right-0 mt-2 w-80 sm:w-96 ${theme.colors.notification.panel.bg} rounded-2xl shadow-2xl border ${theme.colors.notification.panel.border} z-[70] animate-in fade-in slide-in-from-top-2 duration-200 overflow-hidden`}>
          {/* Header */}
          <div className={`flex items-center justify-between px-4 py-3 border-b ${theme.colors.notification.panel.headerBorder}`}>
            <div className="flex items-center gap-2">
              <p className={`text-xs font-black uppercase tracking-widest ${theme.colors.ui.textAmber}`}>
                Notifications
              </p>
              {unreadCount > 0 && (
                <span className={`inline-flex h-5 min-w-5 items-center justify-center rounded-full ${theme.colors.notification.bell.unreadBadge} text-[10px] font-black px-1.5`}>
                  {unreadCount}
                </span>
              )}
            </div>
            <div className="flex items-center gap-1.5">
              {unreadCount > 0 && (
                <button
                  type="button"
                  onClick={onMarkAllRead}
                  className={`text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded-lg ${theme.colors.status.done.bg} ${theme.colors.status.done.text} hover:bg-emerald-100 dark:hover:bg-emerald-900/30 transition-all`}
                >
                  Read all
                </button>
              )}
              {notifications.some((n) => n.read) && (
                <button
                  type="button"
                  onClick={onClearRead}
                  className={`text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded-lg ${theme.colors.action.secondary.bg} ${theme.colors.ui.textMuted} ${theme.colors.action.secondary.hover} transition-all`}
                >
                  Clear
                </button>
              )}
            </div>
          </div>

          {/* Notification List */}
          <div className="max-h-[400px] overflow-y-auto overscroll-contain">
            {notifications.length === 0 ? (
              <div className="px-4 py-12 text-center">
                <div className="text-3xl mb-3">
                  <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={`mx-auto ${theme.colors.notification.empty.icon}`}>
                    <path d="M18 8a6 6 0 0 0-12 0c0 7-3 9-3 9h18s-3-2-3-9" />
                    <path d="M13.73 21a2 2 0 0 1-3.46 0" />
                  </svg>
                </div>
                <p className={`text-xs font-bold ${theme.colors.notification.empty.text}`}>
                  No notifications yet
                </p>
                <p className={`text-[10px] ${theme.colors.notification.empty.textSecondary} mt-1`}>
                  Reminders from teammates will appear here
                </p>
              </div>
            ) : (
              notifications.slice(0, 20).map((item) => (
                <div
                  key={item.id}
                  className={`px-4 py-3 border-b last:border-b-0 transition-all ${
                    item.read
                      ? `${theme.colors.notification.item.read.border} ${theme.colors.notification.item.read.bg}`
                      : `${theme.colors.notification.item.unread.border} ${theme.colors.notification.item.unread.bg}`
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-0.5">
                        {!item.read && (
                          <span className={`w-2 h-2 rounded-full ${theme.colors.notification.item.unread.dot} shrink-0`} />
                        )}
                        <p className={`text-xs font-black truncate ${
                          item.read ? theme.colors.ui.textMuted : theme.colors.ui.text
                        }`}>
                          {item.title}
                        </p>
                      </div>
                      <p className={`text-[11px] leading-relaxed ${
                        item.read ? theme.colors.ui.textLight : theme.colors.ui.textMuted
                      }`}>
                        {item.message}
                      </p>
                      <div className="flex items-center gap-2 mt-1.5">
                        <span className={`text-[10px] font-bold ${theme.colors.ui.textLight}`}>
                          {formatTime(item.createdAt)}
                        </span>
                        {item.senderName && (
                          <span className={`text-[10px] font-bold ${theme.colors.ui.textLight}`}>
                            from {item.senderName}
                          </span>
                        )}
                      </div>
                    </div>
                    {!item.read && (
                      <button
                        type="button"
                        onClick={() => onMarkRead(item.id)}
                        className={`shrink-0 p-1 rounded-lg ${theme.colors.ui.textLight} ${theme.colors.action.secondary.hover} transition-all`}
                        title="Mark as read"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                          <polyline points="20 6 9 17 4 12" />
                        </svg>
                      </button>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  )
}

