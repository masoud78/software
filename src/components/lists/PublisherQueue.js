"use client"
import Link from "next/link"
import { Send, Clock, FileText } from "lucide-react"
import { Card, CardBody } from "@/components/ui/Card"
import { toJalali, timeAgo } from "@/lib/utils"

export default function PublisherQueue({ briefs }) {
  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">صف انتشار</h1>
        <p className="text-sm text-gray-500 mt-1">{briefs.length.toLocaleString("fa-IR")} محتوای آماده انتشار</p>
      </div>

      {briefs.length === 0 ? (
        <Card><CardBody className="text-center py-12">
          <Send className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-sm text-gray-400">محتوایی برای انتشار وجود ندارد</p>
        </CardBody></Card>
      ) : (
        <div className="grid grid-cols-1 gap-3">
          {briefs.map(brief => (
            <Link key={brief.id} href={`/publisher/brief/${brief.id}`}>
              <Card hover className="cursor-pointer">
                <CardBody className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    {brief.cluster && <div className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: brief.cluster.color }} />}
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-semibold text-gray-900 dark:text-gray-100 truncate">{brief.title}</p>
                      <div className="flex items-center gap-3 mt-1 text-xs text-gray-400">
                        <span>تایید توسط: {brief.reviewedBy?.name || "—"}</span>
                        <span>•</span>
                        <span>{timeAgo(brief.updatedAt)}</span>
                      </div>
                    </div>
                  </div>
                  <span className="badge bg-amber-50 text-amber-700 border-amber-200 shrink-0">
                    <Clock className="w-3 h-3" /> آماده انتشار
                  </span>
                </CardBody>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
