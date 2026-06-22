import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getCurrentUser } from "@/lib/auth-server"

export async function GET() {
  const user = await getCurrentUser()
  if (!user) return NextResponse.json({ error: "احراز هویت نشده" }, { status: 401 })

  let stats = {}

  if (user.role === "ADMIN") {
    const [totalUsers, totalBriefs, totalClusters, publishedBriefs, activeUsers] = await Promise.all([
      prisma.user.count(),
      prisma.brief.count(),
      prisma.semanticCluster.count(),
      prisma.brief.count({ where: { status: "PUBLISHED" } }),
      prisma.user.count({ where: { isActive: true } }),
    ])
    stats = { totalUsers, totalBriefs, totalClusters, publishedBriefs, activeUsers }

    // آمار بر اساس وضعیت
    const statusCounts = await prisma.brief.groupBy({
      by: ["status"],
      _count: true,
    })
    stats.statusBreakdown = statusCounts.reduce((acc, s) => { acc[s.status] = s._count; return acc }, {})

    // آخرین فعالیت‌ها
    stats.recentActivity = await prisma.activityLog.findMany({
      take: 10,
      orderBy: { createdAt: "desc" },
      include: { user: { select: { name: true } }, brief: { select: { title: true } } },
    })
  } else if (user.role === "CONTENT_MANAGER") {
    const [totalBriefs, assignedBriefs, inProgress, submitted, approved, totalClusters] = await Promise.all([
      prisma.brief.count({ where: { createdById: user.id } }),
      prisma.brief.count({ where: { createdById: user.id, status: "ASSIGNED" } }),
      prisma.brief.count({ where: { createdById: user.id, status: "IN_PROGRESS" } }),
      prisma.brief.count({ where: { createdById: user.id, status: "SUBMITTED" } }),
      prisma.brief.count({ where: { createdById: user.id, status: "APPROVED" } }),
      prisma.semanticCluster.count(),
    ])
    stats = { totalBriefs, assignedBriefs, inProgress, submitted, approved, totalClusters }

    stats.recentBriefs = await prisma.brief.findMany({
      where: { createdById: user.id },
      take: 5,
      orderBy: { createdAt: "desc" },
      include: { assignedTo: { select: { name: true } }, cluster: { select: { name: true, color: true } } },
    })
  } else if (user.role === "WRITER") {
    const [assignedToMe, inProgress, submitted, completed, overdue] = await Promise.all([
      prisma.task.count({ where: { assigneeId: user.id, status: "PENDING" } }),
      prisma.task.count({ where: { assigneeId: user.id, status: "IN_PROGRESS" } }),
      prisma.task.count({ where: { assigneeId: user.id, status: "SUBMITTED" } }),
      prisma.task.count({ where: { assigneeId: user.id, status: "COMPLETED" } }),
      prisma.task.count({ where: { assigneeId: user.id, status: { in: ["PENDING", "IN_PROGRESS"] }, dueDate: { lt: new Date() } } }),
    ])
    stats = { assignedToMe, inProgress, submitted, completed, overdue }

    stats.myTasks = await prisma.task.findMany({
      where: { assigneeId: user.id, status: { in: ["PENDING", "IN_PROGRESS"] } },
      take: 5,
      orderBy: { createdAt: "desc" },
      include: { brief: { select: { id: true, title: true, status: true, cluster: { select: { name: true, color: true } } } } },
    })
  } else if (user.role === "PUBLISHER") {
    const [approved, published, total] = await Promise.all([
      prisma.brief.count({ where: { status: "APPROVED" } }),
      prisma.brief.count({ where: { status: "PUBLISHED" } }),
      prisma.brief.count({ where: { status: { in: ["APPROVED", "PUBLISHED"] } } }),
    ])
    stats = { approved, published, total }

    stats.queue = await prisma.brief.findMany({
      where: { status: "APPROVED" },
      take: 5,
      orderBy: { updatedAt: "desc" },
      include: { createdBy: { select: { name: true } }, reviewedBy: { select: { name: true } } },
    })
  }

  return NextResponse.json({ stats, user })
}
