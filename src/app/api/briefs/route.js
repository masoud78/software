import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getCurrentUser, hasRole } from "@/lib/auth-server"
import { slugify } from "@/lib/utils"

export async function GET(request) {
  const user = await getCurrentUser()
  if (!user) return NextResponse.json({ error: "احراز هویت نشده" }, { status: 401 })

  const { searchParams } = new URL(request.url)
  const status = searchParams.get("status")
  const assignedToId = searchParams.get("assignedToId")

  let where = {}
  if (status) where.status = status
  if (assignedToId) where.assignedToId = assignedToId

  // نویسنده فقط بریف‌های خودش را می‌بیند
  if (user.role === "WRITER") {
    where.assignedToId = user.id
  }
  // منتشرکننده فقط بریف‌های تایید شده و منتشر شده را می‌بیند
  if (user.role === "PUBLISHER") {
    where.status = { in: ["APPROVED", "PUBLISHED"] }
  }

  const briefs = await prisma.brief.findMany({
    where,
    include: {
      createdBy: { select: { id: true, name: true } },
      assignedTo: { select: { id: true, name: true } },
      reviewedBy: { select: { id: true, name: true } },
      publishedBy: { select: { id: true, name: true } },
      cluster: { select: { id: true, name: true, color: true } },
    },
    orderBy: { createdAt: "desc" },
  })

  return NextResponse.json({ briefs })
}

export async function POST(request) {
  const user = await getCurrentUser()
  if (!user) return NextResponse.json({ error: "احراز هویت نشده" }, { status: 401 })
  if (!hasRole(user, ["ADMIN", "CONTENT_MANAGER"])) {
    return NextResponse.json({ error: "دسترسی غیرمجاز" }, { status: 403 })
  }

  try {
    const body = await request.json()
    const {
      title, topic, searchIntent, targetKeywords, secondaryKeywords,
      clusterId, wordCount, toneOfVoice, audience, outline, checklist,
      guidelines, internalLinks, externalLinks, competitorUrls, deadline,
    } = body

    if (!title || !topic) {
      return NextResponse.json({ error: "عنوان و موضوع الزامی است" }, { status: 400 })
    }

    const slug = slugify(title) + "-" + Date.now().toString(36)

    const brief = await prisma.brief.create({
      data: {
        title,
        slug,
        topic,
        searchIntent: searchIntent || "INFORMATIONAL",
        targetKeywords: targetKeywords || "",
        secondaryKeywords: secondaryKeywords || "",
        clusterId: clusterId || null,
        wordCount: parseInt(wordCount) || 1500,
        toneOfVoice: toneOfVoice || "حرفه‌ای و دوستانه",
        audience: audience || null,
        outline: outline || null,
        checklist: checklist ? JSON.stringify(checklist) : null,
        guidelines: guidelines || null,
        internalLinks: internalLinks || null,
        externalLinks: externalLinks || null,
        competitorUrls: competitorUrls || null,
        deadline: deadline ? new Date(deadline) : null,
        createdById: user.id,
        status: "DRAFT",
      },
    })

    // لاگ فعالیت
    await prisma.activityLog.create({
      data: {
        briefId: brief.id,
        userId: user.id,
        action: "BRIEF_CREATED",
        details: `بریف "${title}" ایجاد شد`,
      },
    })

    return NextResponse.json({ success: true, brief })
  } catch (error) {
    console.error("Create brief error:", error)
    return NextResponse.json({ error: "خطا در ایجاد بریف" }, { status: 500 })
  }
}
