"use client"
import Link from "next/link"
import { Send, CheckCircle, FileText, ArrowLeft, ExternalLink, Clock } from "lucide-react"
import { Card, CardBody, CardHeader, CardTitle } from "@/components/ui/Card"
import StatCard from "@/components/ui/StatCard"
import { toJalali, timeAgo, toPersianDigits } from "@/lib/utils"

export default function PublisherDashboard({ user, stats, queue }) {
  const cards = [
    { label: "در انتظار انتشار", value: stats.approved, icon: Send, color: "text-amber-500", bg: "bg-amber-50 dark:bg-amber-500/10" },
    { label: "منتشر شده", value: stats.published, icon: CheckCircle, color: "text-emerald-500", bg: "bg-emerald-50 dark:bg-emerald-500/10" },
    { label: "کل محتواها", value: stats.total, icon: FileText, color: "text-brand-500", bg: "bg-brand-50 dark:bg-brand-500/10" },
  ]

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">داشبورد منتشرکننده</h1>
        <p className="text-sm text-gray-500 mt-1">کارتابل انتشار محتواهای تایید شده</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {cards.map((c, idx) => (
          <StatCard key={c.label} {...c} delay={idx * 0.08} />
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>صف انتشار</CardTitle>
          <Link href="/publisher/queue" className="text-sm text-brand-600 hover:text-brand-700 flex items-center gap-1">
            مشاهده همه <ArrowLeft className="w-4 h-4" />
          </Link>
        </CardHeader>
        <CardBody className="p-0">
          <div className="divide-y divide-gray-100 dark:divide-gray-800">
            {queue?.length === 0 && (
              <div className="p-8 text-center">
                <CheckCircle className="w-10 h-10 text-gray-300 mx-auto mb-3" />
                <p className="text-sm text-gray-400">محتوایی برای انتشار وجود ندارد</p>
              </div>
            )}
            {queue?.map((brief) => (
              <Link key={brief.id} href={`/publisher/brief/${brief.id}`} className="flex items-center justify-between p-4 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                <div className="min-w-0">
                  <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">{brief.title}</p>
                  <p className="text-xs text-gray-400 mt-0.5">
                    تایید شده توسط {brief.reviewedBy?.name || "—"} • {timeAgo(brief.updatedAt)}
                  </p>
                </div>
                <span className="badge bg-amber-50 text-amber-700 border-amber-200 shrink-0">
                  <Clock className="w-3 h-3" /> آماده انتشار
                </span>
              </Link>
            ))}
          </div>
        </CardBody>
      </Card>
    </div>
  )
}
