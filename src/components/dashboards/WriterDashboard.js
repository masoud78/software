"use client"
import Link from "next/link"
import { Clock, PenTool, Send, CheckCircle, AlertTriangle, ArrowLeft, FileText } from "lucide-react"
import { Card, CardBody, CardHeader, CardTitle } from "@/components/ui/Card"
import Button from "@/components/ui/Button"
import StatCard from "@/components/ui/StatCard"
import { getBriefStatusName, getBriefStatusColor, getPriorityName, getPriorityColor, toJalali, toPersianDigits } from "@/lib/utils"

export default function WriterDashboard({ user, stats, myTasks }) {
  const cards = [
    { label: "در انتظار", value: stats.pending, icon: Clock, color: "text-blue-500", bg: "bg-blue-50 dark:bg-blue-500/10" },
    { label: "در حال نگارش", value: stats.inProgress, icon: PenTool, color: "text-indigo-500", bg: "bg-indigo-50 dark:bg-indigo-500/10" },
    { label: "ارسال شده", value: stats.submitted, icon: Send, color: "text-purple-500", bg: "bg-purple-50 dark:bg-purple-500/10" },
    { label: "تکمیل شده", value: stats.completed, icon: CheckCircle, color: "text-emerald-500", bg: "bg-emerald-50 dark:bg-emerald-500/10" },
  ]

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">داشبورد نویسنده</h1>
        <p className="text-sm text-gray-500 mt-1">کارتابل تسک‌ها و فضای نگارش شما</p>
      </div>

      {stats.overdue > 0 && (
        <div className="rounded-xl bg-amber-50 border border-amber-200 px-4 py-3 flex items-center gap-3 dark:bg-amber-500/10 dark:border-amber-500/20">
          <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0" />
          <p className="text-sm text-amber-700 dark:text-amber-400">{toPersianDigits(stats.overdue)} تسک از موعد تحویل گذشته است</p>
        </div>
      )}

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {cards.map((c, idx) => (
          <StatCard key={c.label} {...c} delay={idx * 0.08} />
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>تسک‌های فعال</CardTitle>
          <Link href="/writer/tasks" className="text-sm text-brand-600 hover:text-brand-700 flex items-center gap-1">
            مشاهده همه <ArrowLeft className="w-4 h-4" />
          </Link>
        </CardHeader>
        <CardBody className="p-0">
          <div className="divide-y divide-gray-100 dark:divide-gray-800">
            {myTasks?.length === 0 && (
              <div className="p-8 text-center">
                <FileText className="w-10 h-10 text-gray-300 mx-auto mb-3" />
                <p className="text-sm text-gray-400">تسک فعالی ندارید</p>
              </div>
            )}
            {myTasks?.map((task) => (
              <Link key={task.id} href={`/writer/brief/${task.brief.id}`} className="flex items-center justify-between p-4 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">{task.brief.title}</p>
                    <p className="text-xs text-gray-400">{toJalali(task.createdAt)}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <span className={`badge ${getPriorityColor(task.priority)}`}>{getPriorityName(task.priority)}</span>
                  <span className={`badge ${getBriefStatusColor(task.brief.status)}`}>{getBriefStatusName(task.brief.status)}</span>
                </div>
              </Link>
            ))}
          </div>
        </CardBody>
      </Card>
    </div>
  )
}
