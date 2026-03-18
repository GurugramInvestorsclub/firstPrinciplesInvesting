import { Prisma } from "@prisma/client"
import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import {
  hashSignupVerificationToken,
  parseSignupVerificationIdentifier,
} from "@/lib/signup-verification"

export const runtime = "nodejs"

type VerificationOutcome = "success" | "already_verified" | "invalid"

function redirectToLogin(request: NextRequest, outcome: VerificationOutcome) {
  const url = new URL("/login", request.url)
  url.searchParams.set("verification", outcome)
  return NextResponse.redirect(url)
}

function parseToken(value: string | null): string | null {
  if (!value) {
    return null
  }

  const trimmed = value.trim()
  return /^[a-f0-9]{64}$/i.test(trimmed) ? trimmed : null
}

export async function GET(request: NextRequest) {
  try {
    const rawToken = parseToken(request.nextUrl.searchParams.get("token"))
    if (!rawToken) {
      return redirectToLogin(request, "invalid")
    }

    const tokenHash = hashSignupVerificationToken(rawToken)
    const verificationToken = await prisma.verificationToken.findUnique({
      where: { token: tokenHash },
    })

    if (!verificationToken || verificationToken.expires <= new Date()) {
      if (verificationToken) {
        await prisma.verificationToken.deleteMany({
          where: { token: tokenHash },
        })
      }
      return redirectToLogin(request, "invalid")
    }

    const payload = parseSignupVerificationIdentifier(verificationToken.identifier)
    if (!payload) {
      await prisma.verificationToken.deleteMany({
        where: { token: tokenHash },
      })
      return redirectToLogin(request, "invalid")
    }

    const outcome = await prisma.$transaction<VerificationOutcome>(async (tx) => {
      await tx.verificationToken.deleteMany({
        where: { token: tokenHash },
      })

      const existingUser = await tx.user.findUnique({
        where: { email: payload.email },
      })

      if (existingUser?.emailVerified) {
        return "already_verified"
      }

      if (existingUser) {
        await tx.user.update({
          where: { id: existingUser.id },
          data: {
            emailVerified: new Date(),
            name: existingUser.name ?? payload.name,
            password: payload.passwordHash,
          },
        })
        return "success"
      }

      await tx.user.create({
        data: {
          email: payload.email,
          name: payload.name,
          password: payload.passwordHash,
          emailVerified: new Date(),
        },
      })

      return "success"
    })

    return redirectToLogin(request, outcome)
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
    ) {
      return redirectToLogin(request, "already_verified")
    }

    console.error("Signup verification error:", error)
    return redirectToLogin(request, "invalid")
  }
}
