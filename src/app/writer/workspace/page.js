import { redirect } from "next/navigation"
import { getCurrentUser } from "@/lib/auth-server"
import { prisma } from "@/lib/prisma"
import DashboardLayout from "@/components/DashboardLayout"
import WriterWorkspace from "@/components/lists/WriterWorkspace"

export const dynamic = "force-dynamic"

export default async function WriterWorkspacePage() {
  const user = await getCurrentUser()
  if (!user) redirect("/login")
  if (!["WRITER", "ADMIN", "CONTENT_MANAGER"].includes(user.role)) redirect("/publisher")

  const activeBriefs = await prisma.brief.findMany({
    where: { assignedToId: user.id, status: { in: ["ASSIGNED", "IN_PROGRESS", "REJECTED"] } },
    orderBy: { updatedAt: "desc" },
  })

  return (
    <DashboardLayout user={user}>
      <WriterWorkspace briefs={JSON.parse(JSON.stringify(activeBriefs))} />
    </DashboardLayout>
  )
}
