// imports överst
import type { NextAuthOptions, User, Session } from "next-auth"
import type { JWT } from "next-auth/jwt"
import Credentials from "next-auth/providers/credentials"
import { prisma } from "@/lib/db"
import bcrypt from "bcryptjs"

// Exporten ska ha v4-typen:
export const authConfig: NextAuthOptions = {
  session: { strategy: "jwt" }, // 'jwt' är korrekt i v4
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
            members: { select: { orgId: true, role: true }, take: 1 },
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
        } as unknown as User
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }: { token: JWT; user?: User }) {
      if (user) {
        ;(token as any).userId = (user as any).id
        if ((user as any).role) (token as any).role = (user as any).role
        if ((user as any).orgId) (token as any).orgId = (user as any).orgId
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
