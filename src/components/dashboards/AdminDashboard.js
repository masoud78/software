"use client"
import Link from "next/link"
import { Users, FileText, CheckCircle, Activity, ArrowLeft, TrendingUp } from "lucide-react"
import { Card, CardBody, CardHeader, CardTitle } from "@/components/ui/Card"
import StatCard from "@/components/ui/StatCard"
import { getBriefStatusName, getBriefStatusColor, toJalali, timeAgo, toPersianDigits } from "@/lib/utils"

export default function AdminDashboard({ stats, recentActivity, recentBriefs }) {
  const cards = [
    { label: "کاربران", value: stats.totalUsers, icon: Users, color: "text-blue-500", bg: "bg-blue-50 dark:bg-blue-500/10" },
    { label: "بریف‌ها", value: stats.totalBriefs, icon: FileText, color: "text-brand-500", bg: "bg-brand-50 dark:bg-brand-500/10" },
    { label: "منتشر شده", value: stats.publishedBriefs, icon: CheckCircle, color: "text-emerald-500", bg: "bg-emerald-50 dark:bg-emerald-500/10" },
  ]

  const statusLabels = {
    DRAFT: "پیش‌نویس", ASSIGNED: "ارجاع داده شده", IN_PROGRESS: "در حال نگارش",
    SUBMITTED: "ارسال برای تایید", APPROVED: "تایید شده", PUBLISHED: "منتشر شده",
    REJECTED: "رد شده", ARCHIVED: "آرشیو شده",
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">داشبورد مدیر ارشد</h1>
        <p className="text-sm text-gray-500 mt-1">نمای کلی سیستم و آمار کل پلتفرم</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        {cards.map((c, idx) => (
          <StatCard key={c.label} {...c} delay={idx * 0.08} />
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Status Breakdown */}
        <Card>
          <CardHeader>
            <CardTitle>توزیع وضعیت بریف‌ها</CardTitle>
            <TrendingUp className="w-5 h-5 text-gray-400" />
          </CardHeader>
          <CardBody>
            <div className="space-y-3">
              {Object.entries(statusLabels).map(([key, label]) => {
                const count = stats.statusBreakdown?.[key] || 0
                const total = stats.totalBriefs || 1
                const pct = Math.round((count / total) * 100)
                return (
                  <div key={key}>
                    <div className="flex items-center justify-between text-sm mb-1">
                      <span className="text-gray-600 dark:text-gray-400">{label}</span>
                      <span className="font-medium text-gray-900 dark:text-gray-100">{toPersianDigits(count)}</span>
                    </div>
                    <div className="h-2 rounded-full bg-gray-100 dark:bg-gray-800 overflow-hidden">
                      <div className="h-full rounded-full bg-brand-500 transition-all" style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                )
              })}
            </div>
          </CardBody>
        </Card>

        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle>آخرین فعالیت‌ها</CardTitle>
            <Activity className="w-5 h-5 text-gray-400" />
          </CardHeader>
          <CardBody>
            <div className="space-y-3 max-h-[300px] overflow-y-auto">
              {recentActivity?.length === 0 && <p className="text-sm text-gray-400 text-center py-8">فعالیتی ثبت نشده</p>}
              {recentActivity?.map((log) => (
                <div key={log.id} className="flex items-start gap-3 text-sm">
                  <div className="w-2 h-2 rounded-full bg-brand-500 mt-2 shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-gray-700 dark:text-gray-300">{log.details}</p>
                    <p className="text-xs text-gray-400 mt-0.5">{log.user?.name} • {timeAgo(log.createdAt)}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardBody>
        </Card>
      </div>

      {/* Recent Briefs */}
      <Card>
        <CardHeader>
          <CardTitle>آخرین بریف‌ها</CardTitle>
          <Link href="/admin/briefs" className="text-sm text-brand-600 hover:text-brand-700 flex items-center gap-1">
            مشاهده همه <ArrowLeft className="w-4 h-4" />
          </Link>
        </CardHeader>
        <CardBody className="p-0">
          <div className="divide-y divide-gray-100 dark:divide-gray-800">
            {recentBriefs?.map((brief) => (
              <Link key={brief.id} href={`/admin/briefs`} className="flex items-center justify-between p-4 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">{brief.title}</p>
                    <p className="text-xs text-gray-400">{brief.assignedTo?.name || "بدون ارجاع"} • {toJalali(brief.createdAt)}</p>
                  </div>
                </div>
                <span className={`badge ${getBriefStatusColor(brief.status)} shrink-0`}>{getBriefStatusName(brief.status)}</span>
              </Link>
            ))}
          </div>
        </CardBody>
      </Card>
    </div>
  )
}
