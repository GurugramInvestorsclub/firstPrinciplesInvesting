import { prisma } from "@/lib/prisma"
import { PaymentStatus } from "@prisma/client"
import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/auth"
import { buildRateLimitIdentifier, consumeRateLimit } from "@/lib/rate-limit"

export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.id || !session.user.email) {
      return NextResponse.json(
        {
          success: false,
          message: "Login is required",
        },
        { status: 401 }
      )
    }

    const identifier = buildRateLimitIdentifier(request, `register:${session.user.id}`)
    let rateLimit: Awaited<ReturnType<typeof consumeRateLimit>> | null = null
    try {
      rateLimit = await consumeRateLimit({
        scope: "registrations:create",
        identifier,
        maxRequests: 8,
        windowSeconds: 60 * 60,
        blockDurationSeconds: 2 * 60 * 60,
      })
    } catch (error) {
      console.error("Registration rate limiter unavailable; continuing without throttle", error)
    }

    if (rateLimit && !rateLimit.allowed) {
      return NextResponse.json(
        {
          success: false,
          message: "Too many registration attempts. Please try again later.",
        },
        {
          status: 429,
          headers: {
            "Retry-After": String(rateLimit.retryAfterSeconds),
          },
        }
      )
    }

    const body = await request.json()
    const name = typeof body?.name === "string" ? body.name.trim().slice(0, 120) : ""
    const email = typeof body?.email === "string" ? body.email.trim().toLowerCase() : ""
    const phone = typeof body?.phone === "string" ? body.phone.trim().slice(0, 32) : null
    const seminarSlug =
      typeof body?.seminarSlug === "string" ? body.seminarSlug.trim() : ""
    const paymentId =
      typeof body?.paymentId === "string" && body.paymentId.trim().length > 0
        ? body.paymentId.trim()
        : null

    if (!name || !email || !seminarSlug) {
      return NextResponse.json(
        {
          success: false,
          message: "Name, email, and seminarSlug are required",
        },
        { status: 400 }
      )
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { success: false, message: "Invalid email format" },
        { status: 400 }
      )
    }

    if (email !== session.user.email.toLowerCase()) {
      return NextResponse.json(
        {
          success: false,
          message: "Registration email must match your signed-in account email",
        },
        { status: 403 }
      )
    }

    if (!/^[a-zA-Z0-9_-]{3,128}$/.test(seminarSlug)) {
      return NextResponse.json(
        { success: false, message: "Invalid seminarSlug format" },
        { status: 400 }
      )
    }

    const payment = paymentId
      ? await prisma.payment.findUnique({
          where: { id: paymentId },
        })
      : await prisma.payment.findFirst({
          where: {
            userId: session.user.id,
            eventId: seminarSlug,
            status: PaymentStatus.SUCCESS,
          },
          orderBy: {
            paidAt: "desc",
          },
        })

    if (
      !payment ||
      payment.userId !== session.user.id ||
      payment.status !== PaymentStatus.SUCCESS ||
      payment.eventId !== seminarSlug
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "A successful payment is required before registration",
        },
        { status: 402 }
      )
    }

    const registration = await prisma.registration.create({
      data: {
        name,
        email,
        phone,
        seminarSlug,
        paymentStatus: "paid",
        razorpayOrderId: payment.razorpayOrderId,
        razorpayPaymentId: payment.razorpayPaymentId,
      },
    })

    return NextResponse.json({ success: true, data: registration })
  } catch (error) {
    if (
      error &&
      typeof error === "object" &&
      "code" in error &&
      error.code === "P2002"
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "You have already registered for this seminar",
        },
        { status: 409 }
      )
    }

    const message = error instanceof Error ? error.message : String(error)
    return NextResponse.json(
      { success: false, message },
      { status: 500 }
    )
  }
}
