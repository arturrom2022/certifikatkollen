import NextAuth, { DefaultSession } from "next-auth"
import { JWT } from "next-auth/jwt"

declare module "next-auth" {
  type Role = "admin" | "manager" | "member" | "read_only"

  interface Session {
    user: {
      id?: string
      role?: Role
      orgId?: string
    } & DefaultSession["user"]
  }

  interface User {
    role?: Role
    orgId?: string
  }
}

declare module "next-auth/jwt" {
  type Role = "admin" | "manager" | "member" | "read_only"

  interface JWT {
    userId?: string
    role?: Role
    orgId?: string
  }
}
