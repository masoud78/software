import { redirect } from "next/navigation"
import { getCurrentUser } from "@/lib/auth-server"
import { prisma } from "@/lib/prisma"
import DashboardLayout from "@/components/DashboardLayout"
import WriterTasks from "@/components/lists/WriterTasks"

export const dynamic = "force-dynamic"

export default async function WriterTasksPage() {
  const user = await getCurrentUser()
  if (!user) redirect("/login")
  if (!["WRITER", "ADMIN", "CONTENT_MANAGER"].includes(user.role)) redirect("/publisher")

  const tasks = await prisma.task.findMany({
    where: { assigneeId: user.id },
    include: { brief: { select: { id: true, title: true, status: true, wordCount: true, cluster: { select: { name: true, color: true } } } } },
    orderBy: { createdAt: "desc" },
  })

  return (
    <DashboardLayout user={user}>
      <WriterTasks tasks={JSON.parse(JSON.stringify(tasks))} />
    </DashboardLayout>
  )
}
