"use client"
import { useState } from "react"
import { FolderTree, Plus, Trash2, Edit2, Tag, FileText } from "lucide-react"
import { Card, CardBody, CardHeader, CardTitle } from "@/components/ui/Card"
import Button from "@/components/ui/Button"
import Modal from "@/components/ui/Modal"
import { Input, Textarea } from "@/components/ui/Input"
import { toast } from "@/components/ui/Toast"
import { toJalali } from "@/lib/utils"

export default function ClustersManager({ clusters }) {
  const [modalOpen, setModalOpen] = useState(false)
  const [editCluster, setEditCluster] = useState(null)
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({ name: "", description: "", color: "#6366f1", keywords: [] })
  const [newKeyword, setNewKeyword] = useState("")

  const colors = ["#6366f1", "#ec4899", "#f59e0b", "#10b981", "#3b82f6", "#8b5cf6", "#ef4444", "#06b6d4"]

  const openCreate = () => {
    setEditCluster(null)
    setForm({ name: "", description: "", color: "#6366f1", keywords: [] })
    setModalOpen(true)
  }

  const openEdit = (c) => {
    setEditCluster(c)
    setForm({ name: c.name, description: c.description || "", color: c.color, keywords: c.keywords || [] })
    setModalOpen(true)
  }

  const addKeyword = () => {
    if (newKeyword.trim()) {
      setForm({ ...form, keywords: [...form.keywords, { term: newKeyword.trim(), searchVolume: 0, difficulty: "MEDIUM" }] })
      setNewKeyword("")
    }
  }

  const removeKeyword = (idx) => {
    setForm({ ...form, keywords: form.keywords.filter((_, i) => i !== idx) })
  }

  const handleSave = async () => {
    if (!form.name) { toast("نام کلاستر الزامی است", "warning"); return }
    setLoading(true)
    try {
      const url = editCluster ? `/api/clusters/${editCluster.id}` : "/api/clusters"
      const method = editCluster ? "PATCH" : "POST"
      const body = editCluster ? { name: form.name, description: form.description, color: form.color } : form
      const res = await fetch(url, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) })
      if (!res.ok) { toast("خطا", "error"); return }
      toast(editCluster ? "کلاستر به‌روزرسانی شد" : "کلاستر ایجاد شد", "success")
      setModalOpen(false)
      window.location.reload()
    } catch { toast("خطای شبکه", "error") }
    finally { setLoading(false) }
  }

  const handleDelete = async (c) => {
    if (!confirm(`حذف کلاستر "${c.name}"؟`)) return
    try {
      await fetch(`/api/clusters/${c.id}`, { method: "DELETE" })
      toast("کلاستر حذف شد", "success")
      window.location.reload()
    } catch { toast("خطا", "error") }
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">کلاسترهای معنایی</h1>
          <p className="text-sm text-gray-500 mt-1">{clusters.length.toLocaleString("fa-IR")} کلاستر</p>
        </div>
        <Button icon={Plus} onClick={openCreate}>کلاستر جدید</Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {clusters.map(c => (
          <Card key={c.id} hover>
            <CardBody>
              <div className="flex items-start justify-between gap-3 mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: c.color + "20" }}>
                    <FolderTree className="w-5 h-5" style={{ color: c.color }} />
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">{c.name}</h3>
                    <p className="text-xs text-gray-400">{toJalali(c.createdAt)}</p>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <button onClick={() => openEdit(c)} className="p-1.5 rounded-lg text-gray-400 hover:bg-gray-100 hover:text-brand-600 dark:hover:bg-gray-800">
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button onClick={() => handleDelete(c)} className="p-1.5 rounded-lg text-gray-400 hover:bg-gray-100 hover:text-red-500 dark:hover:bg-gray-800">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
              {c.description && <p className="text-sm text-gray-500 mb-3">{c.description}</p>}
              <div className="flex items-center gap-4 text-xs">
                <span className="flex items-center gap-1.5 text-gray-500"><Tag className="w-3.5 h-3.5" /> {c._count?.keywords?.toLocaleString("fa-IR") || "۰"} کلمه کلیدی</span>
                <span className="flex items-center gap-1.5 text-gray-500"><FileText className="w-3.5 h-3.5" /> {c._count?.briefs?.toLocaleString("fa-IR") || "۰"} بریف</span>
              </div>
              {c.keywords?.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mt-3 pt-3 border-t border-gray-100 dark:border-gray-800">
                  {c.keywords.slice(0, 5).map(k => <span key={k.id} className="badge bg-gray-100 text-gray-600 border-gray-200">{k.term}</span>)}
                  {c.keywords.length > 5 && <span className="badge bg-gray-100 text-gray-500 border-gray-200">+{(c.keywords.length - 5).toLocaleString("fa-IR")}</span>}
                </div>
              )}
            </CardBody>
          </Card>
        ))}
      </div>

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editCluster ? "ویرایش کلاستر" : "کلاستر معنایی جدید"} size="md">
        <div className="space-y-4">
          <Input label="نام کلاستر *" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="مثال: دیجیتال مارکتینگ" />
          <Textarea label="توضیحات" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="توضیح کلاستر..." />
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5 dark:text-gray-300">رنگ</label>
            <div className="flex items-center gap-2 flex-wrap">
              {colors.map(c => (
                <button key={c} type="button" onClick={() => setForm({ ...form, color: c })}
                  className={`w-8 h-8 rounded-lg transition-all ${form.color === c ? "ring-2 ring-offset-2 ring-gray-400 scale-110" : ""}`}
                  style={{ backgroundColor: c }} />
              ))}
            </div>
          </div>
          {!editCluster && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5 dark:text-gray-300">کلمات کلیدی</label>
              <div className="flex gap-2">
                <Input value={newKeyword} onChange={(e) => setNewKeyword(e.target.value)} placeholder="کلمه کلیدی..." onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), addKeyword())} />
                <Button type="button" variant="secondary" icon={Plus} onClick={addKeyword}>افزودن</Button>
              </div>
              {form.keywords.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-3">
                  {form.keywords.map((k, i) => (
                    <span key={i} className="badge bg-brand-50 text-brand-700 border-brand-200 cursor-pointer" onClick={() => removeKeyword(i)}>
                      {k.term} ✕
                    </span>
                  ))}
                </div>
              )}
            </div>
          )}
          <div className="flex justify-end gap-3 pt-2">
            <Button variant="secondary" onClick={() => setModalOpen(false)}>انصراف</Button>
            <Button loading={loading} onClick={handleSave}>{editCluster ? "ذخیره" : "ایجاد کلاستر"}</Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
