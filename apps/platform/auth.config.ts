// apps/platform/auth.config.ts
import type { NextAuthConfig, Session, User } from "next-auth"
import type { JWT } from "next-auth/jwt"
import Credentials from "next-auth/providers/credentials"
import { prisma } from "@/lib/db"
import bcrypt from "bcryptjs"

// Använd gärna "satisfies" så får du fel om configen avviker:
export const authConfig = {
  session: { strategy: "jwt" as const },

  providers: [
    Credentials({
      name: "Credentials",
      credentials: {
        email: { label: "E-post", type: "email" },
        password: { label: "Lösenord", type: "password" },
      },
      async authorize(creds) {
        const email = (creds?.email || "").toString().trim().toLowerCase()
        const password = (creds?.password || "").toString()
        if (!email || !password) return null

        const user = await prisma.user.findUnique({
          where: { email },
          include: {
            members: {
              select: { orgId: true, role: true },
              take: 1,
            },
          },
        })
        if (!user?.passwordHash) return null

        const ok = await bcrypt.compare(password, user.passwordHash)
        if (!ok) return null

        return {
          id: user.id,
          name: user.name ?? null,
          email: user.email ?? null,
          image: user.image ?? null,
          role: user.members[0]?.role,
          orgId: user.members[0]?.orgId,
        } satisfies User
      },
    }),
  ],

  callbacks: {
    async jwt({ token, user }: { token: JWT; user?: User | null }) {
      if (user) {
        token.userId = (user as any).id
        if ((user as any).role) token.role = (user as any).role
        if ((user as any).orgId) token.orgId = (user as any).orgId
      }
      return token
    },

    async session({ session, token }: { session: Session; token: JWT }) {
      // session.user finns alltid (via module augmentation ovan)
      ;(session.user as any).id = token.userId
      if (token.role) (session.user as any).role = token.role
      if (token.orgId) (session.user as any).orgId = token.orgId
      return session
    },
  },
} satisfies NextAuthConfig
