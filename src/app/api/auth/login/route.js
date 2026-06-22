import { NextResponse } from "next/server"
import { clearAuthCookie } from "@/lib/auth-server"

export async function POST() {
  await clearAuthCookie()
  return NextResponse.redirect(new URL("/login?loggedout=true", process.env.NEXT_PUBLIC_URL || "http://localhost:3000"))
}