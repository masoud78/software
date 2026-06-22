import { NextResponse } from "next/server"
import { jwtVerify } from "jose"

const secret = new TextEncoder().encode(
  process.env.JWT_SECRET || "content-platform-super-secret-key-2026"
)

const protectedRoutes = {
  "/admin": ["CONTENT_MANAGER"],
  "/manager": ["CONTENT_MANAGER"],
  "/writer": ["WRITER", "CONTENT_MANAGER"],
  "/publisher": ["PUBLISHER", "CONTENT_MANAGER"],
}

const publicRoutes = ["/login", "/api/auth/login", "/api/auth/logout"]

export async function middleware(request) {
  const { pathname } = request.nextUrl

  if (publicRoutes.some((r) => pathname.startsWith(r))) {
    return NextResponse.next()
  }

  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/favicon") ||
    pathname.includes(".")
  ) {
    return NextResponse.next()
  }

  let requiredRoles = null
  for (const [prefix, roles] of Object.entries(protectedRoutes)) {
    if (pathname.startsWith(prefix)) {
      requiredRoles = roles
      break
    }
  }

  if (requiredRoles) {
    const token = request.cookies.get("auth_token")?.value

    if (!token) {
      return NextResponse.redirect(new URL("/login", request.url))
    }

    try {
      const { payload } = await jwtVerify(token, secret)
      
      if (!requiredRoles.includes(payload.role)) {
        const dashboards = {
          CONTENT_MANAGER: "/manager",
          WRITER: "/writer",
          PUBLISHER: "/publisher",
        }
        const userDashboard = dashboards[payload.role] || "/login"
        return NextResponse.redirect(new URL(userDashboard, request.url))
      }

      return NextResponse.next()
    } catch {
      return NextResponse.redirect(new URL("/login", request.url))
    }
  }

  if (pathname === "/") {
    const token = request.cookies.get("auth_token")?.value
    if (token) {
      try {
        const { payload } = await jwtVerify(token, secret)
        const dashboards = {
          CONTENT_MANAGER: "/manager",
          WRITER: "/writer",
          PUBLISHER: "/publisher",
        }
        return NextResponse.redirect(new URL(dashboards[payload.role] || "/login", request.url))
      } catch {
        return NextResponse.redirect(new URL("/login", request.url))
      }
    }
    return NextResponse.redirect(new URL("/login", request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
}