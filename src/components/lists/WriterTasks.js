"use client"
import { useState } from "react"
import Link from "next/link"
import { Clock, PenTool, Send, CheckCircle, AlertTriangle, FileText } from "lucide-react"
import { Card, CardBody } from "@/components/ui/Card"
import { getBriefStatusName, getBriefStatusColor, getPriorityName, getPriorityColor, toJalali } from "@/lib/utils"

export default function WriterTasks({ tasks }) {
  const [filter, setFilter] = useState("active")

  const filtered = tasks.filter(t => {
    if (filter === "active") return ["PENDING", "IN_PROGRESS", "SUBMITTED"].includes(t.status)
    if (filter === "completed") return t.status === "COMPLETED"
    return true
  })

  const tabs = [
    { key: "active", label: "فعال", count: tasks.filter(t => ["PENDING", "IN_PROGRESS", "SUBMITTED"].includes(t.status)).length },
    { key: "completed", label: "تکمیل شده", count: tasks.filter(t => t.status === "COMPLETED").length },
    { key: "all", label: "همه", count: tasks.length },
  ]

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">کارتابل من</h1>
        <p className="text-sm text-gray-500 mt-1">{tasks.length.toLocaleString("fa-IR")} تسک</p>
      </div>

      <div className="flex items-center gap-2">
        {tabs.map(t => (
          <button key={t.key} onClick={() => setFilter(t.key)}
            className={`rounded-xl px-4 py-2 text-sm font-medium transition-all ${filter === t.key ? "bg-brand-600 text-white" : "bg-white text-gray-600 border border-gray-200 hover:bg-gray-50 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-700"}`}>
            {t.label} ({t.count.toLocaleString("fa-IR")})
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <Card><CardBody className="text-center py-12">
          <FileText className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-sm text-gray-400">تسکی یافت نشد</p>
        </CardBody></Card>
      ) : (
        <div className="grid grid-cols-1 gap-3">
          {filtered.map(task => {
            const isOverdue = task.dueDate && new Date(task.dueDate) < new Date() && ["PENDING", "IN_PROGRESS"].includes(task.status)
            return (
              <Link key={task.id} href={`/writer/brief/${task.brief.id}`}>
                <Card hover className="cursor-pointer">
                  <CardBody className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                      {task.brief.cluster && <div className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: task.brief.cluster.color }} />}
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-semibold text-gray-900 dark:text-gray-100 truncate">{task.brief.title}</p>
                        <div className="flex items-center gap-3 mt-1 text-xs text-gray-400">
                          <span>{task.brief.cluster?.name || "—"}</span>
                          <span>•</span>
                          <span>{task.brief.wordCount?.toLocaleString("fa-IR")} کلمه</span>
                          <span>•</span>
                          <span>{toJalali(task.createdAt)}</span>
                          {isOverdue && <span className="text-red-500 flex items-center gap-1"><AlertTriangle className="w-3 h-3" /> عقب‌افتاده</span>}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <span className={`badge ${getPriorityColor(task.priority)}`}>{getPriorityName(task.priority)}</span>
                      <span className={`badge ${getBriefStatusColor(task.brief.status)}`}>{getBriefStatusName(task.brief.status)}</span>
                    </div>
                  </CardBody>
                </Card>
              </Link>
            )
          })}
        </div>
      )}
    </div>
  )
}
