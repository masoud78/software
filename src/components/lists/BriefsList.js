"use client"
import { useState } from "react"
import Link from "next/link"
import { Search, FileText, Plus, Filter } from "lucide-react"
import { Card, CardBody } from "@/components/ui/Card"
import Button from "@/components/ui/Button"
import { getBriefStatusName, getBriefStatusColor, toJalali, toPersianDigits} from "@/lib/utils"

export default function BriefsList({ briefs, basePath, showNewButton, showCreator }) {
  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState("")

  const filtered = briefs.filter(b => {
    const matchSearch = !search || b.title.includes(search) || b.topic?.includes(search)
    const matchStatus = !statusFilter || b.status === statusFilter
    return matchSearch && matchStatus
  })

  const statuses = ["DRAFT", "ASSIGNED", "IN_PROGRESS", "SUBMITTED", "APPROVED", "PUBLISHED", "REJECTED"]

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">بریف‌های محتوا</h1>
          <p className="text-sm text-gray-500 mt-1">{toPersianDigits(briefs.length)} بریف</p>
        </div>
        {showNewButton && (
          <Link href="/manager/briefs/new">
            <Button icon={Plus}>بریف جدید</Button>
          </Link>
        )}
      </div>

      {/* Filters */}
      <div className="flex items-center gap-3 flex-wrap">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="جستجو در بریف‌ها..."
            className="w-full rounded-xl border border-gray-200 bg-white pr-10 pl-4 py-2.5 text-sm focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 outline-none dark:bg-gray-800 dark:border-gray-700 dark:text-gray-100"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 outline-none cursor-pointer dark:bg-gray-800 dark:border-gray-700 dark:text-gray-100"
        >
          <option value="">همه وضعیت‌ها</option>
          {statuses.map(s => <option key={s} value={s}>{getBriefStatusName(s)}</option>)}
        </select>
      </div>

      {/* List */}
      {filtered.length === 0 ? (
        <Card>
          <CardBody className="text-center py-12">
            <FileText className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-sm text-gray-400">بریفی یافت نشد</p>
          </CardBody>
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-3">
          {filtered.map(brief => (
            <Link key={brief.id} href={`${basePath}/${brief.id}`}>
              <Card hover className="cursor-pointer">
                <CardBody className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-semibold text-gray-900 dark:text-gray-100 truncate">{brief.title}</p>
                      <div className="flex items-center gap-3 mt-1 text-xs text-gray-400">
                        <span>{toJalali(brief.createdAt)}</span>
                        {showCreator && brief.createdBy && (
                          <>
                            <span>•</span>
                            <span>{brief.createdBy.name}</span>
                          </>
                        )}
                        {brief.assignedTo && (
                          <>
                            <span>•</span>
                            <span>ارجاع به: {brief.assignedTo.name}</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                  <span className={`badge ${getBriefStatusColor(brief.status)} shrink-0`}>
                    {getBriefStatusName(brief.status)}
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
