import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getCurrentUser } from "@/lib/auth-server"

export async function GET(request, { params }) {
  const user = await getCurrentUser()
  if (!user) return NextResponse.json({ error: "احراز هویت نشده" }, { status: 401 })

  const brief = await prisma.brief.findUnique({
    where: { id: params.id },
    include: {
      createdBy: { select: { id: true, name: true, email: true } },
      assignedTo: { select: { id: true, name: true, email: true } },
      reviewedBy: { select: { id: true, name: true } },
      publishedBy: { select: { id: true, name: true } },
      tasks: { include: { assignee: { select: { id: true, name: true } } } },
      comments: {
        include: { user: { select: { id: true, name: true } } },
        orderBy: { createdAt: "desc" },
      },
      activityLogs: {
        include: { user: { select: { id: true, name: true } } },
        orderBy: { createdAt: "desc" },
        take: 20,
      },
    },
  })

  if (!brief) return NextResponse.json({ error: "بریف یافت نشد" }, { status: 404 })

  // بررسی دسترسی نویسنده
  if (user.role === "WRITER" && brief.assignedToId !== user.id) {
    return NextResponse.json({ error: "دسترسی غیرمجاز" }, { status: 403 })
  }

  return NextResponse.json({ brief })
}

export async function PATCH(request, { params }) {
  const user = await getCurrentUser()
  if (!user) return NextResponse.json({ error: "احراز هویت نشده" }, { status: 401 })

  try {
    const body = await request.json()
    const brief = await prisma.brief.findUnique({ where: { id: params.id } })
    if (!brief) return NextResponse.json({ error: "بریف یافت نشد" }, { status: 404 })

    // فیلدهای قابل ویرایش
    const allowedFields = [
      "title", "topic", "searchIntent", "targetKeywords", "secondaryKeywords",
      "wordCount", "toneOfVoice", "audience", "outline", "checklist",
      "guidelines", "internalLinks", "externalLinks", "competitorUrls", "deadline",
      "content", "excerpt", "featuredImage", "publishedUrl", "publishNotes",
    ]

    const data = {}
    for (const key of allowedFields) {
      if (key in body) {
        if (key === "checklist" && Array.isArray(body[key])) {
          data[key] = JSON.stringify(body[key])
        } else if (key === "wordCount") {
          data[key] = parseInt(body[key]) || 1500
        } else if (key === "deadline") {
          data[key] = body[key] ? new Date(body[key]) : null
        } else {
          data[key] = body[key]
        }
      }
    }

    const updated = await prisma.brief.update({
      where: { id: params.id },
      data,
    })

    return NextResponse.json({ success: true, brief: updated })
  } catch (error) {
    console.error("Update brief error:", error)
    return NextResponse.json({ error: "خطا در به‌روزرسانی" }, { status: 500 })
  }
}

export async function DELETE(request, { params }) {
  const user = await getCurrentUser()
  if (!user) return NextResponse.json({ error: "احراز هویت نشده" }, { status: 401 })
  if (!["ADMIN", "CONTENT_MANAGER"].includes(user.role)) {
    return NextResponse.json({ error: "دسترسی غیرمجاز" }, { status: 403 })
  }

  await prisma.brief.delete({ where: { id: params.id } })
  return NextResponse.json({ success: true })
}
