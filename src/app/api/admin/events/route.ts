import { isAdminAuthenticated } from "@/lib/admin-auth"
import { normalizeEventId, normalizeCouponValue, paiseToRupees } from "@/lib/payment-service"
import { prisma } from "@/lib/prisma"
import { NextRequest, NextResponse } from "next/server"

export const runtime = "nodejs"

function unauthorized() {
  return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 })
}

export async function GET() {
  try {
    if (!(await isAdminAuthenticated())) {
      return unauthorized()
    }

    const events = await prisma.eventPricing.findMany({
      orderBy: { updatedAt: "desc" },
    })

    return NextResponse.json({
      success: true,
      data: events.map((event) => ({
        id: event.id,
        eventId: event.eventId,
        pricePaise: event.price,
        priceRupees: paiseToRupees(event.price),
        createdAt: event.createdAt,
        updatedAt: event.updatedAt,
      })),
    })
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error)
    return NextResponse.json({ success: false, error: message }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    if (!(await isAdminAuthenticated())) {
      return unauthorized()
    }

    const body = await request.json()
    const eventId = normalizeEventId(body?.eventId)
    const pricePaise = normalizeCouponValue(body?.price)

    if (pricePaise < 100) {
      return NextResponse.json(
        { success: false, error: "Price must be at least INR 1.00" },
        { status: 400 }
      )
    }

    const event = await prisma.eventPricing.upsert({
      where: { eventId },
      create: {
        eventId,
        price: pricePaise,
      },
      update: {
        price: pricePaise,
      },
    })

    return NextResponse.json({
      success: true,
      data: {
        id: event.id,
        eventId: event.eventId,
        pricePaise: event.price,
        priceRupees: paiseToRupees(event.price),
        updatedAt: event.updatedAt,
      },
    })
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error)
    return NextResponse.json({ success: false, error: message }, { status: 400 })
  }
}
