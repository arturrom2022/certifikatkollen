// apps/platform/types/next-auth.d.ts
import "next-auth"
import "next-auth/jwt"

declare module "next-auth" {
  interface Session {
    user?: {
      id?: string
      name?: string | null
      email?: string | null
      image?: string | null
      role?: "admin" | "manager" | "member" | "read_only"
      orgId?: string
    }
  }
  interface User {
    role?: "admin" | "manager" | "member" | "read_only"
    orgId?: string
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    userId?: string
    role?: "admin" | "manager" | "member" | "read_only"
    orgId?: string
  }
}
