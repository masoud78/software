import { redirect } from "next/navigation"
import { getCurrentUser } from "@/lib/auth-server"
import { prisma } from "@/lib/prisma"
import DashboardLayout from "@/components/DashboardLayout"
import PublishedList from "@/components/lists/PublishedList"

export const dynamic = "force-dynamic"

export default async function PublisherPublishedPage() {
  const user = await getCurrentUser()
  if (!user) redirect("/login")
  if (!["PUBLISHER", "CONTENT_MANAGER"].includes(user.role)) redirect("/writer")

  const briefs = await prisma.brief.findMany({
    where: { status: "PUBLISHED" },
    include: {
      publishedBy: { select: { name: true } },
    },
    orderBy: { publishedAt: "desc" },
  })

  return (
    <DashboardLayout user={user}>
      <PublishedList briefs={JSON.parse(JSON.stringify(briefs))} />
    </DashboardLayout>
  )
}
