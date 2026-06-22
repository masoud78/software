import { redirect } from "next/navigation"
import { getCurrentUser } from "@/lib/auth-server"
import { prisma } from "@/lib/prisma"
import DashboardLayout from "@/components/DashboardLayout"
import BriefDetail from "@/components/briefs/BriefDetail"

export const dynamic = "force-dynamic"

export default async function ManagerBriefDetailPage({ params }) {
  const user = await getCurrentUser()
  if (!user) redirect("/login")
  if (!["ADMIN", "CONTENT_MANAGER"].includes(user.role)) redirect("/writer")

  const brief = await prisma.brief.findUnique({
    where: { id: params.id },
    include: {
      createdBy: { select: { id: true, name: true, email: true } },
      assignedTo: { select: { id: true, name: true, email: true } },
      reviewedBy: { select: { id: true, name: true } },
      publishedBy: { select: { id: true, name: true } },
      tasks: { include: { assignee: { select: { id: true, name: true } } } },
      comments: { include: { user: { select: { id: true, name: true } } }, orderBy: { createdAt: "desc" } },
      activityLogs: { include: { user: { select: { id: true, name: true } } }, orderBy: { createdAt: "desc" }, take: 20 },
    },
  })

  if (!brief) redirect("/manager/briefs")

  const writers = await prisma.user.findMany({
    where: { role: "WRITER", isActive: true },
    select: { id: true, name: true, email: true },
  })

  return (
    <DashboardLayout user={user}>
      <BriefDetail
        brief={JSON.parse(JSON.stringify(brief))}
        writers={JSON.parse(JSON.stringify(writers))}
        userRole={user.role}
        userId={user.id}
        mode="manager"
      />
    </DashboardLayout>
  )
}
