import { redirect } from "next/navigation"
import { getCurrentUser } from "@/lib/auth-server"
import { prisma } from "@/lib/prisma"
import DashboardLayout from "@/components/DashboardLayout"
import ClustersManager from "@/components/admin/ClustersManager"

export const dynamic = "force-dynamic"

export default async function AdminClustersPage() {
  const user = await getCurrentUser()
  if (!user) redirect("/login")
  if (user.role !== "ADMIN") redirect("/manager")

  const clusters = await prisma.semanticCluster.findMany({
    include: { _count: { select: { keywords: true, briefs: true } }, keywords: true },
    orderBy: { createdAt: "desc" },
  })

  return (
    <DashboardLayout user={user}>
      <ClustersManager clusters={JSON.parse(JSON.stringify(clusters))} />
    </DashboardLayout>
  )
}
