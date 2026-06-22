"use client"
import { useState, useEffect, useRef } from "react"
import { Bell, Check, Trash2, FileText, AlertCircle, CheckCircle, Info } from "lucide-react"
import { cn } from "@/lib/utils"
import { timeAgo } from "@/lib/utils"

function toPersianDigits(str) {
  return String(str).replace(/[0-9]/g, (d) => "۰۱۲۳۴۵۶۷۸۹"[d])
}

export default function NotificationBell({ user }) {
  const [open, setOpen] = useState(false)
  const [notifications, setNotifications] = useState([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [loading, setLoading] = useState(false)
  const ref = useRef(null)

  const fetchNotifications = async () => {
    try {
      const res = await fetch("/api/notifications")
      const data = await res.json()
      setNotifications(data.notifications || [])
      setUnreadCount(data.unreadCount || 0)
    } catch {}
  }

  useEffect(() => {
    fetchNotifications()
    const interval = setInterval(fetchNotifications, 30000)
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    function handleClickOutside(e) {
      if (ref.current && !ref.current.contains(e.target)) {
        setOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  const markAllRead = async () => {
    await fetch("/api/notifications", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ markAll: true }),
    })
    fetchNotifications()
  }

  const markRead = async (id) => {
    await fetch("/api/notifications", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    })
    fetchNotifications()
  }

  const deleteNotification = async (id, e) => {
    e.stopPropagation()
    await fetch(`/api/notifications/${id}`, { method: "DELETE" })
    fetchNotifications()
  }

  const typeIcons = {
    success: CheckCircle,
    warning: AlertCircle,
    error: AlertCircle,
    info: Info,
    task: FileText,
    review: FileText,
    publish: CheckCircle,
  }

  const typeColors = {
    success: "text-emerald-500",
    warning: "text-amber-500",
    error: "text-red-500",
    info: "text-blue-500",
    task: "text-brand-500",
    review: "text-purple-500",
    publish: "text-teal-500",
  }

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => { setOpen(!open); if (!open && unreadCount > 0) {} }}
        className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-300 transition-all active:scale-90 relative"
      >
        <Bell className={cn("w-5 h-5 transition-transform", open && "rotate-12")} />
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center px-1 animate-bounce-in">
            {toPersianDigits(unreadCount > 9 ? "۹+" : unreadCount)}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute left-0 mt-2 w-80 sm:w-96 rounded-2xl border border-gray-200 bg-white shadow-2xl dark:border-gray-700 dark:bg-gray-900 animate-scale-in overflow-hidden z-50">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-100 dark:border-gray-800">
            <h3 className="text-sm font-bold text-gray-900 dark:text-gray-100">
              اعلان‌ها {unreadCount > 0 && <span className="text-brand-500">({toPersianDigits(unreadCount)} جدید)</span>}
            </h3>
            {unreadCount > 0 && (
              <button onClick={markAllRead} className="text-xs text-brand-600 hover:text-brand-700 transition-colors flex items-center gap-1">
                <Check className="w-3 h-3" />
                خواندن همه
              </button>
            )}
          </div>

          {/* List */}
          <div className="max-h-[400px] overflow-y-auto">
            {loading ? (
              <div className="p-8 text-center text-sm text-gray-400">در حال بارگذاری...</div>
            ) : notifications.length === 0 ? (
              <div className="p-8 text-center">
                <Bell className="w-10 h-10 text-gray-300 mx-auto mb-2" />
                <p className="text-sm text-gray-400">اعلانی وجود ندارد</p>
              </div>
            ) : (
              notifications.map((n) => {
                const Icon = typeIcons[n.type] || Info
                return (
                  <div
                    key={n.id}
                    onClick={() => { markRead(n.id); if (n.link) window.location.href = n.link }}
                    className={cn(
                      "flex items-start gap-3 p-3 border-b border-gray-50 dark:border-gray-800/50 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-all group",
                      !n.isRead && "bg-brand-50/50 dark:bg-brand-500/5"
                    )}
                  >
                    <div className={cn("w-9 h-9 rounded-xl flex items-center justify-center shrink-0", !n.isRead ? "bg-white dark:bg-gray-800 shadow-sm" : "")}>
                      <Icon className={cn("w-4 h-4", typeColors[n.type] || "text-gray-400")} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={cn("text-sm", !n.isRead ? "font-semibold text-gray-900 dark:text-gray-100" : "text-gray-600 dark:text-gray-400")}>
                        {n.title}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 line-clamp-2">{n.message}</p>
                      <p className="text-[10px] text-gray-400 mt-1">{timeAgo(n.createdAt)}</p>
                    </div>
                    <button
                      onClick={(e) => deleteNotification(n.id, e)}
                      className="p-1 text-gray-300 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                    {!n.isRead && <span className="w-2 h-2 rounded-full bg-brand-500 mt-1.5 shrink-0 animate-pulse" />}
                  </div>
                )
              })
            )}
          </div>
        </div>
      )}
    </div>
  )
}