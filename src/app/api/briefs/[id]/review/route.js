import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getCurrentUser, hasRole } from "@/lib/auth-server"

export async function POST(request, { params }) {
  const user = await getCurrentUser()
  if (!user) return NextResponse.json({ error: "احراز هویت نشده" }, { status: 401 })
  if (!hasRole(user, ["ADMIN", "CONTENT_MANAGER"])) {
    return NextResponse.json({ error: "دسترسی غیرمجاز" }, { status: 403 })
  }

  try {
    const { action, comment } = await request.json()
    // action: "approve" or "reject"

    const brief = await prisma.brief.findUnique({ where: { id: params.id } })
    if (!brief) return NextResponse.json({ error: "بریف یافت نشد" }, { status: 404 })

    if (action === "approve") {
      await prisma.brief.update({
        where: { id: params.id },
        data: {
          status: "APPROVED",
          reviewedById: user.id,
        },
      })

      // به‌روزرسانی تسک‌ها به تکمیل شده
      await prisma.task.updateMany({
        where: { briefId: params.id },
        data: { status: "COMPLETED" },
      })

      await prisma.activityLog.create({
        data: {
          briefId: params.id,
          userId: user.id,
          action: "BRIEF_APPROVED",
          details: "بریف تایید شد و به منتشرکننده ارجاع داده شد",
        },
      })
    } else if (action === "reject") {
      await prisma.brief.update({
        where: { id: params.id },
        data: {
          status: "REJECTED",
          reviewedById: user.id,
        },
      })

      await prisma.activityLog.create({
        data: {
          briefId: params.id,
          userId: user.id,
          action: "BRIEF_REJECTED",
          details: comment || "بریف رد شد",
        },
      })
    }

    // افزودن کامنت اگر وجود دارد
    if (comment) {
      await prisma.comment.create({
        data: {
          briefId: params.id,
          userId: user.id,
          text: comment,
        },
      })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Review error:", error)
    return NextResponse.json({ error: "خطا در بررسی" }, { status: 500 })
  }
}
