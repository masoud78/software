"use client"
import { useState, useRef, useEffect } from "react"
import { Calendar, ChevronRight, ChevronLeft, Check } from "lucide-react"
import { cn } from "@/lib/utils"

// Convert Gregorian to Jalali (Persian) date
function gregorianToJalali(gy, gm, gd) {
  const g_d_m = [0, 31, 59, 90, 120, 151, 181, 212, 243, 273, 304, 334]
  let jy
  if (gy > 1600) {
    jy = 979
    gy -= 1600
  } else {
    jy = 0
    gy -= 621
  }
  const gy2 = gm > 2 ? gy + 1 : gy
  let days = 365 * gy + Math.floor((gy2 + 3) / 4) - Math.floor((gy2 + 99) / 100) + Math.floor((gy2 + 399) / 400) - 80 + gd + g_d_m[gm - 1]
  jy += 33 * Math.floor(days / 12053)
  days %= 12053
  jy += 4 * Math.floor(days / 1461)
  days %= 1461
  if (days > 365) {
    jy += Math.floor((days - 1) / 365)
    days = (days - 1) % 365
  }
  const jm = days < 186 ? 1 + Math.floor(days / 31) : 7 + Math.floor((days - 186) / 30)
  const jd = 1 + (days < 186 ? days % 31 : (days - 186) % 30)
  return [jy, jm, jd]
}

// Convert Jalali to Gregorian date
function jalaliToGregorian(jy, jm, jd) {
  let gy
  if (jy > 979) {
    gy = 1600
    jy -= 979
  } else {
    gy = 621
  }
  let days = 365 * jy + Math.floor(jy / 33) * 8 + Math.floor((jy % 33 + 3) / 4) + 78 + jd + (jm < 7 ? (jm - 1) * 31 : (jm - 7) * 30 + 186)
  gy += 400 * Math.floor(days / 146097)
  days %= 146097
  if (days > 36524) {
    gy += 100 * Math.floor(--days / 36524)
    days %= 36524
    if (days >= 365) days++
  }
  gy += 4 * Math.floor(days / 1461)
  days %= 1461
  if (days > 365) {
    gy += Math.floor((days - 1) / 365)
    days = (days - 1) % 365
  }
  let gd = days + 1
  const sal_a = [0, 31, 29, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31]
  let gm = 0
  for (gm = 0; gm < 13; gm++) {
    const v = sal_a[gm]
    if (gd <= v) break
    gd -= v
  }
  return [gy, gm, gd]
}

const persianMonths = [
  "فروردین", "اردیبهشت", "خرداد", "تیر", "مرداد", "شهریور",
  "مهر", "آبان", "آذر", "دی", "بهمن", "اسفند"
]

const persianDays = ["شنبه", "یکشنبه", "دوشنبه", "سه‌شنبه", "چهارشنبه", "پنجشنبه", "جمعه"]
// In JS getDay(): 0=Sunday, 6=Saturday. In Persian week starts Saturday.
// Saturday=0, Sunday=1, Monday=2, Tuesday=3, Wednesday=4, Friday=6
const dayMap = [1, 2, 3, 4, 5, 6, 0] // maps JS getDay to Persian index

function toPersianDigits(str) {
  return String(str).replace(/[0-9]/g, (d) => "۰۱۲۳۴۵۶۷۸۹"[d])
}

