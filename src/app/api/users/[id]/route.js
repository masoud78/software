import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getCurrentUser, hasRole } from "@/lib/auth-server"
import bcrypt from "bcryptjs"

export async function PATCH(request, { params }) {
  const user = await getCurrentUser()
  if (!user) return NextResponse.json({ error: "احراز هویت نشده" }, { status: 401 })
  if (!hasRole(user, ["ADMIN"])) {
    return NextResponse.json({ error: "دسترسی غیرمجاز" }, { status: 403 })
  }

  const body = await request.json()
  const data = {}
  if (body.name) data.name = body.name
  if (body.role) data.role = body.role
  if (body.isActive !== undefined) data.isActive = body.isActive
  if (body.password) data.password = await bcrypt.hash(body.password, 10)

  const updated = await prisma.user.update({
    where: { id: params.id },
    data,
    select: { id: true, name: true, email: true, role: true, isActive: true },
  })
  return NextResponse.json({ success: true, user: updated })
}

export async function DELETE(request, { params }) {
  const user = await getCurrentUser()
  if (!user) return NextResponse.json({ error: "احراز هویت نشده" }, { status: 401 })
  if (!hasRole(user, ["ADMIN"])) {
    return NextResponse.json({ error: "دسترسی غیرمجاز" }, { status: 403 })
  }
  if (user.id === params.id) {
    return NextResponse.json({ error: "نمی‌توانید خودتان را حذف کنید" }, { status: 400 })
  }

  await prisma.user.delete({ where: { id: params.id } })
  return NextResponse.json({ success: true })
}
