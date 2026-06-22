"use client"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { 
  FileText, Sparkles, Target, Users, PenTool, Link2, ListChecks,
  Save, X, Plus, Trash2, ChevronLeft, ChevronDown, Info, CheckCircle
} from "lucide-react"
import { Card, CardBody, CardHeader, CardTitle } from "@/components/ui/Card"
import Button from "@/components/ui/Button"
import { Input, Textarea, Select } from "@/components/ui/Input"
import PersianDatePicker from "@/components/ui/PersianDatePicker"
import { toast } from "@/components/ui/Toast"
import { slugify, toPersianDigits } from "@/lib/utils"

const defaultChecklist = [
  { id: 1, text: "کلمه کلیدی اصلی در عنوان H1 استفاده شده", done: false },
  { id: 2, text: "کلمه کلیدی در ۱۰۰ کلمه اول آمده", done: false },
  { id: 3, text: "حداقل ۳ زیرعنوان H2 وجود دارد", done: false },
  { id: 4, text: "محتوا حداقل کلمات مشخص شده را دارد", done: false },
  { id: 5, text: "پاراگراف‌ها کوتاه و خوانا هستند", done: false },
  { id: 6, text: "لینک‌های داخلی پیشنهادی استفاده شده", done: false },
  { id: 7, text: "منابع معتبر لینک شده‌اند", done: false },
  { id: 8, text: "تصویر شاخص تعیین شده", done: false },
  { id: 9, text: "متا دیسکریپشن نوشته شده", done: false },
  { id: 10, text: "محتوا اصلاح نگارشی شده", done: false },
]

