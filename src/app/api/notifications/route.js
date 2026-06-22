import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getCurrentUser } from "@/lib/auth-server"

// GET notifications for current user
export async function GET() {
  const user = await getCurrentUser()
  if (!user) return NextResponse.json({ error: "احراز هویت نشده" }, { status: 401 })

  const notifications = await prisma.notification.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
    take: 30,
  })

  const unreadCount = await prisma.notification.count({
    where: { userId: user.id, isRead: false },
  })

  return NextResponse.json({ notifications, unreadCount })
}

// Mark notification(s) as read
export async function PATCH(request) {
  const user = await getCurrentUser()
  if (!user) return NextResponse.json({ error: "احراز هویت نشده" }, { status: 401 })

  const { id, markAll } = await request.json()

  if (markAll) {
    await prisma.notification.updateMany({
      where: { userId: user.id, isRead: false },
      data: { isRead: true },
    })
  } else if (id) {
    await prisma.notification.update({
      where: { id },
      data: { isRead: true },
    })
  }

  return NextResponse.json({ success: true })
}