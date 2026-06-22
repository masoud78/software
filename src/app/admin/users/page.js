import { redirect } from "next/navigation"
import { getCurrentUser } from "@/lib/auth-server"
import { prisma } from "@/lib/prisma"
import DashboardLayout from "@/components/DashboardLayout"
import UsersManager from "@/components/admin/UsersManager"

export const dynamic = "force-dynamic"

export default async function AdminUsersPage() {
  const user = await getCurrentUser()
  if (!user) redirect("/login")
  if (user.role !== "CONTENT_MANAGER") redirect("/manager")

  const users = await prisma.user.findMany({
    select: { id: true, name: true, email: true, role: true, isActive: true, createdAt: true },
    orderBy: { createdAt: "desc" },
  })

  return (
    <DashboardLayout user={user}>
      <UsersManager users={JSON.parse(JSON.stringify(users))} currentUserId={user.id} />
    </DashboardLayout>
  )
}
