"use client"
import Link from "next/link"
import { CheckCircle, ExternalLink, Globe } from "lucide-react"
import { Card, CardBody } from "@/components/ui/Card"
import { toJalali, toPersianDigits} from "@/lib/utils"

export default function PublishedList({ briefs }) {
  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">منتشر شده‌ها</h1>
        <p className="text-sm text-gray-500 mt-1">{toPersianDigits(briefs.length)} محتوای منتشر شده</p>
      </div>

      {briefs.length === 0 ? (
        <Card><CardBody className="text-center py-12">
          <Globe className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-sm text-gray-400">محتوایی منتشر نشده</p>
        </CardBody></Card>
      ) : (
        <div className="grid grid-cols-1 gap-3">
          {briefs.map(brief => (
            <Link key={brief.id} href={`/publisher/brief/${brief.id}`}>
              <Card hover className="cursor-pointer">
                <CardBody className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-semibold text-gray-900 dark:text-gray-100 truncate">{brief.title}</p>
                      <div className="flex items-center gap-3 mt-1 text-xs text-gray-400">
                        <span>{brief.publishedBy?.name || "—"}</span>
                        <span>•</span>
                        <span>{toJalali(brief.publishedAt)}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    {brief.publishedUrl && (
                      <a href={brief.publishedUrl} target="_blank" rel="noopener noreferrer" onClick={(e) => e.stopPropagation()} className="p-1.5 rounded-lg text-gray-400 hover:text-brand-600">
                        <ExternalLink className="w-4 h-4" />
                      </a>
                    )}
                    <span className="badge bg-emerald-50 text-emerald-700 border-emerald-200">
                      <CheckCircle className="w-3 h-3" /> منتشر شده
                    </span>
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
