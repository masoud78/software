import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getCurrentUser } from "@/lib/auth-server"

// Delete a notification
export async function DELETE(request, { params }) {
  const user = await getCurrentUser()
  if (!user) return NextResponse.json({ error: "احراز هویت نشده" }, { status: 401 })

  await prisma.notification.deleteMany({
    where: { id: params.id, userId: user.id },
  })

  return NextResponse.json({ success: true })
}