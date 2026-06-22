import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getCurrentUser } from "@/lib/auth-server"
import { notifyRole } from "@/lib/notify"

export async function POST(request, { params }) {
  const user = await getCurrentUser()
  if (!user) return NextResponse.json({ error: "احراز هویت نشده" }, { status: 401 })

  try {
    const body = await request.json()
    const { progress } = body

    const brief = await prisma.brief.findUnique({ where: { id: params.id } })
    if (!brief) return NextResponse.json({ error: "بریف یافت نشد" }, { status: 404 })

    if (user.role === "WRITER" && brief.assignedToId !== user.id) {
      return NextResponse.json({ error: "دسترسی غیرمجاز" }, { status: 403 })
    }

    // If progress provided, just update progress
    if (progress !== undefined) {
      await prisma.task.updateMany({
        where: { briefId: params.id, status: { in: ["PENDING", "IN_PROGRESS"] } },
        data: { status: "IN_PROGRESS", progress: parseInt(progress) },
      })
      if (brief.status === "ASSIGNED" || brief.status === "REJECTED") {
        await prisma.brief.update({ where: { id: params.id }, data: { status: "IN_PROGRESS" } })
      }
      return NextResponse.json({ success: true })
    }

    // Full submit
    if (!brief.content || brief.content.trim().length < 100) {
      return NextResponse.json({ error: "محتوای بریف بسیار کوتاه است" }, { status: 400 })
    }

    await prisma.brief.update({
      where: { id: params.id },
      data: { status: "SUBMITTED" },
    })

    await prisma.task.updateMany({
      where: { briefId: params.id, status: { in: ["PENDING", "IN_PROGRESS"] } },
      data: { status: "SUBMITTED", submittedAt: new Date() },
    })

    await prisma.activityLog.create({
      data: {
        briefId: params.id,
        userId: user.id,
        action: "BRIEF_SUBMITTED",
        details: "محتوا برای تایید مدیر محتوا ارسال شد",
      },
    })

    // Notify content managers
    await notifyRole({
      role: "CONTENT_MANAGER",
      title: "محتوای جدید برای بررسی",
      message: `«${brief.title}» توسط نویسنده ارسال شد و منتظر تایید شماست`,
      type: "review",
      link: `/manager/briefs/${params.id}`,
      briefId: params.id,
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Submit error:", error)
    return NextResponse.json({ error: "خطا در ارسال" }, { status: 500 })
  }
}