export default function BriefForm({ userId, brief }) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [activeStep, setActiveStep] = useState(1)
  const [checklist, setChecklist] = useState(
    brief?.checklist ? JSON.parse(brief.checklist) : defaultChecklist
  )
  const [outlineItems, setOutlineItems] = useState(
    brief?.outline ? JSON.parse(brief.outline) : [{ heading: "", points: "" }]
  )

  const [form, setForm] = useState({
    title: brief?.title || "",
    topic: brief?.topic || "",
    searchIntent: brief?.searchIntent || "INFORMATIONAL",
    targetKeywords: brief?.targetKeywords || "",
    secondaryKeywords: brief?.secondaryKeywords || "",
    wordCount: brief?.wordCount || 1500,
    toneOfVoice: brief?.toneOfVoice || "حرفه‌ای و دوستانه",
    audience: brief?.audience || "",
    guidelines: brief?.guidelines || "",
    internalLinks: brief?.internalLinks || "",
    externalLinks: brief?.externalLinks || "",
    competitorUrls: brief?.competitorUrls || "",
    deadline: brief?.deadline ? new Date(brief.deadline).toISOString().split("T")[0] : "",
  })

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const addChecklistItem = () => {
    setChecklist([...checklist, { id: Date.now(), text: "", done: false }])
  }

  const updateChecklistItem = (id, text) => {
    setChecklist(checklist.map(c => c.id === id ? { ...c, text } : c))
  }

  const removeChecklistItem = (id) => {
    setChecklist(checklist.filter(c => c.id !== id))
  }

  const addOutlineItem = () => {
    setOutlineItems([...outlineItems, { heading: "", points: "" }])
  }

  const updateOutlineItem = (idx, field, value) => {
    setOutlineItems(outlineItems.map((o, i) => i === idx ? { ...o, [field]: value } : o))
  }

  const removeOutlineItem = (idx) => {
    setOutlineItems(outlineItems.filter((_, i) => i !== idx))
  }

  const steps = [
    { num: 1, label: "اطلاعات اصلی", icon: FileText },
    { num: 2, label: "سئو و کلمات کلیدی", icon: Target },
    { num: 3, label: "ساختار و چک‌لیست", icon: ListChecks },
    { num: 4, label: "دستورالعمل‌ها", icon: PenTool },
  ]

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)

    try {
      const payload = {
        ...form,
        wordCount: parseInt(form.wordCount) || 1500,
        outline: JSON.stringify(outlineItems.filter(o => o.heading)),
        checklist: checklist.filter(c => c.text),
        deadline: form.deadline || null,
      }

      const url = brief ? `/api/briefs/${brief.id}` : "/api/briefs"
      const method = brief ? "PATCH" : "POST"

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })
      const data = await res.json()

      if (!res.ok) {
        toast(data.error || "خطا در ذخیره بریف", "error")
        return
      }

      toast(brief ? "بریف به‌روزرسانی شد" : "بریف با موفقیت ایجاد شد", "success")
      router.push("/manager/briefs")
      router.refresh()
    } catch {
      toast("خطای شبکه", "error")
    } finally {
      setLoading(false)
    }
  }

  const canProceed = () => {
    if (activeStep === 1) return form.title && form.topic
    if (activeStep === 2) return form.targetKeywords
    return true
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            {brief ? "ویرایش بریف" : "ایجاد بریف محتوایی"}
          </h1>
          <p className="text-sm text-gray-500 mt-1">فرم جامع ساخت بریف با تمام جزئیات برای نویسنده</p>
        </div>
        <Button variant="secondary" icon={X} onClick={() => router.push("/manager/briefs")}>
          انصراف
        </Button>
      </div>

      {/* Progress Bar */}
      <div className="flex items-center gap-3">
        <div className="flex-1 h-2 rounded-full bg-gray-100 dark:bg-gray-800 overflow-hidden">
          <div
            className="h-full rounded-full bg-gradient-to-r from-brand-400 to-brand-600 transition-all duration-500 ease-out"
            style={{ width: `${(activeStep / 4) * 100}%` }}
          />
        </div>
        <span className="text-xs font-medium text-gray-500 shrink-0">
          {toPersianDigits(activeStep)} از ۴
        </span>
      </div>

      {/* Steps */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2">
        {steps.map((step, idx) => {
          const Icon = step.icon
          const isActive = activeStep === step.num
          const isDone = activeStep > step.num
          return (
            <div key={step.num} className="flex items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={() => setActiveStep(step.num)}
                className={`flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-medium transition-all duration-300 hover:scale-105 active:scale-95 ${
                  isActive
                    ? "bg-gradient-to-r from-brand-600 to-brand-500 text-white shadow-md shadow-brand-600/30 scale-105"
                    : isDone
                    ? "bg-brand-50 text-brand-700 dark:bg-brand-500/10 dark:text-brand-400 hover:bg-brand-100"
                    : "bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400 hover:bg-gray-200"
                }`}
              >
                <Icon className={`w-4 h-4 transition-transform ${isActive ? "scale-110" : ""}`} />
                <span className="hidden sm:inline">{step.label}</span>
                <span className="sm:hidden">{toPersianDigits(step.num)}</span>
                {isDone && <CheckCircle className="w-3 h-3 text-emerald-500 animate-pop" />}
              </button>
              {idx < steps.length - 1 && (
                <ChevronLeft className={`w-4 h-4 transition-colors ${isDone ? "text-brand-500" : "text-gray-300"}`} />
              )}
            </div>
          )
        })}
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Step 1: Basic Info */}
        {activeStep === 1 && (
          <div className="space-y-4 animate-fade-in">
            <Card>
              <CardHeader>
                <CardTitle><FileText className="w-5 h-5 text-brand-500 inline-block ml-2" />اطلاعات اصلی بریف</CardTitle>
              </CardHeader>
              <CardBody className="space-y-4">
                <Input
                  label="عنوان بریف *"
                  name="title"
                  value={form.title}
                  onChange={handleChange}
                  placeholder="مثال: راهنمای جامع بازاریابی دیجیتال در ۲۰۲۶"
                  required
                />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input
                    label="موضوع اصلی *"
                    name="topic"
                    value={form.topic}
                    onChange={handleChange}
                    placeholder="موضوع کلی محتوا"
                    required
                  />
                  <Select label="نوع جستجو (Search Intent)" name="searchIntent" value={form.searchIntent} onChange={handleChange}>
                    <option value="INFORMATIONAL">اطلاعاتی (Informational)</option>
                    <option value="COMMERCIAL">تجاری (Commercial)</option>
                    <option value="TRANSACTIONAL">تراکنشی (Transactional)</option>
                    <option value="NAVIGATIONAL">ناوبری (Navigational)</option>
                  </Select>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input
                    label="تعداد کلمات هدف"
                    name="wordCount"
                    type="number"
                    value={form.wordCount}
                    onChange={handleChange}
                    min="100"
                  />
                  <Input
                    label="لحن و صدای برند"
                    name="toneOfVoice"
                    value={form.toneOfVoice}
                    onChange={handleChange}
                    placeholder="مثال: حرفه‌ای و دوستانه"
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input
                    label="مخاطب هدف"
                    name="audience"
                    value={form.audience}
                    onChange={handleChange}
                    placeholder="مثال: مدیران مارکتینگ"
                  />
                  <PersianDatePicker
                    label="مهلت تحویل"
                    value={form.deadline}
                    onChange={(val) => setForm({ ...form, deadline: val })}
                  />
                </div>
              </CardBody>
            </Card>
          </div>
        )}

        {/* Step 2: SEO & Keywords */}
        {activeStep === 2 && (
          <div className="space-y-4 animate-fade-in">
            <Card>
              <CardHeader>
                <CardTitle><Target className="w-5 h-5 text-brand-500 inline-block ml-2" />کلمات کلیدی و سئو</CardTitle>
              </CardHeader>
              <CardBody className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5 dark:text-gray-300">کلمات کلیدی اصلی *</label>
                  <textarea
                    name="targetKeywords"
                    value={form.targetKeywords}
                    onChange={handleChange}
                    placeholder="کلمات کلیدی را با کاما جدا کنید: بازاریابی دیجیتال, سئو, تولید محتوا"
                    className="w-full rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 outline-none min-h-[80px] dark:bg-gray-800 dark:border-gray-700 dark:text-gray-100"
                    required
                  />
                </div>
                <Input
                  label="کلمات کلیدی فرعی (LSI)"
                  name="secondaryKeywords"
                  value={form.secondaryKeywords}
                  onChange={handleChange}
                  placeholder="کلمات مرتبط و طولانی"
                />
                <Input
                  label="URL رقبا (برای تحلیل)"
                  name="competitorUrls"
                  value={form.competitorUrls}
                  onChange={handleChange}
                  placeholder="https://competitor1.com/article, https://competitor2.com/post"
                />
                <div className="rounded-xl bg-blue-50 border border-blue-200 px-4 py-3 flex items-start gap-3 dark:bg-blue-500/10 dark:border-blue-500/20">
                  <Info className="w-5 h-5 text-blue-500 shrink-0 mt-0.5" />
                  <p className="text-sm text-blue-700 dark:text-blue-400">
                    کلمات کلیدی اصلی در عنوان، پاراگراف اول و زیرعنوان‌ها استفاده شوند. کلمات فرعی برای پوشش موضوعی محتوا به کار روند.
                  </p>
                </div>
              </CardBody>
            </Card>
          </div>
        )}

        {/* Step 3: Outline & Checklist */}
        {activeStep === 3 && (
          <div className="space-y-4 animate-fade-in">
            <Card>
              <CardHeader>
                <CardTitle><ListChecks className="w-5 h-5 text-brand-500 inline-block ml-2" />ساختار مقاله (Outline)</CardTitle>
                <Button type="button" variant="ghost" size="sm" icon={Plus} onClick={addOutlineItem}>افزودن بخش</Button>
              </CardHeader>
              <CardBody className="space-y-3">
                {outlineItems.map((item, idx) => (
                  <div key={idx} className="flex items-start gap-3 rounded-xl border border-gray-200 p-3 dark:border-gray-700 animate-fade-in-up hover:border-brand-300 dark:hover:border-brand-500/30 transition-all group" style={{ animationDelay: `${idx * 0.05}s` }}>
                    <div className="w-8 h-8 rounded-lg bg-brand-50 text-brand-600 flex items-center justify-center text-sm font-bold shrink-0 dark:bg-brand-500/10 dark:text-brand-400 group-hover:scale-110 transition-transform">
                      {toPersianDigits(idx + 1)}
                    </div>
                    <div className="flex-1 space-y-2">
                      <input
                        value={item.heading}
                        onChange={(e) => updateOutlineItem(idx, "heading", e.target.value)}
                        placeholder="عنوان بخش (H2)"
                        className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 outline-none dark:bg-gray-800 dark:border-gray-700 dark:text-gray-100"
                      />
                      <input
                        value={item.points}
                        onChange={(e) => updateOutlineItem(idx, "points", e.target.value)}
                        placeholder="نکات کلیدی این بخش (با کاما جدا کنید)"
                        className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-xs focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 outline-none dark:bg-gray-800 dark:border-gray-700 dark:text-gray-100"
                      />
                    </div>
                    <button type="button" onClick={() => removeOutlineItem(idx)} className="p-1.5 text-gray-400 hover:text-red-500 shrink-0">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </CardBody>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle><CheckCircle className="w-5 h-5 text-brand-500 inline-block ml-2" />چک‌لیست بریف</CardTitle>
                <Button type="button" variant="ghost" size="sm" icon={Plus} onClick={addChecklistItem}>افزودن مورد</Button>
              </CardHeader>
              <CardBody className="space-y-2">
                {checklist.map((item, idx) => (
                  <div key={item.id} className="flex items-center gap-3 rounded-lg p-2 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-all animate-fade-in-up group" style={{ animationDelay: `${idx * 0.03}s` }}>
                    <div className="w-5 h-5 rounded border-2 border-brand-300 bg-brand-50 flex items-center justify-center shrink-0 dark:border-brand-500/30 dark:bg-brand-500/10 group-hover:scale-110 transition-transform">
                      <CheckCircle className="w-3 h-3 text-brand-500" />
                    </div>
                    <input
                      value={item.text}
                      onChange={(e) => updateChecklistItem(item.id, e.target.value)}
                      placeholder="مورد چک‌لیست..."
                      className="flex-1 bg-transparent text-sm text-gray-700 dark:text-gray-300 outline-none focus:bg-white dark:focus:bg-gray-800 rounded-lg px-2 py-1 transition-all"
                    />
                    <button type="button" onClick={() => removeChecklistItem(item.id)} className="p-1 text-gray-400 hover:text-red-500 transition-all active:scale-90 opacity-0 group-hover:opacity-100">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </CardBody>
            </Card>
          </div>
        )}

        {/* Step 4: Guidelines */}
        {activeStep === 4 && (
          <div className="space-y-4 animate-fade-in">
            <Card>
              <CardHeader>
                <CardTitle><PenTool className="w-5 h-5 text-brand-500 inline-block ml-2" />دستورالعمل‌های نگارش</CardTitle>
              </CardHeader>
              <CardBody className="space-y-4">
                <Textarea
                  label="دستورالعمل‌های کلی"
                  name="guidelines"
                  value={form.guidelines}
                  onChange={handleChange}
                  placeholder="نکات خاص، قوانین نگارشی، فرمت مورد نظر..."
                  className="min-h-[120px]"
                />
                <Textarea
                  label="لینک‌های داخلی پیشنهادی"
                  name="internalLinks"
                  value={form.internalLinks}
                  onChange={handleChange}
                  placeholder="URL صفحات داخلی که باید لینک شوند..."
                />
                <Textarea
                  label="منابع و لینک‌های خارجی"
                  name="externalLinks"
                  value={form.externalLinks}
                  onChange={handleChange}
                  placeholder="منابع معتبر برای ارجاع..."
                />
              </CardBody>
            </Card>
          </div>
        )}

        {/* Navigation Buttons */}
        <div className="flex items-center justify-between gap-4 pt-4">
          <div>
            {activeStep > 1 && (
              <Button type="button" variant="secondary" icon={ChevronDown} onClick={() => setActiveStep(activeStep - 1)}>
                مرحله قبل
              </Button>
            )}
          </div>
          <div className="flex items-center gap-3">
            {activeStep < 4 ? (
              <Button
                type="button"
                icon={ChevronLeft}
                onClick={() => canProceed() ? setActiveStep(activeStep + 1) : toast("لطفاً فیلدهای الزامی را پر کنید", "warning")}
                disabled={!canProceed()}
              >
                مرحله بعد
              </Button>
            ) : (
              <Button type="submit" loading={loading} icon={Save}>
                {brief ? "ذخیره تغییرات" : "ایجاد بریف"}
              </Button>
            )}
          </div>
        </div>
      </form>
    </div>
  )
}