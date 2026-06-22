import { redirect } from "next/navigation"
import { getCurrentUser } from "@/lib/auth-server"
import { prisma } from "@/lib/prisma"
import DashboardLayout from "@/components/DashboardLayout"
import BriefForm from "@/components/forms/BriefForm"

export const dynamic = "force-dynamic"

export default async function NewBriefPage() {
  const user = await getCurrentUser()
  if (!user) redirect("/login")
  if (!["CONTENT_MANAGER"].includes(user.role)) redirect("/writer")

  return (
    <DashboardLayout user={user}>
      <BriefForm userId={user.id} />
    </DashboardLayout>
  )
}
