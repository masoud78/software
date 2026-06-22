import { redirect } from "next/navigation"
import { getCurrentUser } from "@/lib/auth-server"
import { prisma } from "@/lib/prisma"
import DashboardLayout from "@/components/DashboardLayout"
import ManagerTasks from "@/components/lists/ManagerTasks"

export const dynamic = "force-dynamic"

export default async function ManagerTasksPage() {
  const user = await getCurrentUser()
  if (!user) redirect("/login")
  if (!["ADMIN", "CONTENT_MANAGER"].includes(user.role)) redirect("/writer")

  const tasks = await prisma.task.findMany({
    include: {
      brief: { select: { id: true, title: true, status: true, createdById: true, cluster: { select: { name: true, color: true } } } },
      assignee: { select: { id: true, name: true } },
    },
    orderBy: { createdAt: "desc" },
  })

  const filtered = user.role === "CONTENT_MANAGER" 
    ? tasks.filter(t => t.brief.createdById === user.id)
    : tasks

  return (
    <DashboardLayout user={user}>
      <ManagerTasks tasks={JSON.parse(JSON.stringify(filtered))} />
    </DashboardLayout>
  )
}
