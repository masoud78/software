"use client"
import { useState } from "react"
import Link from "next/link"
import { ListChecks, Clock, PenTool, Send, CheckCircle } from "lucide-react"
import { Card, CardBody } from "@/components/ui/Card"
import { getBriefStatusName, getBriefStatusColor, getPriorityName, getPriorityColor, toJalali, toPersianDigits} from "@/lib/utils"

export default function ManagerTasks({ tasks }) {
  const [filter, setFilter] = useState("all")

  const filtered = tasks.filter(t => filter === "all" ? true : t.status === filter)

  const tabs = [
    { key: "all", label: "همه" },
    { key: "PENDING", label: "در انتظار" },
    { key: "IN_PROGRESS", label: "در حال انجام" },
    { key: "SUBMITTED", label: "ارسال شده" },
    { key: "COMPLETED", label: "تکمیل شده" },
  ]

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">تسک‌ها</h1>
        <p className="text-sm text-gray-500 mt-1">{toPersianDigits(tasks.length)} تسک ارجاع داده شده</p>
      </div>

      <div className="flex items-center gap-2 flex-wrap">
        {tabs.map(t => (
          <button key={t.key} onClick={() => setFilter(t.key)}
            className={`rounded-xl px-3 py-1.5 text-xs font-medium transition-all ${filter === t.key ? "bg-brand-600 text-white" : "bg-white text-gray-600 border border-gray-200 hover:bg-gray-50 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-700"}`}>
            {t.label}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <Card><CardBody className="text-center py-12">
          <ListChecks className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-sm text-gray-400">تسکی یافت نشد</p>
        </CardBody></Card>
      ) : (
        <div className="grid grid-cols-1 gap-3">
          {filtered.map(task => (
            <Link key={task.id} href={`/manager/briefs/${task.brief.id}`}>
              <Card hover className="cursor-pointer">
                <CardBody className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-semibold text-gray-900 dark:text-gray-100 truncate">{task.brief.title}</p>
                      <div className="flex items-center gap-3 mt-1 text-xs text-gray-400">
                        <span>نویسنده: {task.assignee?.name || "—"}</span>
                        <span>•</span>
                        <span>{toJalali(task.createdAt)}</span>
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
          ))}
        </div>
      )}
    </div>
  )
}
