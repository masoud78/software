import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getCurrentUser, hasRole } from "@/lib/auth-server"
import { notifyRole } from "@/lib/notify"

export async function POST(request, { params }) {
  const user = await getCurrentUser()
  if (!user) return NextResponse.json({ error: "احراز هویت نشده" }, { status: 401 })
  if (!hasRole(user, ["CONTENT_MANAGER", "PUBLISHER"])) {
    return NextResponse.json({ error: "دسترسی غیرمجاز" }, { status: 403 })
  }

  try {
    const { publishedUrl, publishNotes } = await request.json()

    if (!publishedUrl) {
      return NextResponse.json({ error: "URL نهایی الزامی است" }, { status: 400 })
    }

    const brief = await prisma.brief.findUnique({ where: { id: params.id } })
    if (!brief) return NextResponse.json({ error: "بریف یافت نشد" }, { status: 404 })

    if (brief.status !== "APPROVED") {
      return NextResponse.json({ error: "بریف باید تایید شده باشد" }, { status: 400 })
    }

    await prisma.brief.update({
      where: { id: params.id },
      data: {
        status: "PUBLISHED",
        publishedUrl,
        publishNotes: publishNotes || null,
        publishedAt: new Date(),
        publishedById: user.id,
      },
    })

    await prisma.activityLog.create({
      data: {
        briefId: params.id,
        userId: user.id,
        action: "BRIEF_PUBLISHED",
        details: `محتوا منتشر شد: ${publishedUrl}`,
      },
    })

    // Notify content managers that it's published
    await notifyRole({
      role: "CONTENT_MANAGER",
      title: "محتوا منتشر شد 🎉",
      message: `«${brief.title}» توسط منتشرکننده روی سایت قرار گرفت. URL: ${publishedUrl}`,
      type: "success",
      link: `/manager/briefs/${params.id}`,
      briefId: params.id,
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Publish error:", error)
    return NextResponse.json({ error: "خطا در انتشار" }, { status: 500 })
  }
}