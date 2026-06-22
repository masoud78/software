import { redirect } from "next/navigation"
import { getCurrentUser } from "@/lib/auth-server"
import { prisma } from "@/lib/prisma"
import DashboardLayout from "@/components/DashboardLayout"
import BriefsList from "@/components/lists/BriefsList"

export const dynamic = "force-dynamic"

export default async function AdminBriefsPage() {
  const user = await getCurrentUser()
  if (!user) redirect("/login")
  if (user.role !== "ADMIN") redirect("/manager")

  const briefs = await prisma.brief.findMany({
    include: {
      createdBy: { select: { id: true, name: true } },
      assignedTo: { select: { id: true, name: true } },
    },
    orderBy: { createdAt: "desc" },
  })

  return (
    <DashboardLayout user={user}>
      <BriefsList briefs={JSON.parse(JSON.stringify(briefs))} basePath="/admin/briefs" showCreator />
    </DashboardLayout>
  )
}
