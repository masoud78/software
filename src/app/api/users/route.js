import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getCurrentUser, hasRole } from "@/lib/auth-server"
import bcrypt from "bcryptjs"

export async function GET() {
  const user = await getCurrentUser()
  if (!user) return NextResponse.json({ error: "احراز هویت نشده" }, { status: 401 })

  // فقط مدیر ارشد لیست کامل کاربران را می‌بیند
  if (user.role === "CONTENT_MANAGER") {
    const users = await prisma.user.findMany({
      select: { id: true, name: true, email: true, role: true, isActive: true, createdAt: true },
      orderBy: { createdAt: "desc" },
    })
    return NextResponse.json({ users })
  }

  // سایر نقش‌ها فقط لیست نویسندگان را می‌بینند (برای ارجاع)
  const writers = await prisma.user.findMany({
    where: { role: "WRITER", isActive: true },
    select: { id: true, name: true, email: true },
  })
  return NextResponse.json({ users: writers })
}

export async function POST(request) {
  const user = await getCurrentUser()
  if (!user) return NextResponse.json({ error: "احراز هویت نشده" }, { status: 401 })
  if (!hasRole(user, ["CONTENT_MANAGER"])) {
    return NextResponse.json({ error: "دسترسی غیرمجاز" }, { status: 403 })
  }

  const { name, email, password, role } = await request.json()
  if (!name || !email || !password) {
    return NextResponse.json({ error: "تمام فیلدها الزامی است" }, { status: 400 })
  }

  const existing = await prisma.user.findUnique({ where: { email: email.toLowerCase() } })
  if (existing) return NextResponse.json({ error: "ایمیل قبلاً ثبت شده" }, { status: 400 })

  const hashed = await bcrypt.hash(password, 10)
  const newUser = await prisma.user.create({
    data: { name, email: email.toLowerCase(), password: hashed, role: role || "WRITER" },
    select: { id: true, name: true, email: true, role: true },
  })

  return NextResponse.json({ success: true, user: newUser })
}
