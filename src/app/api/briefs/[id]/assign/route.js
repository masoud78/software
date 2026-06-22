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
    const { assigneeId, priority, dueDate, taskTitle, taskDescription, estimatedTime, tags } = await request.json()

    const brief = await prisma.brief.findUnique({ where: { id: params.id } })
    if (!brief) return NextResponse.json({ error: "بریف یافت نشد" }, { status: 404 })

    const writer = await prisma.user.findUnique({ where: { id: assigneeId } })
    if (!writer || writer.role !== "WRITER") {
      return NextResponse.json({ error: "کاربر انتخاب شده نویسنده نیست" }, { status: 400 })
    }

    await prisma.brief.update({
      where: { id: params.id },
      data: {
        assignedToId: assigneeId,
        status: "ASSIGNED",
        deadline: dueDate ? new Date(dueDate) : brief.deadline,
      },
    })

    await prisma.task.create({
      data: {
        briefId: params.id,
        assigneeId,
        title: taskTitle || brief.title,
        description: taskDescription || null,
        priority: priority || "MEDIUM",
        dueDate: dueDate ? new Date(dueDate) : null,
        status: "PENDING",
        estimatedTime: estimatedTime ? parseInt(estimatedTime) : null,
        tags: tags || null,
      },
    })

    await prisma.activityLog.create({
      data: {
        briefId: params.id,
        userId: user.id,
        action: "BRIEF_ASSIGNED",
        details: `بریف به ${writer.name} ارجاع داده شد`,
      },
    })

    // Notify the writer
    await notifyUser({
      userId: assigneeId,
      title: "تسک جدید به شما ارجاع داده شد",
      message: `«${taskTitle || brief.title}» توسط ${user.name} به شما ارجاع داده شد`,
      type: "task",
      link: `/writer/brief/${params.id}`,
      briefId: params.id,
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Assign error:", error)
    return NextResponse.json({ error: "خطا در ارجاع" }, { status: 500 })
  }
}