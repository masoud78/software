import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getCurrentUser } from "@/lib/auth-server"

export async function POST(request) {
  const user = await getCurrentUser()
  if (!user) return NextResponse.json({ error: "احراز هویت نشده" }, { status: 401 })

  const { briefId, text } = await request.json()
  if (!briefId || !text) return NextResponse.json({ error: "اطلاعات ناقص" }, { status: 400 })

  const comment = await prisma.comment.create({
    data: { briefId, userId: user.id, text },
    include: { user: { select: { id: true, name: true } } },
  })

  return NextResponse.json({ success: true, comment })
}
