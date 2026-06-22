import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getCurrentUser } from "@/lib/auth-server"

export async function GET(request) {
  const user = await getCurrentUser()
  if (!user) return NextResponse.json({ error: "احراز هویت نشده" }, { status: 401 })

  const { searchParams } = new URL(request.url)
  const status = searchParams.get("status")

  let where = {}
  if (user.role === "WRITER") {
    where.assigneeId = user.id
  }
  if (status) where.status = status

  const tasks = await prisma.task.findMany({
    where,
    include: {
      brief: { select: { id: true, title: true, status: true, cluster: { select: { name: true, color: true } } } },
      assignee: { select: { id: true, name: true } },
    },
    orderBy: { createdAt: "desc" },
  })

  return NextResponse.json({ tasks })
}
