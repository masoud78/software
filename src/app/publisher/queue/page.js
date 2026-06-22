import { redirect } from "next/navigation"
import { getCurrentUser } from "@/lib/auth-server"
import { prisma } from "@/lib/prisma"
import DashboardLayout from "@/components/DashboardLayout"
import PublisherQueue from "@/components/lists/PublisherQueue"

export const dynamic = "force-dynamic"

export default async function PublisherQueuePage() {
  const user = await getCurrentUser()
  if (!user) redirect("/login")
  if (!["PUBLISHER", "ADMIN"].includes(user.role)) redirect("/writer")

  const briefs = await prisma.brief.findMany({
    where: { status: "APPROVED" },
    include: {
      createdBy: { select: { name: true } },
      reviewedBy: { select: { name: true } },
      cluster: { select: { name: true, color: true } },
    },
    orderBy: { updatedAt: "desc" },
  })

  return (
    <DashboardLayout user={user}>
      <PublisherQueue briefs={JSON.parse(JSON.stringify(briefs))} />
    </DashboardLayout>
  )
}
