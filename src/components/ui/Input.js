"use client"
import { cn } from "@/lib/utils"
import { useState } from "react"

export function Input({ label, error, className, ...props }) {
  return (
    <div className="w-full">
      {label && <label className="block text-sm font-medium text-gray-700 mb-1.5 dark:text-gray-300">{label}</label>}
      <input
        className={cn(
          "w-full rounded-xl border bg-white px-4 py-2.5 text-sm text-gray-900 placeholder-gray-400 transition-all focus:ring-2 outline-none dark:bg-gray-800 dark:text-gray-100",
          error
            ? "border-red-300 focus:border-red-500 focus:ring-red-500/20"
            : "border-gray-200 focus:border-brand-500 focus:ring-brand-500/20 dark:border-gray-700",
          className
        )}
        {...props}
      />
      {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
    </div>
  )
}

export function Textarea({ label, error, className, ...props }) {
  return (
    <div className="w-full">
      {label && <label className="block text-sm font-medium text-gray-700 mb-1.5 dark:text-gray-300">{label}</label>}
      <textarea
        className={cn(
          "w-full rounded-xl border bg-white px-4 py-2.5 text-sm text-gray-900 placeholder-gray-400 transition-all focus:ring-2 outline-none min-h-[100px] resize-y dark:bg-gray-800 dark:text-gray-100",
          error
            ? "border-red-300 focus:border-red-500 focus:ring-red-500/20"
            : "border-gray-200 focus:border-brand-500 focus:ring-brand-500/20 dark:border-gray-700",
          className
        )}
        {...props}
      />
      {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
    </div>
  )
}

export function Select({ label, error, children, className, ...props }) {
  return (
    <div className="w-full">
      {label && <label className="block text-sm font-medium text-gray-700 mb-1.5 dark:text-gray-300">{label}</label>}
      <select
        className={cn(
          "w-full rounded-xl border bg-white px-4 py-2.5 text-sm text-gray-900 transition-all focus:ring-2 outline-none cursor-pointer dark:bg-gray-800 dark:text-gray-100",
          error
            ? "border-red-300 focus:border-red-500 focus:ring-red-500/20"
            : "border-gray-200 focus:border-brand-500 focus:ring-brand-500/20 dark:border-gray-700",
          className
        )}
        {...props}
      >
        {children}
      </select>
      {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
    </div>
  )
}
