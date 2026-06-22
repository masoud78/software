import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getCurrentUser, hasRole } from "@/lib/auth-server"

export async function GET() {
  const user = await getCurrentUser()
  if (!user) return NextResponse.json({ error: "احراز هویت نشده" }, { status: 401 })

  const clusters = await prisma.semanticCluster.findMany({
    include: {
      _count: { select: { keywords: true, briefs: true } },
    },
    orderBy: { createdAt: "desc" },
  })
  return NextResponse.json({ clusters })
}

export async function POST(request) {
  const user = await getCurrentUser()
  if (!user) return NextResponse.json({ error: "احراز هویت نشده" }, { status: 401 })
  if (!hasRole(user, ["ADMIN", "CONTENT_MANAGER"])) {
    return NextResponse.json({ error: "دسترسی غیرمجاز" }, { status: 403 })
  }

  const { name, description, color, keywords } = await request.json()
  if (!name) return NextResponse.json({ error: "نام کلاستر الزامی است" }, { status: 400 })

  const cluster = await prisma.semanticCluster.create({
    data: {
      name,
      description: description || null,
      color: color || "#6366f1",
      keywords: keywords?.length
        ? { create: keywords.map(k => ({ term: k.term, searchVolume: k.searchVolume || 0, difficulty: k.difficulty || "MEDIUM" })) }
        : undefined,
    },
    include: { keywords: true },
  })

  return NextResponse.json({ success: true, cluster })
}
