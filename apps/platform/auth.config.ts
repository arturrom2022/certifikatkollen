import CredentialsProvider from "next-auth/providers/credentials"
import type { Session } from "next-auth"
import type { JWT } from "next-auth/jwt"
import bcrypt from "bcryptjs"
import { prisma } from "@/lib/db"

export const authConfig = {
  session: { strategy: "jwt" },

  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "E-post", type: "email" },
        password: { label: "Lösenord", type: "password" },
      },
      async authorize(creds) {
        const email = (creds?.email || "").toString().trim().toLowerCase()
        const password = (creds?.password || "").toString()
        if (!email || !password) return null

        const user = await prisma.user.findUnique({ where: { email } })
        if (!user?.passwordHash) return null

        const ok = await bcrypt.compare(password, user.passwordHash)
        if (!ok) return null

        // returnera minsta möjliga user-objekt
        return {
          id: user.id,
          name: user.name ?? null,
          email: user.email ?? null,
        } as any
      },
    }),
  ],

  callbacks: {
    async jwt({
      token,
      user,
    }: {
      token: JWT & { userId?: string }
      user?: { id?: string | null } | null
    }) {
      if (user?.id) token.userId = user.id
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
      ;(session.user as any).id = token.userId
      return session
    },
  },
} as const

export default authConfig
