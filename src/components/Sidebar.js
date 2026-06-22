"use client"
import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  LayoutDashboard, FileText, Users, Settings,
  PenTool, Send, CheckCircle, Clock, ListChecks, LogOut, Sparkles
} from "lucide-react"
import { cn } from "@/lib/utils"
import { getRoleName, getRoleColor } from "@/lib/auth"

const navConfig = {
  ADMIN: [
    { label: "داشبورد", href: "/admin", icon: LayoutDashboard },
    { label: "کاربران", href: "/admin/users", icon: Users },
    { label: "تمام بریف‌ها", href: "/admin/briefs", icon: FileText },
    { label: "تنظیمات", href: "/admin/settings", icon: Settings },
  ],
  CONTENT_MANAGER: [
    { label: "داشبورد", href: "/manager", icon: LayoutDashboard },
    { label: "ایجاد بریف", href: "/manager/briefs/new", icon: PenTool },
    { label: "بریف‌ها", href: "/manager/briefs", icon: FileText },
    { label: "تسک‌ها", href: "/manager/tasks", icon: ListChecks },
  ],
  WRITER: [
    { label: "داشبورد", href: "/writer", icon: LayoutDashboard },
    { label: "کارتابل من", href: "/writer/tasks", icon: Clock },
    { label: "فضای نگارش", href: "/writer/workspace", icon: PenTool },
  ],
  PUBLISHER: [
    { label: "داشبورد", href: "/publisher", icon: LayoutDashboard },
    { label: "کارتابل انتشار", href: "/publisher/queue", icon: Send },
    { label: "منتشر شده‌ها", href: "/publisher/published", icon: CheckCircle },
  ],
}

export default function Sidebar({ user, onNavigate }) {
  const pathname = usePathname()
  const navItems = navConfig[user.role] || []

  return (
    <aside className="w-64 shrink-0 border-l border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900 flex flex-col h-screen sticky top-0">
      {/* Logo */}
      <div className="flex items-center gap-2.5 px-5 h-16 border-b border-gray-100 dark:border-gray-800">
        <div className="relative">
          <div className="absolute inset-0 bg-brand-500 rounded-xl blur-md opacity-30" />
          <div className="relative w-9 h-9 rounded-xl bg-gradient-to-br from-brand-500 to-brand-700 flex items-center justify-center shadow-lg shadow-brand-600/20">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
        </div>
        <div>
          <h1 className="text-sm font-bold text-gray-900 dark:text-gray-100">پلتفرم محتوا</h1>
          <p className="text-[10px] text-gray-400">مدیریت هوشمند محتوا</p>
        </div>
      </div>

      {/* User Info */}
      <div className="px-4 py-3 border-b border-gray-100 dark:border-gray-800">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-brand-400 to-brand-600 flex items-center justify-center text-white font-bold text-sm shrink-0 shadow-md">
              {user.name?.charAt(0) || "؟"}
            </div>
            <span className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-400 rounded-full border-2 border-white dark:border-gray-900" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-medium text-gray-900 truncate dark:text-gray-100">{user.name}</p>
            <span className={cn("inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-medium mt-0.5", getRoleColor(user.role))}>
              {getRoleName(user.role)}
            </span>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
        {navItems.map((item, idx) => {
          const Icon = item.icon
          const isActive = pathname === item.href || (item.href !== "/admin" && pathname.startsWith(item.href))
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onNavigate}
              className={cn(
                "sidebar-link group animate-fade-in-up",
                isActive && "sidebar-link-active",
              )}
              style={{ animationDelay: `${idx * 0.05}s` }}
            >
              <Icon className={cn("w-[18px] h-[18px] shrink-0 transition-transform group-hover:scale-110", isActive && "scale-110")} />
              <span>{item.label}</span>
              {isActive && (
                <span className="mr-auto w-1.5 h-1.5 rounded-full bg-brand-500 animate-pulse" />
              )}
            </Link>
          )
        })}
      </nav>

      {/* Logout */}
      <div className="p-3 border-t border-gray-100 dark:border-gray-800">
        <form action="/api/auth/logout" method="POST">
          <button type="submit" className="sidebar-link w-full text-red-500 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-500/10 transition-all active:scale-95">
            <LogOut className="w-[18px] h-[18px]" />
            <span>خروج از حساب</span>
          </button>
        </form>
      </div>
    </aside>
  )
}