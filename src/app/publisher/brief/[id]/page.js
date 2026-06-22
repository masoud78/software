import { redirect } from "next/navigation"
import { getCurrentUser } from "@/lib/auth-server"
import { prisma } from "@/lib/prisma"
import DashboardLayout from "@/components/DashboardLayout"
import BriefDetail from "@/components/briefs/BriefDetail"

export const dynamic = "force-dynamic"

export default async function PublisherBriefDetailPage({ params }) {
  const user = await getCurrentUser()
  if (!user) redirect("/login")
  if (!["PUBLISHER", "ADMIN"].includes(user.role)) redirect("/writer")

  const brief = await prisma.brief.findUnique({
    where: { id: params.id },
    include: {
      createdBy: { select: { id: true, name: true } },
      assignedTo: { select: { id: true, name: true } },
      reviewedBy: { select: { id: true, name: true } },
      publishedBy: { select: { id: true, name: true } },
      comments: { include: { user: { select: { id: true, name: true } } }, orderBy: { createdAt: "desc" } },
      activityLogs: { include: { user: { select: { id: true, name: true } } }, orderBy: { createdAt: "desc" }, take: 10 },
    },
  })

  if (!brief) redirect("/publisher/queue")

  return (
    <DashboardLayout user={user}>
      <BriefDetail
        brief={JSON.parse(JSON.stringify(brief))}
        userRole={user.role}
        userId={user.id}
        mode="publisher"
      />
    </DashboardLayout>
  )
}
