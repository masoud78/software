"use client"
import { cn } from "@/lib/utils"

const variants = {
  primary: "bg-gradient-to-r from-brand-600 to-brand-500 bg-[length:200%_auto] hover:bg-[position:right_center] text-white hover:shadow-lg hover:shadow-brand-600/30 active:scale-95 shadow-sm shadow-brand-600/20 ripple",
  secondary: "bg-white text-gray-700 border border-gray-200 hover:bg-gray-50 active:scale-95 dark:bg-gray-800 dark:text-gray-200 dark:border-gray-700 dark:hover:bg-gray-700",
  danger: "bg-red-500 text-white hover:bg-red-600 active:scale-95 ripple",
  ghost: "text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800",
  success: "bg-emerald-500 text-white hover:bg-emerald-600 active:scale-95 ripple",
}

const sizes = {
  sm: "px-3 py-1.5 text-xs",
  md: "px-4 py-2.5 text-sm",
  lg: "px-6 py-3 text-base",
}

export default function Button({
  children,
  variant = "primary",
  size = "md",
  className,
  loading = false,
  disabled,
  icon: Icon,
  ...props
}) {
  return (
    <button
      className={cn(
        "inline-flex items-center justify-center gap-2 rounded-xl font-medium transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed",
        variants[variant],
        sizes[size],
        className
      )}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? (
        <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
      ) : Icon ? (
        <Icon className="w-4 h-4 transition-transform group-hover:scale-110" />
      ) : null}
      {children}
    </button>
  )
}