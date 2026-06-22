import { redirect } from "next/navigation"
import { getCurrentUser } from "@/lib/auth-server"
import { prisma } from "@/lib/prisma"
import DashboardLayout from "@/components/DashboardLayout"
import BriefsList from "@/components/lists/BriefsList"

export const dynamic = "force-dynamic"

export default async function ManagerBriefsPage() {
  const user = await getCurrentUser()
  if (!user) redirect("/login")
  if (!["ADMIN", "CONTENT_MANAGER"].includes(user.role)) redirect("/writer")

  const briefs = await prisma.brief.findMany({
    where: { createdById: user.id },
    include: {
      assignedTo: { select: { id: true, name: true } },
    },
    orderBy: { createdAt: "desc" },
  })

  return (
    <DashboardLayout user={user}>
      <BriefsList briefs={JSON.parse(JSON.stringify(briefs))} basePath="/manager/briefs" showNewButton />
    </DashboardLayout>
  )
}
