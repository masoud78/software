import { redirect } from "next/navigation"
import { getCurrentUser } from "@/lib/auth-server"
import DashboardLayout from "@/components/DashboardLayout"
import SystemSettings from "@/components/admin/SystemSettings"

export const dynamic = "force-dynamic"

export default async function AdminSettingsPage() {
  const user = await getCurrentUser()
  if (!user) redirect("/login")
  if (user.role !== "ADMIN") redirect("/manager")

  return (
    <DashboardLayout user={user}>
      <SystemSettings user={user} />
    </DashboardLayout>
  )
}
