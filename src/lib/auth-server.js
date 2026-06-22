import { SignJWT, jwtVerify } from "jose"
import { cookies } from "next/headers"

const secret = new TextEncoder().encode(
  process.env.JWT_SECRET || "content-platform-super-secret-key-2026"
)

const COOKIE_NAME = "auth_token"

export async function signToken(payload) {
  const token = await new SignJWT({ ...payload })
    .setProtectedHeader({ alg: "HS256" })
    .setExpirationTime("7d")
    .setIssuedAt()
    .sign(secret)
  return token
}

export async function verifyToken(token) {
  try {
    const { payload } = await jwtVerify(token, secret)
    return payload
  } catch {
    return null
  }
}

export async function setAuthCookie(token) {
  cookies().set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 7,
    path: "/",
  })
}

export async function clearAuthCookie() {
  cookies().delete(COOKIE_NAME)
}

export function getAuthToken() {
  return cookies().get(COOKIE_NAME)?.value
}

export async function getCurrentUser() {
  const token = getAuthToken()
  if (!token) return null
  const payload = await verifyToken(token)
  if (!payload) return null
  return {
    id: payload.id,
    name: payload.name,
    email: payload.email,
    role: payload.role,
  }
}

export function hasRole(user, roles) {
  if (!user) return false
  const allowed = Array.isArray(roles) ? roles : [roles]
  return allowed.includes(user.role)
}
