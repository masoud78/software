"use client"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Sparkles, Mail, Lock, Eye, EyeOff, ArrowLeft, Zap, ShieldCheck, Rocket } from "lucide-react"
import { toast } from "@/components/ui/Toast"

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      })
      const data = await res.json()

      if (!res.ok) {
        setError(data.error || "خطا در ورود")
        return
      }

      toast("با موفقیت وارد شدید", "success")
      
      const paths = {
        CONTENT_MANAGER: "/manager",
        WRITER: "/writer",
        PUBLISHER: "/publisher",
      }
      router.push(paths[data.user.role] || "/admin")
      router.refresh()
    } catch {
      setError("خطای شبکه. دوباره تلاش کنید.")
    } finally {
      setLoading(false)
    }
  }

  const quickLogin = (em) => {
    setEmail(em)
    setPassword("12345678")
  }

  const features = [
    { icon: Zap, text: "تولید محتوای هوشمند" },
    { icon: ShieldCheck, text: "مدیریت امن بریف‌ها" },
    { icon: Rocket, text: "انتشار سریع محتوا" },
  ]

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-mesh relative overflow-hidden">
      {/* Animated background orbs */}
      <div className="absolute top-1/4 right-1/4 w-72 h-72 bg-brand-400/20 rounded-full blur-3xl animate-float" />
      <div className="absolute bottom-1/4 left-1/4 w-96 h-96 bg-pink-400/10 rounded-full blur-3xl animate-float" style={{ animationDelay: "1s" }} />
      <div className="absolute top-1/2 left-1/2 w-64 h-64 bg-emerald-400/10 rounded-full blur-3xl animate-float" style={{ animationDelay: "2s" }} />

      <div className="w-full max-w-md relative z-10">
        {/* Logo & Title */}
        <div className={`flex flex-col items-center mb-8 ${mounted ? "animate-bounce-in" : "opacity-0"}`}>
          <div className="relative">
            <div className="absolute inset-0 bg-brand-500 rounded-2xl blur-xl opacity-40 animate-pulse-glow" />
            <div className="relative w-16 h-16 rounded-2xl bg-gradient-to-br from-brand-500 to-brand-700 flex items-center justify-center shadow-xl shadow-brand-600/30 animate-float">
              <Sparkles className="w-8 h-8 text-white" />
            </div>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mt-4 text-glow-brand">
            پلتفرم مدیریت محتوا
          </h1>
          <p className="text-sm text-gray-500 mt-1">سیستم جامع مدیریت تولید و انتشار محتوا</p>
        </div>

        {/* Feature pills */}
        <div className={`flex flex-wrap justify-center gap-2 mb-6 ${mounted ? "animate-fade-in-up stagger-1" : "opacity-0"}`}>
          {features.map((f, i) => {
            const Icon = f.icon
            return (
              <div
                key={i}
                className="flex items-center gap-1.5 rounded-full bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm border border-gray-200/50 dark:border-gray-700/50 px-3 py-1.5 text-xs text-gray-600 dark:text-gray-300 shadow-sm hover:scale-105 transition-transform"
              >
                <Icon className="w-3.5 h-3.5 text-brand-500" />
                {f.text}
              </div>
            )
          })}
        </div>

        {/* Login Card */}
        <div className={`card p-6 sm:p-8 ${mounted ? "animate-slide-up stagger-2" : "opacity-0"} shine-border`}>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-1">ورود به حساب</h2>
          <p className="text-sm text-gray-500 mb-6">برای ادامه، اطلاعات کاربری خود را وارد کنید</p>

          {error && (
            <div className="mb-4 rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-600 dark:bg-red-500/10 dark:border-red-500/20 dark:text-red-400 animate-shake">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="group">
              <label className="block text-sm font-medium text-gray-700 mb-1.5 dark:text-gray-300">ایمیل</label>
              <div className="relative">
                <Mail className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-brand-500 transition-colors" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="example@content.ir"
                  className="w-full rounded-xl border border-gray-200 bg-white pr-10 pl-4 py-2.5 text-sm focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 outline-none transition-all dark:bg-gray-800 dark:border-gray-700 dark:text-gray-100"
                  required
                />
              </div>
            </div>

            <div className="group">
              <label className="block text-sm font-medium text-gray-700 mb-1.5 dark:text-gray-300">رمز عبور</label>
              <div className="relative">
                <Lock className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-brand-500 transition-colors" />
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full rounded-xl border border-gray-200 bg-white pr-10 pl-10 py-2.5 text-sm focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 outline-none transition-all dark:bg-gray-800 dark:border-gray-700 dark:text-gray-100"
                  required
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-brand-500 transition-colors">
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-brand-600 to-brand-500 bg-[length:200%_auto] hover:bg-[position:right_center] text-white py-2.5 text-sm font-medium active:scale-95 transition-all duration-500 disabled:opacity-50 shadow-lg shadow-brand-600/30 hover:shadow-xl hover:shadow-brand-600/40 ripple"
            >
              {loading ? (
                <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
              ) : (
                <ArrowLeft className="w-4 h-4" />
              )}
              {loading ? "در حال ورود..." : "ورود"}
            </button>
          </form>

          <div className="mt-6 pt-6 border-t border-gray-100 dark:border-gray-800">
            <p className="text-xs text-gray-400 mb-3 text-center">ورود سریع برای تست (رمز: 12345678)</p>
            <div className="grid grid-cols-2 gap-2">
              {[
                { email: "admin@content.ir", label: "مدیر ارشد", color: "hover:border-red-300 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-500/10" },
                { email: "manager@content.ir", label: "مدیر محتوا", color: "hover:border-brand-300 hover:text-brand-600 hover:bg-brand-50 dark:hover:bg-brand-500/10" },
                { email: "writer@content.ir", label: "نویسنده", color: "hover:border-emerald-300 hover:text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-500/10" },
                { email: "publisher@content.ir", label: "منتشرکننده", color: "hover:border-amber-300 hover:text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-500/10" },
              ].map((q) => (
                <button
                  key={q.email}
                  onClick={() => quickLogin(q.email)}
                  className={`text-xs rounded-lg border border-gray-200 px-3 py-2 text-gray-600 dark:border-gray-700 dark:text-gray-300 transition-all hover:scale-105 active:scale-95 ${q.color}`}
                >
                  {q.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        <p className={`text-center text-xs text-gray-400 mt-6 ${mounted ? "animate-fade-in stagger-3" : "opacity-0"}`}>
          © ۱۴۰۵ پلتفرم مدیریت محتوا — تمام حقوق محفوظ است
        </p>
      </div>
    </div>
  )
}