import { redirect } from "next/navigation"
import { getCurrentUser } from "@/lib/auth-server"
import { prisma } from "@/lib/prisma"
import DashboardLayout from "@/components/DashboardLayout"
import AdminDashboard from "@/components/dashboards/AdminDashboard"

export const dynamic = "force-dynamic"

export default async function AdminPage() {
  const user = await getCurrentUser()
  if (!user) redirect("/login")
  if (user.role !== "ADMIN") redirect("/manager")

  const stats = await prisma.brief.groupBy({ by: ["status"], _count: true })
  const totalUsers = await prisma.user.count()
  const totalBriefs = await prisma.brief.count()
  const totalClusters = await prisma.semanticCluster.count()
  const publishedBriefs = await prisma.brief.count({ where: { status: "PUBLISHED" } })
  const recentActivity = await prisma.activityLog.findMany({
    take: 10,
    orderBy: { createdAt: "desc" },
    include: { user: { select: { name: true } }, brief: { select: { title: true } } },
  })
  const recentBriefs = await prisma.brief.findMany({
    take: 5,
    orderBy: { createdAt: "desc" },
    include: { assignedTo: { select: { name: true } }, cluster: { select: { name: true, color: true } } },
  })

  const statusBreakdown = stats.reduce((acc, s) => { acc[s.status] = s._count; return acc }, {})

  return (
    <DashboardLayout user={user}>
      <AdminDashboard
        stats={{ totalUsers, totalBriefs, totalClusters, publishedBriefs, statusBreakdown }}
        recentActivity={JSON.parse(JSON.stringify(recentActivity))}
        recentBriefs={JSON.parse(JSON.stringify(recentBriefs))}
      />
    </DashboardLayout>
  )
}
