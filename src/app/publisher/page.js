import { redirect } from "next/navigation"
import { getCurrentUser } from "@/lib/auth-server"
import { prisma } from "@/lib/prisma"
import DashboardLayout from "@/components/DashboardLayout"
import PublisherDashboard from "@/components/dashboards/PublisherDashboard"

export const dynamic = "force-dynamic"

export default async function PublisherPage() {
  const user = await getCurrentUser()
  if (!user) redirect("/login")
  if (!["PUBLISHER", "ADMIN"].includes(user.role)) redirect("/writer")

  const [approved, published, total] = await Promise.all([
    prisma.brief.count({ where: { status: "APPROVED" } }),
    prisma.brief.count({ where: { status: "PUBLISHED" } }),
    prisma.brief.count({ where: { status: { in: ["APPROVED", "PUBLISHED"] } } }),
  ])

  const queue = await prisma.brief.findMany({
    where: { status: "APPROVED" },
    take: 6,
    orderBy: { updatedAt: "desc" },
    include: { createdBy: { select: { name: true } }, reviewedBy: { select: { name: true } } },
  })

  return (
    <DashboardLayout user={user}>
      <PublisherDashboard
        user={user}
        stats={{ approved, published, total }}
        queue={JSON.parse(JSON.stringify(queue))}
      />
    </DashboardLayout>
  )
}
