"use client"
import { useState } from "react"
import { Settings, Save, Webhook, Bell, Shield, Database } from "lucide-react"
import { Card, CardBody, CardHeader, CardTitle } from "@/components/ui/Card"
import Button from "@/components/ui/Button"
import { Input, Textarea } from "@/components/ui/Input"
import { toast } from "@/components/ui/Toast"

export default function SystemSettings({ user }) {
  const [loading, setLoading] = useState(false)
  const [settings, setSettings] = useState({
    appName: "پلتفرم مدیریت محتوا",
    webhookUrl: "",
    notifyOnSubmit: true,
    notifyOnApprove: true,
    notifyOnPublish: true,
  })

  const handleSave = async () => {
    setLoading(true)
    await new Promise(r => setTimeout(r, 800))
    toast("تنظیمات ذخیره شد", "success")
    setLoading(false)
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">تنظیمات سیستم</h1>
        <p className="text-sm text-gray-500 mt-1">پیکربندی پلتفرم و اتوماسیون</p>
      </div>

      <Card>
        <CardHeader><CardTitle><Settings className="w-5 h-5 text-brand-500 inline-block ml-2" />تنظیمات عمومی</CardTitle></CardHeader>
        <CardBody className="space-y-4">
          <Input label="نام پلتفرم" value={settings.appName} onChange={(e) => setSettings({ ...settings, appName: e.target.value })} />
        </CardBody>
      </Card>

      <Card>
        <CardHeader><CardTitle><Webhook className="w-5 h-5 text-brand-500 inline-block ml-2" />اتوماسیون و Webhook</CardTitle></CardHeader>
        <CardBody className="space-y-4">
          <Input label="URL وب‌هوک" value={settings.webhookUrl} onChange={(e) => setSettings({ ...settings, webhookUrl: e.target.value })} placeholder="https://api.yourservice.com/webhook" />
          <div className="rounded-xl bg-blue-50 border border-blue-200 px-4 py-3 dark:bg-blue-500/10 dark:border-blue-500/20">
            <p className="text-sm text-blue-700 dark:text-blue-400">با تنظیم وب‌هوک، رویدادهای سیستم (ایجاد بریف، ارسال، تایید، انتشار) به صورت خودکار به سیستم خارجی ارسال می‌شوند.</p>
          </div>
        </CardBody>
      </Card>

      <Card>
        <CardHeader><CardTitle><Bell className="w-5 h-5 text-brand-500 inline-block ml-2" />اعلان‌ها</CardTitle></CardHeader>
        <CardBody className="space-y-3">
          {[
            { key: "notifyOnSubmit", label: "اعلان عند ارسال محتوا توسط نویسنده" },
            { key: "notifyOnApprove", label: "اعلان عند تایید محتوا توسط مدیر" },
            { key: "notifyOnPublish", label: "اعلان عند انتشار محتوا" },
          ].map(item => (
            <label key={item.key} className="flex items-center justify-between cursor-pointer">
              <span className="text-sm text-gray-700 dark:text-gray-300">{item.label}</span>
              <button
                type="button"
                onClick={() => setSettings({ ...settings, [item.key]: !settings[item.key] })}
                className={`relative w-11 h-6 rounded-full transition-all ${settings[item.key] ? "bg-brand-600" : "bg-gray-300 dark:bg-gray-700"}`}
              >
                <span className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-all ${settings[item.key] ? "right-0.5" : "right-5"}`} />
              </button>
            </label>
          ))}
        </CardBody>
      </Card>

      <Card>
        <CardHeader><CardTitle><Shield className="w-5 h-5 text-brand-500 inline-block ml-2" />امنیت و دسترسی</CardTitle></CardHeader>
        <CardBody>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="rounded-xl bg-gray-50 p-4 dark:bg-gray-800/50">
              <p className="text-xs text-gray-400 mb-1">نقش شما</p>
              <p className="font-medium">مدیر ارشد</p>
            </div>
            <div className="rounded-xl bg-gray-50 p-4 dark:bg-gray-800/50">
              <p className="text-xs text-gray-400 mb-1">مدل احراز هویت</p>
              <p className="font-medium">JWT + Cookie</p>
            </div>
          </div>
        </CardBody>
      </Card>

      <div className="flex justify-end">
        <Button icon={Save} loading={loading} onClick={handleSave}>ذخیره تنظیمات</Button>
      </div>
    </div>
  )
}
