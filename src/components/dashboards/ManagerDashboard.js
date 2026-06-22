"use client"
import Link from "next/link"
import { FileText, Clock, PenTool, Send, CheckCircle, FolderTree, Plus, ArrowLeft } from "lucide-react"
import { Card, CardBody, CardHeader, CardTitle } from "@/components/ui/Card"
import Button from "@/components/ui/Button"
import StatCard from "@/components/ui/StatCard"
import { getBriefStatusName, getBriefStatusColor, toJalali } from "@/lib/utils"

export default function ManagerDashboard({ user, stats, recentBriefs, writersCount }) {
  const cards = [
    { label: "بریف‌های من", value: stats.totalBriefs, icon: FileText, color: "text-brand-500", bg: "bg-brand-50 dark:bg-brand-500/10" },
    { label: "در حال نگارش", value: stats.inProgress, icon: PenTool, color: "text-indigo-500", bg: "bg-indigo-50 dark:bg-indigo-500/10" },
    { label: "ارسال برای تایید", value: stats.submitted, icon: Send, color: "text-purple-500", bg: "bg-purple-50 dark:bg-purple-500/10" },
    { label: "تایید شده", value: stats.approved, icon: CheckCircle, color: "text-emerald-500", bg: "bg-emerald-50 dark:bg-emerald-500/10" },
  ]

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">داشبورد مدیر محتوا</h1>
          <p className="text-sm text-gray-500 mt-1">مدیریت بریف‌ها، کلاسترها و ارجاع تسک‌ها</p>
        </div>
        <Link href="/manager/briefs/new">
          <Button icon={Plus}>ایجاد بریف جدید</Button>
        </Link>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {cards.map((c, idx) => (
          <StatCard key={c.label} {...c} delay={idx * 0.08} />
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>بریف‌های اخیر</CardTitle>
          <Link href="/manager/briefs" className="text-sm text-brand-600 hover:text-brand-700 flex items-center gap-1">
            مشاهده همه <ArrowLeft className="w-4 h-4" />
          </Link>
        </CardHeader>
        <CardBody className="p-0">
          <div className="divide-y divide-gray-100 dark:divide-gray-800">
            {recentBriefs?.length === 0 && (
              <div className="p-8 text-center">
                <p className="text-sm text-gray-400 mb-4">هنوز بریفی ایجاد نشده</p>
                <Link href="/manager/briefs/new">
                  <Button icon={Plus} size="sm">ایجاد اولین بریف</Button>
                </Link>
              </div>
            )}
            {recentBriefs?.map((brief) => (
              <Link key={brief.id} href={`/manager/briefs/${brief.id}`} className="flex items-center justify-between p-4 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                <div className="flex items-center gap-3 min-w-0">
                  {brief.cluster && <div className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: brief.cluster.color }} />}
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
