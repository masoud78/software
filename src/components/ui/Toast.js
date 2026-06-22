"use client"
import { create } from "zustand"
import { useEffect } from "react"
import { CheckCircle, AlertCircle, Info, XCircle, X } from "lucide-react"
import { cn } from "@/lib/utils"

const useToastStore = create((set) => ({
  toasts: [],
  addToast: (toast) =>
    set((state) => ({
      toasts: [...state.toasts, { id: Date.now() + Math.random(), ...toast }],
    })),
  removeToast: (id) =>
    set((state) => ({
      toasts: state.toasts.filter((t) => t.id !== id),
    })),
}))

export function toast(message, type = "success") {
  useToastStore.getState().addToast({ message, type })
}

function ToastItem({ toast, removeToast }) {
  useEffect(() => {
    const timer = setTimeout(() => removeToast(toast.id), 4000)
    return () => clearTimeout(timer)
  }, [toast.id, removeToast])

  const icons = {
    success: CheckCircle,
    error: XCircle,
    warning: AlertCircle,
    info: Info,
  }
  const colors = {
    success: "text-emerald-500",
    error: "text-red-500",
    warning: "text-amber-500",
    info: "text-blue-500",
  }
  const borders = {
    success: "border-l-emerald-500",
    error: "border-l-red-500",
    warning: "border-l-amber-500",
    info: "border-l-blue-500",
  }

  const Icon = icons[toast.type] || Info

  return (
    <div
      className={cn(
        "flex items-center gap-3 rounded-xl bg-white px-4 py-3 shadow-xl border border-gray-100 dark:bg-gray-800 dark:border-gray-700 min-w-[280px] border-l-4 animate-slide-in-right hover:scale-105 transition-transform",
        borders[toast.type]
      )}
    >
      <Icon className={cn("w-5 h-5 shrink-0 animate-pop", colors[toast.type])} />
      <span className="text-sm text-gray-700 dark:text-gray-200 flex-1">{toast.message}</span>
      <button onClick={() => removeToast(toast.id)} className="text-gray-400 hover:text-gray-600 transition-colors active:scale-90">
        <X className="w-4 h-4" />
      </button>
    </div>
  )
}

export function ToastContainer() {
  const { toasts, removeToast } = useToastStore()

  return (
    <div className="fixed bottom-4 left-4 z-[100] flex flex-col gap-2">
      {toasts.map((t) => (
        <ToastItem key={t.id} toast={t} removeToast={removeToast} />
      ))}
    </div>
  )
}