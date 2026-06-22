"use client"
import { useState } from "react"
import { useRouter } from "next/navigation"
import {
  ArrowRight, FileText, Target, Users, PenTool, Link2, ListChecks,
  Send, CheckCircle, XCircle, ExternalLink, MessageSquare, Clock,
  Calendar, User, AlertCircle, Sparkles, Save, Globe
} from "lucide-react"
import { Card, CardBody, CardHeader, CardTitle } from "@/components/ui/Card"
import Button from "@/components/ui/Button"
import Modal from "@/components/ui/Modal"
import { Input, Textarea, Select } from "@/components/ui/Input"
import { toast } from "@/components/ui/Toast"
import {
  getBriefStatusName, getBriefStatusColor, toJalali, toJalaliDateTime,
  timeAgo, getPriorityName, getPriorityColor, toPersianDigits
} from "@/lib/utils"

export default function BriefDetail({ brief, writers, userRole, userId, mode }) {
  const router = useRouter()
  const [assignModal, setAssignModal] = useState(false)
  const [reviewModal, setReviewModal] = useState(false)
  const [publishModal, setPublishModal] = useState(false)
  const [content, setContent] = useState(brief.content || "")
  const [excerpt, setExcerpt] = useState(brief.excerpt || "")
  const [comment, setComment] = useState("")
  const [loading, setLoading] = useState(false)

  // Assign form
  const [assignForm, setAssignForm] = useState({
    assigneeId: "",
    priority: "MEDIUM",
    dueDate: "",
    taskTitle: brief.title,
    taskDescription: "",
  })

  // Review form
  const [reviewForm, setReviewForm] = useState({ action: "approve", comment: "" })

  // Publish form
  const [publishForm, setPublishForm] = useState({
    publishedUrl: brief.publishedUrl || "",
    publishNotes: "",
  })

  const checklist = brief.checklist ? (typeof brief.checklist === "string" ? JSON.parse(brief.checklist) : brief.checklist) : []
  const outline = brief.outline ? (typeof brief.outline === "string" ? JSON.parse(brief.outline) : brief.outline) : []
  const keywords = brief.targetKeywords ? brief.targetKeywords.split(",").map(k => k.trim()).filter(Boolean) : []

  const handleAssign = async () => {
    if (!assignForm.assigneeId) { toast("یک نویسنده انتخاب کنید", "warning"); return }
    setLoading(true)
    try {
      const res = await fetch(`/api/briefs/${brief.id}/assign`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(assignForm),
      })
      const data = await res.json()
      if (!res.ok) { toast(data.error, "error"); return }
      toast("بریف با موفقیت ارجاع داده شد", "success")
      setAssignModal(false)
      router.refresh()
    } catch { toast("خطای شبکه", "error") }
    finally { setLoading(false) }
  }

  const handleSaveContent = async () => {
    setLoading(true)
    try {
      const res = await fetch(`/api/briefs/${brief.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content, excerpt }),
      })
      if (!res.ok) { toast("خطا در ذخیره", "error"); return }
      toast("محتوا ذخیره شد", "success")
    } catch { toast("خطای شبکه", "error") }
    finally { setLoading(false) }
  }

  const handleSubmitForReview = async () => {
    if (content.trim().length < 100) { toast("محتوا بسیار کوتاه است", "warning"); return }
    setLoading(true)
    try {
      const res = await fetch(`/api/briefs/${brief.id}/submit`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      })
      const data = await res.json()
      if (!res.ok) { toast(data.error, "error"); return }
      toast("محتوا برای تایید ارسال شد", "success")
      router.refresh()
    } catch { toast("خطای شبکه", "error") }
    finally { setLoading(false) }
  }

  const handleReview = async () => {
    setLoading(true)
    try {
      const res = await fetch(`/api/briefs/${brief.id}/review`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: reviewForm.action, comment: reviewForm.comment }),
      })
      const data = await res.json()
      if (!res.ok) { toast(data.error, "error"); return }
      toast(reviewForm.action === "approve" ? "بریف تایید شد" : "بریف رد شد", "success")
      setReviewModal(false)
      router.refresh()
    } catch { toast("خطای شبکه", "error") }
    finally { setLoading(false) }
  }

  const handlePublish = async () => {
    if (!publishForm.publishedUrl) { toast("URL نهایی الزامی است", "warning"); return }
    setLoading(true)
    try {
      const res = await fetch(`/api/briefs/${brief.id}/publish`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(publishForm),
      })
      const data = await res.json()
      if (!res.ok) { toast(data.error, "error"); return }
      toast("محتوا منتشر شد", "success")
      setPublishModal(false)
      router.refresh()
    } catch { toast("خطای شبکه", "error") }
    finally { setLoading(false) }
  }

  const handleAddComment = async () => {
    if (!comment.trim()) return
    setLoading(true)
    try {
      const res = await fetch("/api/comments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ briefId: brief.id, text: comment }),
      })
      if (!res.ok) { toast("خطا در ثبت کامنت", "error"); return }
      toast("کامنت ثبت شد", "success")
      setComment("")
      router.refresh()
    } catch { toast("خطای شبکه", "error") }
    finally { setLoading(false) }
  }

  const canAssign = (userRole === "ADMIN" || userRole === "CONTENT_MANAGER") && (brief.status === "DRAFT" || brief.status === "REJECTED")
  const canWrite = mode === "writer" && (brief.status === "ASSIGNED" || brief.status === "IN_PROGRESS" || brief.status === "REJECTED")
  const canSubmit = mode === "writer" && brief.assignedToId === userId && (brief.status === "ASSIGNED" || brief.status === "IN_PROGRESS" || brief.status === "REJECTED")
  const canReview = (userRole === "ADMIN" || userRole === "CONTENT_MANAGER") && brief.status === "SUBMITTED"
  const canPublish = (userRole === "ADMIN" || userRole === "PUBLISHER") && brief.status === "APPROVED"

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Back + Title */}
      <div className="flex items-start justify-between flex-wrap gap-4">
        <div className="flex items-start gap-3">
          <button onClick={() => router.back()} className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 mt-1">
            <ArrowRight className="w-5 h-5 text-gray-500" />
          </button>
          <div>
            <div className="flex items-center gap-3 mb-1">
              <h1 className="text-xl font-bold text-gray-900 dark:text-gray-100">{brief.title}</h1>
              <span className={`badge ${getBriefStatusColor(brief.status)}`}>{getBriefStatusName(brief.status)}</span>
            </div>
            <p className="text-sm text-gray-500">{brief.topic}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {canAssign && <Button icon={Send} onClick={() => setAssignModal(true)}>ارجاع به نویسنده</Button>}
          {canPublish && <Button icon={Globe} onClick={() => setPublishModal(true)}>ثبت انتشار</Button>}
        </div>
      </div>

      {/* Meta Info Bar */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Card><CardBody className="flex items-center gap-3">
          <User className="w-5 h-5 text-gray-400 shrink-0" />
          <div className="min-w-0"><p className="text-xs text-gray-400">ایجاد کننده</p><p className="text-sm font-medium truncate">{brief.createdBy?.name}</p></div>
        </CardBody></Card>
        <Card><CardBody className="flex items-center gap-3">
          <PenTool className="w-5 h-5 text-gray-400 shrink-0" />
          <div className="min-w-0"><p className="text-xs text-gray-400">نویسنده</p><p className="text-sm font-medium truncate">{brief.assignedTo?.name || "—"}</p></div>
        </CardBody></Card>
        <Card><CardBody className="flex items-center gap-3">
          <Calendar className="w-5 h-5 text-gray-400 shrink-0" />
          <div className="min-w-0"><p className="text-xs text-gray-400">مهلت تحویل</p><p className="text-sm font-medium truncate">{brief.deadline ? toJalali(brief.deadline) : "—"}</p></div>
        </CardBody></Card>
        <Card><CardBody className="flex items-center gap-3">
          <FileText className="w-5 h-5 text-gray-400 shrink-0" />
          <div className="min-w-0"><p className="text-xs text-gray-400">کلمات هدف</p><p className="text-sm font-medium">{toPersianDigits(brief.wordCount)}</p></div>
        </CardBody></Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Writer Workspace */}
          {canWrite && (
            <Card>
              <CardHeader>
                <CardTitle><PenTool className="w-5 h-5 text-brand-500 inline-block ml-2" />فضای نگارش</CardTitle>
                <div className="flex items-center gap-2">
                  <Button size="sm" variant="secondary" icon={Save} loading={loading} onClick={handleSaveContent}>ذخیره</Button>
                  <Button size="sm" icon={Send} loading={loading} onClick={handleSubmitForReview}>ارسال برای تایید</Button>
                </div>
              </CardHeader>
              <CardBody className="space-y-4">
                <Input label="خلاصه محتوا (Excerpt)" value={excerpt} onChange={(e) => setExcerpt(e.target.value)} placeholder="خلاصه کوتاه محتوا..." />
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5 dark:text-gray-300">محتوای کامل</label>
                  <textarea
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    placeholder="محتوای خود را اینجا بنویسید..."
                    className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm leading-7 focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 outline-none min-h-[400px] resize-y dark:bg-gray-800 dark:border-gray-700 dark:text-gray-100"
                  />
                  <p className="text-xs text-gray-400 mt-1">{toPersianDigits(content.length)} کاراکتر</p>
                </div>
              </CardBody>
            </Card>
          )}

          {/* Read-only content for manager/publisher */}
          {!canWrite && brief.content && (
            <Card>
              <CardHeader>
                <CardTitle><FileText className="w-5 h-5 text-brand-500 inline-block ml-2" />محتوای نوشته شده</CardTitle>
                {canReview && (
                  <Button size="sm" icon={CheckCircle} onClick={() => setReviewModal(true)}>بررسی و تایید</Button>
                )}
              </CardHeader>
              <CardBody>
                {brief.excerpt && <p className="text-sm text-gray-500 mb-4 pb-4 border-b border-gray-100 dark:border-gray-800">{brief.excerpt}</p>}
                <div className="prose prose-sm max-w-none text-gray-700 dark:text-gray-300 leading-7 whitespace-pre-wrap">{brief.content}</div>
              </CardBody>
            </Card>
          )}

          {/* Outline */}
          {outline.length > 0 && (
            <Card>
              <CardHeader><CardTitle><ListChecks className="w-5 h-5 text-brand-500 inline-block ml-2" />ساختار مقاله</CardTitle></CardHeader>
              <CardBody className="space-y-3">
                {outline.map((item, idx) => (
                  <div key={idx} className="flex items-start gap-3">
                    <div className="w-7 h-7 rounded-lg bg-brand-50 text-brand-600 flex items-center justify-center text-xs font-bold shrink-0 dark:bg-brand-500/10 dark:text-brand-400">
                      {toPersianDigits(idx + 1)}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{item.heading}</p>
                      {item.points && <p className="text-xs text-gray-500 mt-0.5">{item.points}</p>}
                    </div>
                  </div>
                ))}
              </CardBody>
            </Card>
          )}

          {/* Published URL */}
          {brief.status === "PUBLISHED" && brief.publishedUrl && (
            <Card>
              <CardHeader><CardTitle><Globe className="w-5 h-5 text-emerald-500 inline-block ml-2" />اطلاعات انتشار</CardTitle></CardHeader>
              <CardBody className="space-y-3">
                <div>
                  <p className="text-xs text-gray-400 mb-1">URL نهایی</p>
                  <a href={brief.publishedUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 text-sm text-brand-600 hover:text-brand-700">
                    {brief.publishedUrl} <ExternalLink className="w-4 h-4" />
                  </a>
                </div>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div><p className="text-xs text-gray-400">منتشر کننده</p><p className="font-medium">{brief.publishedBy?.name || "—"}</p></div>
                  <div><p className="text-xs text-gray-400">تاریخ انتشار</p><p className="font-medium">{toJalali(brief.publishedAt)}</p></div>
                </div>
                {brief.publishNotes && <div><p className="text-xs text-gray-400 mb-1">یادداشت</p><p className="text-sm text-gray-600 dark:text-gray-400">{brief.publishNotes}</p></div>}
              </CardBody>
            </Card>
          )}
        </div>

        {/* Right: Sidebar */}
        <div className="space-y-6">
          {/* Keywords */}
          {keywords.length > 0 && (
            <Card>
              <CardHeader><CardTitle><Target className="w-4 h-4 text-brand-500 inline-block ml-2" />کلمات کلیدی</CardTitle></CardHeader>
              <CardBody>
                <div className="flex flex-wrap gap-2">
                  {keywords.map((kw, i) => (
                    <span key={i} className="badge bg-brand-50 text-brand-700 border-brand-200">{kw}</span>
                  ))}
                </div>
                {brief.secondaryKeywords && (
                  <div className="mt-3 pt-3 border-t border-gray-100 dark:border-gray-800">
                    <p className="text-xs text-gray-400 mb-2">کلمات فرعی</p>
                    <div className="flex flex-wrap gap-2">
                      {brief.secondaryKeywords.split(",").map((k, i) => k.trim() && <span key={i} className="badge bg-gray-100 text-gray-600 border-gray-200">{k.trim()}</span>)}
                    </div>
                  </div>
                )}
              </CardBody>
            </Card>
          )}

          {/* Checklist */}
          {checklist.length > 0 && (
            <Card>
              <CardHeader><CardTitle><ListChecks className="w-4 h-4 text-brand-500 inline-block ml-2" />چک‌لیست</CardTitle></CardHeader>
              <CardBody className="space-y-2">
                {checklist.map((item, i) => (
                  <div key={i} className="flex items-start gap-2 text-sm">
                    <CheckCircle className="w-4 h-4 text-brand-400 mt-0.5 shrink-0" />
                    <span className="text-gray-600 dark:text-gray-400">{item.text}</span>
                  </div>
                ))}
              </CardBody>
            </Card>
          )}

          {/* Guidelines */}
          {brief.guidelines && (
            <Card>
              <CardHeader><CardTitle><PenTool className="w-4 h-4 text-brand-500 inline-block ml-2" />دستورالعمل‌ها</CardTitle></CardHeader>
              <CardBody>
                <p className="text-sm text-gray-600 dark:text-gray-400 whitespace-pre-wrap">{brief.guidelines}</p>
              </CardBody>
            </Card>
          )}

          {/* Links */}
          {(brief.internalLinks || brief.externalLinks || brief.competitorUrls) && (
            <Card>
              <CardHeader><CardTitle><Link2 className="w-4 h-4 text-brand-500 inline-block ml-2" />لینک‌ها</CardTitle></CardHeader>
              <CardBody className="space-y-3 text-sm">
                {brief.internalLinks && <div><p className="text-xs text-gray-400 mb-1">لینک‌های داخلی</p><p className="text-gray-600 dark:text-gray-400 whitespace-pre-wrap">{brief.internalLinks}</p></div>}
                {brief.externalLinks && <div><p className="text-xs text-gray-400 mb-1">لینک‌های خارجی</p><p className="text-gray-600 dark:text-gray-400 whitespace-pre-wrap">{brief.externalLinks}</p></div>}
                {brief.competitorUrls && <div><p className="text-xs text-gray-400 mb-1">URL رقبا</p><p className="text-gray-600 dark:text-gray-400 whitespace-pre-wrap">{brief.competitorUrls}</p></div>}
              </CardBody>
            </Card>
          )}

          {/* Activity Log */}
          {brief.activityLogs?.length > 0 && (
            <Card>
              <CardHeader><CardTitle><Clock className="w-4 h-4 text-brand-500 inline-block ml-2" />تاریخچه</CardTitle></CardHeader>
              <CardBody>
                <div className="space-y-3 max-h-[250px] overflow-y-auto">
                  {brief.activityLogs.map(log => (
                    <div key={log.id} className="flex items-start gap-2 text-sm">
                      <div className="w-2 h-2 rounded-full bg-brand-500 mt-2 shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="text-gray-600 dark:text-gray-400">{log.details}</p>
                        <p className="text-xs text-gray-400 mt-0.5">{log.user?.name} • {timeAgo(log.createdAt)}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardBody>
            </Card>
          )}
        </div>
      </div>

      {/* Comments */}
      <Card>
        <CardHeader><CardTitle><MessageSquare className="w-5 h-5 text-brand-500 inline-block ml-2" />بحث‌ها و کامنت‌ها</CardTitle></CardHeader>
        <CardBody className="space-y-4">
          <div className="flex gap-3">
            <Input value={comment} onChange={(e) => setComment(e.target.value)} placeholder="کامنت خود را بنویسید..." onKeyPress={(e) => e.key === "Enter" && handleAddComment()} />
            <Button variant="secondary" icon={MessageSquare} loading={loading} onClick={handleAddComment}>ارسال</Button>
          </div>
          {brief.comments?.length > 0 && (
            <div className="space-y-3 pt-3 border-t border-gray-100 dark:border-gray-800">
              {brief.comments.map(c => (
                <div key={c.id} className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-brand-100 text-brand-600 flex items-center justify-center text-xs font-bold shrink-0 dark:bg-brand-500/10 dark:text-brand-400">
                    {c.user?.name?.charAt(0)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{c.user?.name}</p>
                      <p className="text-xs text-gray-400">{timeAgo(c.createdAt)}</p>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-0.5">{c.text}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardBody>
      </Card>

      {/* Assign Modal */}
      <Modal open={assignModal} onClose={() => setAssignModal(false)} title="ارجاع به نویسنده" size="md">
        <div className="space-y-4">
          <Select label="انتخاب نویسنده *" value={assignForm.assigneeId} onChange={(e) => setAssignForm({ ...assignForm, assigneeId: e.target.value })}>
            <option value="">یک نویسنده انتخاب کنید</option>
            {writers?.map(w => <option key={w.id} value={w.id}>{w.name} — {w.email}</option>)}
          </Select>
          <div className="grid grid-cols-2 gap-4">
            <Select label="اولویت" value={assignForm.priority} onChange={(e) => setAssignForm({ ...assignForm, priority: e.target.value })}>
              <option value="LOW">کم</option>
              <option value="MEDIUM">متوسط</option>
              <option value="HIGH">زیاد</option>
              <option value="URGENT">فوری</option>
            </Select>
            <Input label="مهلت تحویل" type="date" value={assignForm.dueDate} onChange={(e) => setAssignForm({ ...assignForm, dueDate: e.target.value })} />
          </div>
          <Input label="عنوان تسک" value={assignForm.taskTitle} onChange={(e) => setAssignForm({ ...assignForm, taskTitle: e.target.value })} />
          <Textarea label="توضیحات تسک" value={assignForm.taskDescription} onChange={(e) => setAssignForm({ ...assignForm, taskDescription: e.target.value })} placeholder="توضیحات اضافی برای نویسنده..." />
          <div className="flex justify-end gap-3 pt-2">
            <Button variant="secondary" onClick={() => setAssignModal(false)}>انصراف</Button>
            <Button icon={Send} loading={loading} onClick={handleAssign}>ارجاع دهید</Button>
          </div>
        </div>
      </Modal>

      {/* Review Modal */}
      <Modal open={reviewModal} onClose={() => setReviewModal(false)} title="بررسی و تایید محتوا" size="md">
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => setReviewForm({ ...reviewForm, action: "approve" })}
              className={`rounded-xl border-2 p-4 text-center transition-all ${reviewForm.action === "approve" ? "border-emerald-500 bg-emerald-50 dark:bg-emerald-500/10" : "border-gray-200 dark:border-gray-700"}`}
            >
              <CheckCircle className={`w-8 h-8 mx-auto mb-2 ${reviewForm.action === "approve" ? "text-emerald-500" : "text-gray-400"}`} />
              <p className="text-sm font-medium">تایید و ارجاع به منتشرکننده</p>
            </button>
            <button
              onClick={() => setReviewForm({ ...reviewForm, action: "reject" })}
              className={`rounded-xl border-2 p-4 text-center transition-all ${reviewForm.action === "reject" ? "border-red-500 bg-red-50 dark:bg-red-500/10" : "border-gray-200 dark:border-gray-700"}`}
            >
              <XCircle className={`w-8 h-8 mx-auto mb-2 ${reviewForm.action === "reject" ? "text-red-500" : "text-gray-400"}`} />
              <p className="text-sm font-medium">رد و بازگشت به نویسنده</p>
            </button>
          </div>
          <Textarea label="یادداشت برای نویسنده (اختیاری)" value={reviewForm.comment} onChange={(e) => setReviewForm({ ...reviewForm, comment: e.target.value })} placeholder="بازخورد یا دلیل..." />
          <div className="flex justify-end gap-3 pt-2">
            <Button variant="secondary" onClick={() => setReviewModal(false)}>انصراف</Button>
            <Button
              variant={reviewForm.action === "approve" ? "success" : "danger"}
              icon={reviewForm.action === "approve" ? CheckCircle : XCircle}
              loading={loading}
              onClick={handleReview}
            >
              {reviewForm.action === "approve" ? "تایید نهایی" : "رد محتوا"}
            </Button>
          </div>
        </div>
      </Modal>

      {/* Publish Modal */}
      <Modal open={publishModal} onClose={() => setPublishModal(false)} title="ثبت اطلاعات انتشار" size="md">
        <div className="space-y-4">
          <div className="rounded-xl bg-emerald-50 border border-emerald-200 px-4 py-3 flex items-start gap-3 dark:bg-emerald-500/10 dark:border-emerald-500/20">
            <AlertCircle className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
            <p className="text-sm text-emerald-700 dark:text-emerald-400">این محتوا تایید شده است. پس از انتشار روی سایت، URL نهایی را ثبت کنید.</p>
          </div>
          <Input
            label="URL نهایی در سایت *"
            value={publishForm.publishedUrl}
            onChange={(e) => setPublishForm({ ...publishForm, publishedUrl: e.target.value })}
            placeholder="https://yoursite.com/article-url"
            type="url"
          />
          <Textarea
            label="یادداشت انتشار (اختیاری)"
            value={publishForm.publishNotes}
            onChange={(e) => setPublishForm({ ...publishForm, publishNotes: e.target.value })}
            placeholder="اطلاعات اضافی درباره انتشار..."
          />
          <div className="flex justify-end gap-3 pt-2">
            <Button variant="secondary" onClick={() => setPublishModal(false)}>انصراف</Button>
            <Button variant="success" icon={Globe} loading={loading} onClick={handlePublish}>ثبت و انتشار</Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
