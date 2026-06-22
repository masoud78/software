"use client"
import Link from "next/link"
import { PenTool, FileText, ArrowLeft } from "lucide-react"
import { Card, CardBody } from "@/components/ui/Card"
import { getBriefStatusName, getBriefStatusColor, toJalali, toPersianDigits} from "@/lib/utils"

export default function WriterWorkspace({ briefs }) {
  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">فضای نگارش</h1>
        <p className="text-sm text-gray-500 mt-1">محتواهای در حال نگارش شما</p>
      </div>

      {briefs.length === 0 ? (
        <Card><CardBody className="text-center py-12">
          <PenTool className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-sm text-gray-400">محتوایی برای نگارش ندارید</p>
          <Link href="/writer/tasks" className="inline-flex items-center gap-1 text-sm text-brand-600 mt-3">
            مشاهده کارتابل <ArrowLeft className="w-4 h-4" />
          </Link>
        </CardBody></Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {briefs.map(brief => (
            <Link key={brief.id} href={`/writer/brief/${brief.id}`}>
              <Card hover className="cursor-pointer h-full">
                <CardBody>
                  <div className="flex items-center gap-2 mb-3">
                    <span className={`badge ${getBriefStatusColor(brief.status)} mr-auto`}>{getBriefStatusName(brief.status)}</span>
                  </div>
                  <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-2 line-clamp-2">{brief.title}</h3>
                  <p className="text-xs text-gray-400">{toJalali(brief.updatedAt)} • {toPersianDigits(brief.wordCount)} کلمه هدف</p>
                  <div className="mt-3 pt-3 border-t border-gray-100 dark:border-gray-800 flex items-center justify-between">
                    <span className="text-xs text-gray-400">{brief.content ? `${toPersianDigits(brief.content.length)} کاراکتر نوشته شده` : "شروع نگارش"}</span>
                    <span className="text-sm text-brand-600 flex items-center gap-1">شروع <ArrowLeft className="w-4 h-4" /></span>
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
