import { clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs) {
  return twMerge(clsx(inputs))
}

// تبدیل تاریخ به شمسی و فارسی
export function toJalali(date) {
  if (!date) return "—"
  try {
    const d = new Date(date)
    return d.toLocaleDateString("fa-IR", {
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  } catch {
    return "—"
  }
}

// تبدیل تاریخ و زمان به شمسی
export function toJalaliDateTime(date) {
  if (!date) return "—"
  try {
    const d = new Date(date)
    return d.toLocaleDateString("fa-IR", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  } catch {
    return "—"
  }
}

// زمان نسبی فارسی
export function timeAgo(date) {
  if (!date) return "—"
  const now = new Date()
  const diff = now - new Date(date)
  const seconds = Math.floor(diff / 1000)
  const minutes = Math.floor(seconds / 60)
  const hours = Math.floor(minutes / 60)
  const days = Math.floor(hours / 24)

  if (days > 0) return `${days} روز پیش`
  if (hours > 0) return `${hours} ساعت پیش`
  if (minutes > 0) return `${minutes} دقیقه پیش`
  return "همین الان"
}

// تولید slug از عنوان
export function slugify(text) {
  return text
    .toString()
    .trim()
    .replace(/\s+/g, "-")
    .replace(/[^\w\u0600-\u06FF-]/g, "")
    .toLowerCase()
}

// تبدیل اعداد انگلیسی به فارسی
export function toPersianDigits(str) {
  return String(str).replace(/[0-9]/g, (d) => "۰۱۲۳۴۵۶۷۸۹"[d])
}

// نام فارسی وضعیت بریف
export function getBriefStatusName(status) {
  const names = {
    DRAFT: "پیش‌نویس",
    ASSIGNED: "ارجاع داده شده",
    IN_PROGRESS: "در حال نگارش",
    SUBMITTED: "ارسال برای تایید",
    UNDER_REVIEW: "در حال بررسی",
    APPROVED: "تایید شده",
    PUBLISHED: "منتشر شده",
    REJECTED: "رد شده",
    ARCHIVED: "آرشیو شده",
  }
  return names[status] || status
}

// رنگ وضعیت بریف
export function getBriefStatusColor(status) {
  const colors = {
    DRAFT: "bg-gray-100 text-gray-700 border-gray-200",
    ASSIGNED: "bg-blue-50 text-blue-700 border-blue-200",
    IN_PROGRESS: "bg-indigo-50 text-indigo-700 border-indigo-200",
    SUBMITTED: "bg-purple-50 text-purple-700 border-purple-200",
    UNDER_REVIEW: "bg-orange-50 text-orange-700 border-orange-200",
    APPROVED: "bg-teal-50 text-teal-700 border-teal-200",
    PUBLISHED: "bg-emerald-50 text-emerald-700 border-emerald-200",
    REJECTED: "bg-red-50 text-red-700 border-red-200",
    ARCHIVED: "bg-zinc-100 text-zinc-600 border-zinc-200",
  }
  return colors[status] || "bg-gray-100 text-gray-700 border-gray-200"
}

// نام اولویت تسک
export function getPriorityName(priority) {
  const names = { LOW: "کم", MEDIUM: "متوسط", HIGH: "زیاد", URGENT: "فوری" }
  return names[priority] || priority
}

// رنگ اولویت تسک
export function getPriorityColor(priority) {
  const colors = {
    LOW: "bg-gray-100 text-gray-600",
    MEDIUM: "bg-blue-100 text-blue-700",
    HIGH: "bg-orange-100 text-orange-700",
    URGENT: "bg-red-100 text-red-700",
  }
  return colors[priority] || "bg-gray-100 text-gray-600"
}
