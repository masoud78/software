import { redirect } from "next/navigation"
import { getCurrentUser } from "@/lib/auth-server"
import { prisma } from "@/lib/prisma"
import DashboardLayout from "@/components/DashboardLayout"
import ManagerDashboard from "@/components/dashboards/ManagerDashboard"

export const dynamic = "force-dynamic"

export default async function AdminPage() {
  const user = await getCurrentUser()
  if (!user) redirect("/login")
  if (user.role !== "CONTENT_MANAGER") redirect("/writer")

  const [totalUsers, totalBriefs, publishedBriefs, assignedBriefs, inProgress, submitted, approved] = await Promise.all([
    prisma.user.count(),
    prisma.brief.count(),
    prisma.brief.count({ where: { status: "PUBLISHED" } }),
    prisma.brief.count({ where: { status: "ASSIGNED" } }),
    prisma.brief.count({ where: { status: "IN_PROGRESS" } }),
    prisma.brief.count({ where: { status: "SUBMITTED" } }),
    prisma.brief.count({ where: { status: "APPROVED" } }),
  ])

  const statusCounts = await prisma.brief.groupBy({ by: ["status"], _count: true })
  const statusBreakdown = statusCounts.reduce((acc, s) => { acc[s.status] = s._count; return acc }, {})

  const recentActivity = await prisma.activityLog.findMany({
    take: 10,
    orderBy: { createdAt: "desc" },
    include: { user: { select: { name: true } }, brief: { select: { title: true } } },
  })

  const recentBriefs = await prisma.brief.findMany({
    take: 5,
    orderBy: { createdAt: "desc" },
    include: { assignedTo: { select: { name: true } } },
  })

  const writers = await prisma.user.findMany({
    where: { role: "WRITER", isActive: true },
    select: { id: true, name: true },
  })

  return (
    <DashboardLayout user={user}>
      <ManagerDashboard
        user={user}
        stats={{ totalBriefs, assignedBriefs, inProgress, submitted, approved, totalUsers, publishedBriefs, statusBreakdown }}
        recentBriefs={JSON.parse(JSON.stringify(recentBriefs))}
        recentActivity={JSON.parse(JSON.stringify(recentActivity))}
        writersCount={writers.length}
        showAdminStats={true}
      />
    </DashboardLayout>
  )
}