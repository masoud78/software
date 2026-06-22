"use client"
import { useEffect, useState } from "react"
import { cn } from "@/lib/utils"
import { toPersianDigits } from "@/lib/utils"

export default function StatCard({ label, value, icon: Icon, color, bg, delay = 0 }) {
  const [displayValue, setDisplayValue] = useState(0)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    const target = typeof value === "number" ? value : 0
    if (target === 0) {
      setDisplayValue(0)
      return
    }
    const duration = 800
    const steps = 30
    const stepValue = target / steps
    let current = 0
    const interval = setInterval(() => {
      current += stepValue
      if (current >= target) {
        setDisplayValue(target)
        clearInterval(interval)
      } else {
        setDisplayValue(Math.floor(current))
      }
    }, duration / steps)
    return () => clearInterval(interval)
  }, [value])

  return (
    <div
      className={cn(
        "stat-card p-5 group cursor-default",
        mounted ? "animate-fade-in-up" : "opacity-0"
      )}
      style={{ animationDelay: `${delay}s` }}
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-500">{label}</p>
          <p className="text-2xl font-bold text-gray-900 dark:text-gray-100 mt-1 count-animation">
            {toPersianDigits(displayValue)}
          </p>
        </div>
        <div className={cn("w-12 h-12 rounded-xl flex items-center justify-center transition-all duration-300 group-hover:scale-110 group-hover:rotate-6", bg)}>
          <Icon className={cn("w-6 h-6", color)} />
        </div>
      </div>
      <div className="mt-3 h-1 rounded-full bg-gray-100 dark:bg-gray-800 overflow-hidden">
        <div
          className="h-full rounded-full bg-gradient-to-r from-brand-400 to-brand-600 transition-all duration-1000"
          style={{ width: mounted ? "100%" : "0%" }}
        />
      </div>
    </div>
  )
}