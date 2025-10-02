// apps/platform/auth.config.ts
import type { NextAuthOptions, Session, User } from "next-auth"
import type { JWT } from "next-auth/jwt"
import Credentials from "next-auth/providers/credentials"
import bcrypt from "bcryptjs"
import { prisma } from "@/lib/db"

const authConfig: NextAuthOptions = {
  session: { strategy: "jwt" },
  providers: [
    Credentials({
      name: "Credentials",
      credentials: {
        email: { label: "E-post", type: "email" },
        password: { label: "Lösenord", type: "password" },
      },
      async authorize(creds): Promise<User | null> {
        const email = (creds?.email || "").toString().trim().toLowerCase()
        const password = (creds?.password || "").toString()
        if (!email || !password) return null

        const user = await prisma.user.findUnique({ where: { email } })
        if (!user?.passwordHash) return null

        const ok = await bcrypt.compare(password, user.passwordHash)
        if (!ok) return null

        return {
          id: user.id,
          name: user.name ?? null,
          email: user.email ?? null,
        } as User
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }: { token: JWT; user?: User | null }) {
      if (user) (token as any).userId = (user as any).id
      return token
    },
    async session({
      session,
      token,
    }: {
      session: Session
      token: JWT & { userId?: string }
    }) {
      session.user = (session.user ?? {}) as Session["user"]
      ;(session.user as any).id = (token as any).userId
      return session
    },
  },
}

export default authConfig
