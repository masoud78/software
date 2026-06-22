import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getCurrentUser, hasRole } from "@/lib/auth-server"
import { notifyUser, notifyRole } from "@/lib/notify"

export async function POST(request, { params }) {
  const user = await getCurrentUser()
  if (!user) return NextResponse.json({ error: "احراز هویت نشده" }, { status: 401 })
  if (!hasRole(user, ["ADMIN", "CONTENT_MANAGER"])) {
    return NextResponse.json({ error: "دسترسی غیرمجاز" }, { status: 403 })
  }

  try {
    const { action, comment } = await request.json()

    const brief = await prisma.brief.findUnique({
      where: { id: params.id },
      include: { assignedTo: { select: { id: true, name: true } } },
    })
    if (!brief) return NextResponse.json({ error: "بریف یافت نشد" }, { status: 404 })

    if (action === "approve") {
      await prisma.brief.update({
        where: { id: params.id },
        data: { status: "APPROVED", reviewedById: user.id },
      })

      await prisma.task.updateMany({
        where: { briefId: params.id },
        data: { status: "COMPLETED", reviewedAt: new Date() },
      })

      await prisma.activityLog.create({
        data: {
          briefId: params.id,
          userId: user.id,
          action: "BRIEF_APPROVED",
          details: "بریف تایید شد و به منتشرکننده ارجاع داده شد",
        },
      })

      // Notify publishers
      await notifyRole({
        role: "PUBLISHER",
        title: "محتوای تایید شده برای انتشار",
        message: `«${brief.title}» توسط مدیر محتوا تایید شد و آماده انتشار است`,
        type: "publish",
        link: `/publisher/brief/${params.id}`,
        briefId: params.id,
      })

      // Notify writer
      if (brief.assignedToId) {
        await notifyUser({
          userId: brief.assignedToId,
          title: "محتوای شما تایید شد ✅",
          message: `«${brief.title}» تایید شد و به انتشار رفت`,
          type: "success",
          link: `/writer/brief/${params.id}`,
          briefId: params.id,
        })
      }
    } else if (action === "reject") {
      await prisma.brief.update({
        where: { id: params.id },
        data: { status: "REJECTED", reviewedById: user.id },
      })

      await prisma.task.updateMany({
        where: { briefId: params.id },
        data: { status: "IN_PROGRESS", reviewedAt: new Date(), reviewNotes: comment || null },
      })

      await prisma.activityLog.create({
        data: {
          briefId: params.id,
          userId: user.id,
          action: "BRIEF_REJECTED",
          details: comment || "بریف رد شد",
        },
      })

      // Notify writer about rejection
      if (brief.assignedToId) {
        await notifyUser({
          userId: brief.assignedToId,
          title: "محتوای شما نیاز به اصلاح دارد ❌",
          message: `«${brief.title}» توسط مدیر محتوا رد شد. ${comment ? `دلیل: ${comment}` : "لطفاً اصلاحات را انجام دهید."}`,
          type: "warning",
          link: `/writer/brief/${params.id}`,
          briefId: params.id,
        })
      }
    }

    if (comment) {
      await prisma.comment.create({
        data: { briefId: params.id, userId: user.id, text: comment },
      })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Review error:", error)
    return NextResponse.json({ error: "خطا در بررسی" }, { status: 500 })
  }
}