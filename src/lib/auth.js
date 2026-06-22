// Client-safe auth utilities (no server-only imports)

export function hasRole(user, roles) {
  if (!user) return false
  const allowed = Array.isArray(roles) ? roles : [roles]
  return allowed.includes(user.role)
}

export function getDashboardPath(role) {
  const paths = {
    CONTENT_MANAGER: "/manager",
    WRITER: "/writer",
    PUBLISHER: "/publisher",
  }
  return paths[role] || "/login"
}

export function getRoleName(role) {
  const names = {
    CONTENT_MANAGER: "مدیر محتوا",
    WRITER: "نویسنده",
    PUBLISHER: "منتشرکننده",
  }
  return names[role] || role
}

export function getRoleColor(role) {
  const colors = {
    CONTENT_MANAGER: "bg-brand-500/10 text-brand-600 border-brand-500/20",
    WRITER: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20",
    PUBLISHER: "bg-amber-500/10 text-amber-600 border-amber-500/20",
  }
  return colors[role] || "bg-gray-500/10 text-gray-600 border-gray-500/20"
}