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
    const { assigneeId, priority, dueDate, taskTitle, taskDescription } = await request.json()

    const brief = await prisma.brief.findUnique({ where: { id: params.id } })
    if (!brief) return NextResponse.json({ error: "بریف یافت نشد" }, { status: 404 })

    // بررسی اینکه کاربر هدف نویسنده است
    const writer = await prisma.user.findUnique({ where: { id: assigneeId } })
    if (!writer || writer.role !== "WRITER") {
      return NextResponse.json({ error: "کاربر انتخاب شده نویسنده نیست" }, { status: 400 })
    }

    // به‌روزرسانی بریف
    await prisma.brief.update({
      where: { id: params.id },
      data: {
        assignedToId: assigneeId,
        status: "ASSIGNED",
        deadline: dueDate ? new Date(dueDate) : brief.deadline,
      },
    })

    // ایجاد تسک
    await prisma.task.create({
      data: {
        briefId: params.id,
        assigneeId,
        title: taskTitle || brief.title,
        description: taskDescription || null,
        priority: priority || "MEDIUM",
        dueDate: dueDate ? new Date(dueDate) : null,
        status: "PENDING",
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

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Assign error:", error)
    return NextResponse.json({ error: "خطا در ارجاع" }, { status: 500 })
  }
}
