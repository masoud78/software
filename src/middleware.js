import { NextResponse } from "next/server"
import { jwtVerify } from "jose"

const secret = new TextEncoder().encode(
  process.env.JWT_SECRET || "content-platform-super-secret-key-2026"
)

// مسیرهای محافظت شده و نقش‌های مجاز
const protectedRoutes = {
  "/admin": ["ADMIN"],
  "/manager": ["ADMIN", "CONTENT_MANAGER"],
  "/writer": ["WRITER", "ADMIN", "CONTENT_MANAGER"],
  "/publisher": ["PUBLISHER", "ADMIN"],
}

// مسیرهای عمومی (نیاز به احراز هویت ندارند)
const publicRoutes = ["/login", "/api/auth/login", "/api/auth/logout"]

export async function middleware(request) {
  const { pathname } = request.nextUrl

  // مسیرهای عمومی
  if (publicRoutes.some((r) => pathname.startsWith(r))) {
    return NextResponse.next()
  }

  // مسیرهای استاتیک
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/favicon") ||
    pathname.includes(".")
  ) {
    return NextResponse.next()
  }

  // بررسی مسیرهای محافظت شده
  let requiredRoles = null
  for (const [prefix, roles] of Object.entries(protectedRoutes)) {
    if (pathname.startsWith(prefix)) {
      requiredRoles = roles
      break
    }
  }

  // اگر مسیر محافظت شده است
  if (requiredRoles) {
    const token = request.cookies.get("auth_token")?.value

    if (!token) {
      return NextResponse.redirect(new URL("/login", request.url))
    }

    try {
      const { payload } = await jwtVerify(token, secret)
      
      // بررسی نقش
      if (!requiredRoles.includes(payload.role)) {
        // هدایت به داشبورد مناسب نقش کاربر
        const dashboards = {
          ADMIN: "/admin",
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

  // اگر در ریشه است و لاگین کرده
  if (pathname === "/") {
    const token = request.cookies.get("auth_token")?.value
    if (token) {
      try {
        const { payload } = await jwtVerify(token, secret)
        const dashboards = {
          ADMIN: "/admin",
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
