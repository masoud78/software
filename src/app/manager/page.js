import { redirect } from "next/navigation"
import { getCurrentUser } from "@/lib/auth-server"
import { prisma } from "@/lib/prisma"
import DashboardLayout from "@/components/DashboardLayout"
import ManagerDashboard from "@/components/dashboards/ManagerDashboard"

export const dynamic = "force-dynamic"

export default async function ManagerPage() {
  const user = await getCurrentUser()
  if (!user) redirect("/login")
  if (!["ADMIN", "CONTENT_MANAGER"].includes(user.role)) redirect("/writer")

  const [totalBriefs, assignedBriefs, inProgress, submitted, approved, totalClusters] = await Promise.all([
    prisma.brief.count({ where: { createdById: user.id } }),
    prisma.brief.count({ where: { createdById: user.id, status: "ASSIGNED" } }),
    prisma.brief.count({ where: { createdById: user.id, status: "IN_PROGRESS" } }),
    prisma.brief.count({ where: { createdById: user.id, status: "SUBMITTED" } }),
    prisma.brief.count({ where: { createdById: user.id, status: "APPROVED" } }),
    prisma.semanticCluster.count(),
  ])

  const recentBriefs = await prisma.brief.findMany({
    where: { createdById: user.id },
    take: 6,
    orderBy: { createdAt: "desc" },
    include: { assignedTo: { select: { name: true } }, cluster: { select: { name: true, color: true } } },
  })

  const writers = await prisma.user.findMany({
    where: { role: "WRITER", isActive: true },
    select: { id: true, name: true },
  })

  return (
    <DashboardLayout user={user}>
      <ManagerDashboard
        user={user}
        stats={{ totalBriefs, assignedBriefs, inProgress, submitted, approved, totalClusters }}
        recentBriefs={JSON.parse(JSON.stringify(recentBriefs))}
        writersCount={writers.length}
      />
    </DashboardLayout>
  )
}
