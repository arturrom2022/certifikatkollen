import { auth } from "@/auth"

export async function requireUser() {
  const session = await auth()
  if (!session?.user?.id) throw new Error("Unauthorized")
  return session.user
}

export async function requireRole(minRole: "member" | "manager" | "admin") {
  const order = ["read_only", "member", "manager", "admin"] as const
  const me = await requireUser()
  const have = me.role ?? "read_only"
  if (order.indexOf(have as any) < order.indexOf(minRole as any)) {
    throw new Error("Forbidden")
  }
  return me
}
