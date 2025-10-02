// apps/platform/types/next-auth.d.ts

import { DefaultSession } from "next-auth"
import { JWT as DefaultJWT } from "next-auth/jwt"

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
    id?: string
    role?: Role
    orgId?: string
  }
}

declare module "next-auth/jwt" {
  type Role = "admin" | "manager" | "member" | "read_only"

  interface JWT extends DefaultJWT {
    userId?: string
    role?: Role
    orgId?: string
  }
}

export {} // gör filen till ett modulär typingsblock (krävs)