export default function PersianDatePicker({ value, onChange, label = "مهلت تحویل" }) {
  const [open, setOpen] = useState(false)
  const ref = useRef(null)

  // Parse current value
  let currentJalali = null
  if (value) {
    const d = new Date(value)
    currentJalali = gregorianToJalali(d.getFullYear(), d.getMonth() + 1, d.getDate())
  }

  const [viewYear, setViewYear] = useState(currentJalali?.[0] || 1405)
  const [viewMonth, setViewMonth] = useState(currentJalali?.[1] || 1)

  useEffect(() => {
    if (currentJalali) {
      setViewYear(currentJalali[0])
      setViewMonth(currentJalali[1])
    }
  }, [value])

  useEffect(() => {
    function handleClickOutside(e) {
      if (ref.current && !ref.current.contains(e.target)) {
        setOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  const daysInMonth = [31, 31, 31, 31, 31, 31, 30, 30, 30, 30, 30, 29]
  // Leap year check for Esfand
  const isLeap = (viewYear % 33 === 1 || viewYear % 33 === 5 || viewYear % 33 === 9 || viewYear % 33 === 13 || viewYear % 33 === 17 || viewYear % 33 === 22 || viewYear % 33 === 26 || viewYear % 33 === 30)
  const monthDays = viewMonth === 12 && isLeap ? 30 : daysInMonth[viewMonth - 1]

  // Get first day of month (Persian week starts Saturday)
  const [gy, gm, gd] = jalaliToGregorian(viewYear, viewMonth, 1)
  const firstDay = new Date(gy, gm - 1, gd).getDay()
  const startOffset = dayMap[firstDay]

  const handleSelect = (day) => {
    const [gY, gM, gD] = jalaliToGregorian(viewYear, viewMonth, day)
    const dateStr = `${gY}-${String(gM).padStart(2, "0")}-${String(gD).padStart(2, "0")}`
    onChange(dateStr)
    setOpen(false)
  }

  const prevMonth = () => {
    if (viewMonth === 1) { setViewMonth(12); setViewYear(viewYear - 1) }
    else setViewMonth(viewMonth - 1)
  }
  const nextMonth = () => {
    if (viewMonth === 12) { setViewMonth(1); setViewYear(viewYear + 1) }
    else setViewMonth(viewMonth + 1)
  }

  const selectedDay = currentJalali && currentJalali[0] === viewYear && currentJalali[1] === viewMonth ? currentJalali[2] : null

  const todayJalali = gregorianToJalali(new Date().getFullYear(), new Date().getMonth() + 1, new Date().getDate())
  const isToday = (day) => todayJalali[0] === viewYear && todayJalali[1] === viewMonth && todayJalali[2] === day

  return (
    <div className="relative" ref={ref}>
      {label && <label className="block text-sm font-medium text-gray-700 mb-1.5 dark:text-gray-300">{label}</label>}
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="w-full flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm text-gray-900 transition-all focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 outline-none dark:bg-gray-800 dark:border-gray-700 dark:text-gray-100 hover:border-brand-300"
      >
        <Calendar className="w-4 h-4 text-brand-500" />
        <span className={value ? "" : "text-gray-400"}>
          {value
            ? `${toPersianDigits(currentJalali[2])} ${persianMonths[currentJalali[1] - 1]} ${toPersianDigits(currentJalali[0])}`
            : "انتخاب تاریخ..."}
        </span>
      </button>

      {open && (
        <div className="absolute z-50 mt-2 w-72 rounded-2xl border border-gray-200 bg-white p-4 shadow-2xl animate-scale-in dark:border-gray-700 dark:bg-gray-900">
          {/* Header */}
          <div className="flex items-center justify-between mb-4">
            <button type="button" onClick={prevMonth} className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-all active:scale-90">
              <ChevronRight className="w-4 h-4" />
            </button>
            <div className="text-center">
              <span className="text-sm font-bold text-gray-900 dark:text-gray-100">
                {persianMonths[viewMonth - 1]} {toPersianDigits(viewYear)}
              </span>
            </div>
            <button type="button" onClick={nextMonth} className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-all active:scale-90">
              <ChevronLeft className="w-4 h-4" />
            </button>
          </div>

          {/* Day headers */}
          <div className="grid grid-cols-7 gap-1 mb-2">
            {["ش", "ی", "د", "س", "چ", "پ", "ج"].map((d, i) => (
              <div key={i} className="text-center text-[10px] font-medium text-gray-400 py-1">{d}</div>
            ))}
          </div>

          {/* Days grid */}
          <div className="grid grid-cols-7 gap-1">
            {Array.from({ length: startOffset }).map((_, i) => (
              <div key={`empty-${i}`} />
            ))}
            {Array.from({ length: monthDays }).map((_, i) => {
              const day = i + 1
              const isSelected = day === selectedDay
              const today = isToday(day)
              return (
                <button
                  key={day}
                  type="button"
                  onClick={() => handleSelect(day)}
                  className={cn(
                    "aspect-square rounded-lg text-xs font-medium transition-all hover:scale-110 active:scale-95",
                    isSelected
                      ? "bg-gradient-to-br from-brand-500 to-brand-600 text-white shadow-md shadow-brand-600/30"
                      : today
                      ? "bg-brand-50 text-brand-700 dark:bg-brand-500/10 dark:text-brand-400 border border-brand-300"
                      : "text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800"
                  )}
                >
                  {toPersianDigits(day)}
                </button>
              )
            })}
          </div>

          {/* Footer */}
          <div className="mt-3 pt-3 border-t border-gray-100 dark:border-gray-800 flex items-center justify-between">
            <button
              type="button"
              onClick={() => { onChange(""); setOpen(false) }}
              className="text-xs text-gray-400 hover:text-red-500 transition-colors"
            >
              پاک کردن
            </button>
            <span className="text-[10px] text-gray-400">
              {toPersianDigits(todayJalali[2])} {persianMonths[todayJalali[1] - 1]} {toPersianDigits(todayJalali[0])}
            </span>
          </div>
        </div>
      )}
    </div>
  )
}