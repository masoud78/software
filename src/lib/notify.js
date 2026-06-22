import { prisma } from "@/lib/prisma"

// Helper: create notification for a user
export async function notifyUser({ userId, title, message, type = "info", link = null, briefId = null }) {
  try {
    await prisma.notification.create({
      data: { userId, title, message, type, link, briefId },
    })
  } catch (e) {
    console.error("Notification error:", e)
  }
}

// Helper: notify all users with a specific role
export async function notifyRole({ role, title, message, type = "info", link = null, briefId = null }) {
  try {
    const users = await prisma.user.findMany({ where: { role, isActive: true } })
    await Promise.all(
      users.map(u => notifyUser({ userId: u.id, title, message, type, link, briefId }))
    )
  } catch (e) {
    console.error("NotifyRole error:", e)
  }
}