import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getCurrentUser, hasRole } from "@/lib/auth-server"

export async function GET(request, { params }) {
  const user = await getCurrentUser()
  if (!user) return NextResponse.json({ error: "احراز هویت نشده" }, { status: 401 })

  const cluster = await prisma.semanticCluster.findUnique({
    where: { id: params.id },
    include: { keywords: true, briefs: { select: { id: true, title: true, status: true } } },
  })
  if (!cluster) return NextResponse.json({ error: "کلاستر یافت نشد" }, { status: 404 })
  return NextResponse.json({ cluster })
}

export async function PATCH(request, { params }) {
  const user = await getCurrentUser()
  if (!user) return NextResponse.json({ error: "احراز هویت نشده" }, { status: 401 })
  if (!hasRole(user, ["ADMIN", "CONTENT_MANAGER"])) {
    return NextResponse.json({ error: "دسترسی غیرمجاز" }, { status: 403 })
  }

  const body = await request.json()
  const data = {}
  if (body.name) data.name = body.name
  if (body.description !== undefined) data.description = body.description
  if (body.color) data.color = body.color

  const cluster = await prisma.semanticCluster.update({
    where: { id: params.id },
    data,
  })
  return NextResponse.json({ success: true, cluster })
}

export async function DELETE(request, { params }) {
  const user = await getCurrentUser()
  if (!user) return NextResponse.json({ error: "احراز هویت نشده" }, { status: 401 })
  if (!hasRole(user, ["ADMIN", "CONTENT_MANAGER"])) {
    return NextResponse.json({ error: "دسترسی غیرمجاز" }, { status: 403 })
  }

  await prisma.semanticCluster.delete({ where: { id: params.id } })
  return NextResponse.json({ success: true })
}
