import { NextResponse } from "next/server"
import { z } from "zod"
import bcrypt from "bcryptjs"
import { prisma } from "@/lib/db"
// ⬇️ BYT DETTA …
import { PrismaClientKnownRequestError } from "@prisma/client/runtime/library"
// … OCH TA BORT ev. `import { Prisma } from "@prisma/client"`

const schema = z.object({
  company: z.string().min(2),
  name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(6),
})

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const data = schema.parse(body)

    const exists = await prisma.user.findUnique({
      where: { email: data.email },
      select: { id: true },
    })
    if (exists) {
      return NextResponse.json(
        { error: "E-postadressen används redan." },
        { status: 409 }
      )
    }

    const passwordHash = await bcrypt.hash(data.password, 12)

    const user = await prisma.user.create({
      data: {
        email: data.email,
        name: data.name,
        passwordHash,
      },
    })

    const org = await prisma.org.create({
      data: {
        name: data.company,
        createdBy: user.id,
        members: {
          create: { userId: user.id, role: "admin" },
        },
      },
    })

    return NextResponse.json(
      { ok: true, orgId: org.id, userId: user.id },
      { status: 201 }
    )
  } catch (e: unknown) {
    // ⬇️ UPPDATERAD FELHANTERING
    if (e instanceof z.ZodError) {
      return NextResponse.json(
        { error: e.issues[0]?.message ?? "Ogiltiga fält" },
        { status: 400 }
      )
    }
    if (e instanceof PrismaClientKnownRequestError) {
      if (e.code === "P2002") {
        return NextResponse.json(
          { error: "E-postadressen används redan." },
          { status: 409 }
        )
      }
    }

    console.error("Signup error:", e)
    return NextResponse.json(
      { error: "Internt fel vid skapande av konto." },
      { status: 500 }
    )
  }
}
