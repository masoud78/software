import { redirect } from "next/navigation"
import { getCurrentUser } from "@/lib/auth-server"
import { prisma } from "@/lib/prisma"
import DashboardLayout from "@/components/DashboardLayout"
import WriterDashboard from "@/components/dashboards/WriterDashboard"

export const dynamic = "force-dynamic"

export default async function WriterPage() {
  const user = await getCurrentUser()
  if (!user) redirect("/login")
  if (!["WRITER", "ADMIN", "CONTENT_MANAGER"].includes(user.role)) redirect("/publisher")

  const [pending, inProgress, submitted, completed, overdue] = await Promise.all([
    prisma.task.count({ where: { assigneeId: user.id, status: "PENDING" } }),
    prisma.task.count({ where: { assigneeId: user.id, status: "IN_PROGRESS" } }),
    prisma.task.count({ where: { assigneeId: user.id, status: "SUBMITTED" } }),
    prisma.task.count({ where: { assigneeId: user.id, status: "COMPLETED" } }),
    prisma.task.count({ where: { assigneeId: user.id, status: { in: ["PENDING", "IN_PROGRESS"] }, dueDate: { lt: new Date() } } }),
  ])

  const myTasks = await prisma.task.findMany({
    where: { assigneeId: user.id, status: { in: ["PENDING", "IN_PROGRESS"] } },
    take: 6,
    orderBy: { createdAt: "desc" },
    include: { brief: { select: { id: true, title: true, status: true, wordCount: true } } },
  })

  return (
    <DashboardLayout user={user}>
      <WriterDashboard
        user={user}
        stats={{ pending, inProgress, submitted, completed, overdue }}
        myTasks={JSON.parse(JSON.stringify(myTasks))}
      />
    </DashboardLayout>
  )
}
