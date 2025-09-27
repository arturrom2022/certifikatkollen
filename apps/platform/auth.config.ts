// apps/platform/auth.config.ts
import type { AuthConfig } from "next-auth"
import type { JWT } from "next-auth/jwt"
import type { User, Session } from "next-auth"
import Credentials from "next-auth/providers/credentials"
import { prisma } from "@/lib/db"
import bcrypt from "bcryptjs"

export const authConfig: AuthConfig = {
  session: { strategy: "jwt" },
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
              take: 1, // första organisationen (din MVP)
            },
          },
        })
        if (!user?.passwordHash) return null

        const ok = await bcrypt.compare(password, user.passwordHash)
        if (!ok) return null

        // Lägg roll/org på "user" så jwt-callbacken kan plocka upp det
        return {
          id: user.id,
          name: user.name ?? null,
          email: user.email ?? null,
          image: user.image ?? null,
          // egna fält
          role: user.members[0]?.role,
          orgId: user.members[0]?.orgId,
        } as unknown as User
      },
    }),
    // Lägg gärna till OAuth/Email providers här senare
  ],
  callbacks: {
    async jwt({ token, user }: { token: JWT; user?: User }) {
      if (user) {
        token.userId = (user as any).id
        if ((user as any).role) token.role = (user as any).role
        if ((user as any).orgId) token.orgId = (user as any).orgId
      }
      return token
    },
    async session({ session, token }: { session: Session; token: JWT }) {
      session.user = session.user ?? {}
      ;(session.user as any).id = (token as any).userId
      if ((token as any).role) (session.user as any).role = (token as any).role
      if ((token as any).orgId)
        (session.user as any).orgId = (token as any).orgId
      return session
    },
  },
}
