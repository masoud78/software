import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getCurrentUser } from "@/lib/auth-server"

export async function POST(request, { params }) {
  const user = await getCurrentUser()
  if (!user) return NextResponse.json({ error: "احراز هویت نشده" }, { status: 401 })

  try {
    const brief = await prisma.brief.findUnique({ where: { id: params.id } })
    if (!brief) return NextResponse.json({ error: "بریف یافت نشد" }, { status: 404 })

    // نویسنده فقط بریف خودش را می‌تواند ارسال کند
    if (user.role === "WRITER" && brief.assignedToId !== user.id) {
      return NextResponse.json({ error: "دسترسی غیرمجاز" }, { status: 403 })
    }

    if (!brief.content || brief.content.trim().length < 100) {
      return NextResponse.json({ error: "محتوای بریف بسیار کوتاه است" }, { status: 400 })
    }

    await prisma.brief.update({
      where: { id: params.id },
      data: { status: "SUBMITTED" },
    })

    // به‌روزرسانی تسک
    await prisma.task.updateMany({
      where: { briefId: params.id, status: { in: ["PENDING", "IN_PROGRESS"] } },
      data: { status: "SUBMITTED" },
    })

    await prisma.activityLog.create({
      data: {
        briefId: params.id,
        userId: user.id,
        action: "BRIEF_SUBMITTED",
        details: "محتوا برای تایید مدیر ارسال شد",
      },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Submit error:", error)
    return NextResponse.json({ error: "خطا در ارسال" }, { status: 500 })
  }
}
