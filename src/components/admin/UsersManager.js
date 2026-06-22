"use client"
import { useState } from "react"
import { Users, Plus, Trash2, Edit2, UserCheck, UserX, Shield } from "lucide-react"
import { Card, CardBody, CardHeader, CardTitle } from "@/components/ui/Card"
import Button from "@/components/ui/Button"
import Modal from "@/components/ui/Modal"
import { Input, Select } from "@/components/ui/Input"
import { toast } from "@/components/ui/Toast"
import { toJalali, toPersianDigits } from "@/lib/utils"
import { getRoleName, getRoleColor } from "@/lib/auth"

export default function UsersManager({ users, currentUserId }) {
  const [modalOpen, setModalOpen] = useState(false)
  const [editUser, setEditUser] = useState(null)
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({ name: "", email: "", password: "", role: "WRITER" })

  const openCreate = () => {
    setEditUser(null)
    setForm({ name: "", email: "", password: "", role: "WRITER" })
    setModalOpen(true)
  }

  const openEdit = (u) => {
    setEditUser(u)
    setForm({ name: u.name, email: u.email, password: "", role: u.role })
    setModalOpen(true)
  }

  const handleSave = async () => {
    if (!form.name || !form.email) { toast("نام و ایمیل الزامی است", "warning"); return }
    setLoading(true)
    try {
      const url = editUser ? `/api/users/${editUser.id}` : "/api/users"
      const method = editUser ? "PATCH" : "POST"
      const body = editUser ? { name: form.name, role: form.role, ...(form.password && { password: form.password }) } : form
      const res = await fetch(url, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) })
      const data = await res.json()
      if (!res.ok) { toast(data.error, "error"); return }
      toast(editUser ? "کاربر به‌روزرسانی شد" : "کاربر ایجاد شد", "success")
      setModalOpen(false)
      window.location.reload()
    } catch { toast("خطای شبکه", "error") }
    finally { setLoading(false) }
  }

  const handleToggle = async (u) => {
    try {
      await fetch(`/api/users/${u.id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ isActive: !u.isActive }) })
      toast(u.isActive ? "کاربر غیرفعال شد" : "کاربر فعال شد", "success")
      window.location.reload()
    } catch { toast("خطا", "error") }
  }

  const handleDelete = async (u) => {
    if (!confirm(`حذف کاربر "${u.name}"؟`)) return
    try {
      const res = await fetch(`/api/users/${u.id}`, { method: "DELETE" })
      if (!res.ok) { const d = await res.json(); toast(d.error, "error"); return }
      toast("کاربر حذف شد", "success")
      window.location.reload()
    } catch { toast("خطا", "error") }
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">مدیریت کاربران</h1>
          <p className="text-sm text-gray-500 mt-1">{toPersianDigits(users.length)} کاربر</p>
        </div>
        <Button icon={Plus} onClick={openCreate}>کاربر جدید</Button>
      </div>

      <div className="grid grid-cols-1 gap-3">
        {users.map(u => (
          <Card key={u.id} hover>
            <CardBody className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-3 min-w-0">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold shrink-0 ${u.isActive ? "bg-gradient-to-br from-brand-400 to-brand-600" : "bg-gray-300"}`}>
                  {u.name?.charAt(0)}
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-gray-900 dark:text-gray-100 truncate">{u.name}</p>
                  <p className="text-xs text-gray-400 truncate">{u.email}</p>
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <span className={`badge ${getRoleColor(u.role)}`}>{getRoleName(u.role)}</span>
                <span className={`badge ${u.isActive ? "bg-emerald-50 text-emerald-700 border-emerald-200" : "bg-gray-100 text-gray-500 border-gray-200"}`}>
                  {u.isActive ? "فعال" : "غیرفعال"}
                </span>
                <div className="flex items-center gap-1 mr-2">
                  <button onClick={() => openEdit(u)} className="p-1.5 rounded-lg text-gray-400 hover:bg-gray-100 hover:text-brand-600 dark:hover:bg-gray-800">
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button onClick={() => handleToggle(u)} className="p-1.5 rounded-lg text-gray-400 hover:bg-gray-100 hover:text-amber-600 dark:hover:bg-gray-800">
                    {u.isActive ? <UserX className="w-4 h-4" /> : <UserCheck className="w-4 h-4" />}
                  </button>
                  {u.id !== currentUserId && (
                    <button onClick={() => handleDelete(u)} className="p-1.5 rounded-lg text-gray-400 hover:bg-gray-100 hover:text-red-500 dark:hover:bg-gray-800">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            </CardBody>
          </Card>
        ))}
      </div>

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editUser ? "ویرایش کاربر" : "کاربر جدید"} size="md">
        <div className="space-y-4">
          <Input label="نام *" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="نام کامل" />
          <Input label="ایمیل *" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="email@example.com" disabled={editUser} />
          <Input label={editUser ? "رمز عبور جدید (خالی = بدون تغییر)" : "رمز عبور *"} type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} placeholder="••••••••" />
          <Select label="نقش" value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })}>
            
            <option value="CONTENT_MANAGER">مدیر محتوا</option>
            <option value="WRITER">نویسنده</option>
            <option value="PUBLISHER">منتشرکننده</option>
          </Select>
          <div className="flex justify-end gap-3 pt-2">
            <Button variant="secondary" onClick={() => setModalOpen(false)}>انصراف</Button>
            <Button loading={loading} onClick={handleSave}>{editUser ? "ذخیره" : "ایجاد کاربر"}</Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
