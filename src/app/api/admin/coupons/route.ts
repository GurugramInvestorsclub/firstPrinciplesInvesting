import { CouponType } from "@prisma/client"
import { isAdminAuthenticated } from "@/lib/admin-auth"
import {
  normalizeCouponCode,
  normalizeCouponValue,
  normalizeEventId,
  paiseToRupees,
} from "@/lib/payment-service"
import { prisma } from "@/lib/prisma"
import { NextRequest, NextResponse } from "next/server"

export const runtime = "nodejs"

function unauthorized() {
  return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 })
}

function parseCouponType(value: unknown): CouponType {
  if (typeof value !== "string") {
    throw new Error("Coupon type is required")
  }

  const normalized = value.trim().toLowerCase()
  if (normalized === "percentage") return CouponType.PERCENTAGE
  if (normalized === "flat") return CouponType.FLAT

  throw new Error("Coupon type must be percentage or flat")
}

function parseOptionalPositiveInt(value: unknown, fieldName: string): number | null {
  if (value === null || value === undefined || value === "") {
    return null
  }

  const parsed = Number(value)
  if (!Number.isInteger(parsed) || parsed <= 0) {
    throw new Error(`${fieldName} must be a positive integer`)
  }

  return parsed
}

function parseExpiryDate(value: unknown): Date {
  if (typeof value !== "string" || value.trim().length === 0) {
    throw new Error("expiryDate is required")
  }

  const normalized = value.trim()
  if (!/(Z|[+-]\d{2}:\d{2})$/i.test(normalized)) {
    throw new Error("expiryDate must include timezone offset")
  }

  const parsed = new Date(normalized)
  if (Number.isNaN(parsed.getTime())) {
    throw new Error("expiryDate is invalid")
  }

  if (parsed <= new Date()) {
    throw new Error("expiryDate must be in the future")
  }

  return parsed
}

function serializeCoupon(coupon: {
  id: string
  code: string
  type: CouponType
  value: number
  maxUses: number | null
  usedCount: number
  expiryDate: Date
  isActive: boolean
  eventId: string | null
  perUserLimit: number | null
  createdAt: Date
  updatedAt: Date
  _count?: { redemptions: number }
}) {
  return {
    id: coupon.id,
    code: coupon.code,
    type: coupon.type === CouponType.PERCENTAGE ? "percentage" : "flat",
    value: coupon.value,
    valueRupees: coupon.type === CouponType.FLAT ? paiseToRupees(coupon.value) : null,
    maxUses: coupon.maxUses,
    usedCount: coupon.usedCount,
    remainingUses:
      coupon.maxUses === null ? null : Math.max(coupon.maxUses - coupon.usedCount, 0),
    expiryDate: coupon.expiryDate,
    isActive: coupon.isActive,
    eventId: coupon.eventId,
    perUserLimit: coupon.perUserLimit,
    redemptionCount: coupon._count?.redemptions ?? 0,
    createdAt: coupon.createdAt,
    updatedAt: coupon.updatedAt,
  }
}

export async function GET(request: NextRequest) {
  try {
    if (!(await isAdminAuthenticated())) {
      return unauthorized()
    }

    const { searchParams } = new URL(request.url)
    const codeQuery = searchParams.get("code")?.trim().toUpperCase()
    const eventIdQuery = searchParams.get("eventId")?.trim() ?? null
    const activeQuery = searchParams.get("active")

    const where: {
      code?: { contains: string; mode: "insensitive" }
      eventId?: string
      isActive?: boolean
    } = {}

    if (codeQuery) {
      where.code = {
        contains: codeQuery,
        mode: "insensitive",
      }
    }

    if (eventIdQuery) {
      where.eventId = normalizeEventId(eventIdQuery)
    }

    if (activeQuery === "true") {
      where.isActive = true
    } else if (activeQuery === "false") {
      where.isActive = false
    }

    const coupons = await prisma.coupon.findMany({
      where,
      include: {
        _count: {
          select: {
            redemptions: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    })

    return NextResponse.json({
      success: true,
      data: coupons.map(serializeCoupon),
    })
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error)
    return NextResponse.json({ success: false, error: message }, { status: 400 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    if (!(await isAdminAuthenticated())) {
      return unauthorized()
    }

    const { searchParams } = new URL(request.url)
    const id = searchParams.get("id")

    if (!id) {
      return NextResponse.json(
        { success: false, error: "id parameter is required" },
        { status: 400 }
      )
    }

    // Check if coupon has redemptions to prevent breaking data integrity
    const redemptionCount = await prisma.couponRedemption.count({
      where: { couponId: id },
    })

    if (redemptionCount > 0) {
      return NextResponse.json(
        { 
          success: false, 
          error: "Cannot delete coupon because it has already been used. Please deactivate it instead to preserve history." 
        },
        { status: 400 }
      )
    }

    await prisma.coupon.delete({
      where: { id },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error)
    return NextResponse.json({ success: false, error: message }, { status: 400 })
  }
}

export async function POST(request: NextRequest) {
  try {
    if (!(await isAdminAuthenticated())) {
      return unauthorized()
    }

    const body = await request.json()

    const code = normalizeCouponCode(body?.code)
    if (!code) {
      return NextResponse.json(
        { success: false, error: "code is required" },
        { status: 400 }
      )
    }

    const type = parseCouponType(body?.type)
    const maxUses = parseOptionalPositiveInt(body?.maxUses, "maxUses")
    const perUserLimit = parseOptionalPositiveInt(body?.perUserLimit, "perUserLimit")

    if (maxUses !== null && perUserLimit !== null && perUserLimit > maxUses) {
      return NextResponse.json(
        { success: false, error: "perUserLimit cannot exceed maxUses" },
        { status: 400 }
      )
    }

    let eventId: string | null = null
    if (body?.eventId) {
      eventId = normalizeEventId(body.eventId)
      const eventExists = await prisma.eventPricing.findUnique({
        where: { eventId },
        select: { id: true },
      })

      if (!eventExists) {
        return NextResponse.json(
          { success: false, error: "eventId is not configured in backend pricing" },
          { status: 400 }
        )
      }
    }

    const expiryDate = parseExpiryDate(body?.expiryDate)

    let value: number
    if (type === CouponType.PERCENTAGE) {
      const percentageValue = Number(body?.value)
      if (!Number.isInteger(percentageValue) || percentageValue < 1 || percentageValue > 100) {
        return NextResponse.json(
          { success: false, error: "Percentage coupons must have value between 1 and 100" },
          { status: 400 }
        )
      }
      value = percentageValue
    } else {
      value = normalizeCouponValue(body?.value)
      if (value < 1) {
        return NextResponse.json(
          { success: false, error: "Flat coupon value must be greater than zero" },
          { status: 400 }
        )
      }
    }

    const coupon = await prisma.coupon.create({
      data: {
        code,
        type,
        value,
        maxUses,
        usedCount: 0,
        expiryDate,
        isActive: body?.isActive === false ? false : true,
        eventId,
        perUserLimit,
      },
      include: {
        _count: {
          select: {
            redemptions: true,
          },
        },
      },
    })

    return NextResponse.json({
      success: true,
      data: serializeCoupon(coupon),
    })
  } catch (error) {
    if (
      error &&
      typeof error === "object" &&
      "code" in error &&
      error.code === "P2002"
    ) {
      return NextResponse.json(
        { success: false, error: "Coupon code already exists" },
        { status: 409 }
      )
    }

    const message = error instanceof Error ? error.message : String(error)
    return NextResponse.json({ success: false, error: message }, { status: 400 })
  }
}

export async function PATCH(request: NextRequest) {
  try {
    if (!(await isAdminAuthenticated())) {
      return unauthorized()
    }

    const body = await request.json()
    const couponId = typeof body?.id === "string" ? body.id : null

    if (!couponId) {
      return NextResponse.json(
        { success: false, error: "Coupon id is required" },
        { status: 400 }
      )
    }

    const existingCoupon = await prisma.coupon.findUnique({
      where: { id: couponId },
    })

    if (!existingCoupon) {
      return NextResponse.json(
        { success: false, error: "Coupon not found" },
        { status: 404 }
      )
    }

    const data: {
      isActive?: boolean
      maxUses?: number | null
      perUserLimit?: number | null
      expiryDate?: Date
      eventId?: string | null
      value?: number
    } = {}

    if (typeof body?.isActive === "boolean") {
      data.isActive = body.isActive
    }

    if (body?.value !== undefined) {
      if (existingCoupon.type === CouponType.PERCENTAGE) {
        const percentageValue = Number(body.value)
        if (!Number.isInteger(percentageValue) || percentageValue < 1 || percentageValue > 100) {
          return NextResponse.json(
            { success: false, error: "Percentage coupons must have value between 1 and 100" },
            { status: 400 }
          )
        }
        data.value = percentageValue
      } else {
        data.value = normalizeCouponValue(body.value)
        if (data.value < 1) {
          return NextResponse.json(
            { success: false, error: "Flat coupon value must be greater than zero" },
            { status: 400 }
          )
        }
      }
    }


    if (body?.maxUses !== undefined) {
      const maxUses = parseOptionalPositiveInt(body.maxUses, "maxUses")
      if (maxUses !== null && maxUses < existingCoupon.usedCount) {
        return NextResponse.json(
          { success: false, error: "maxUses cannot be less than usedCount" },
          { status: 400 }
        )
      }
      data.maxUses = maxUses
    }

    if (body?.perUserLimit !== undefined) {
      data.perUserLimit = parseOptionalPositiveInt(body.perUserLimit, "perUserLimit")
    }

    const effectiveMaxUses = data.maxUses ?? existingCoupon.maxUses
    const effectivePerUserLimit = data.perUserLimit ?? existingCoupon.perUserLimit

    if (
      effectiveMaxUses !== null &&
      effectivePerUserLimit !== null &&
      effectivePerUserLimit > effectiveMaxUses
    ) {
      return NextResponse.json(
        { success: false, error: "perUserLimit cannot exceed maxUses" },
        { status: 400 }
      )
    }

    if (body?.expiryDate !== undefined) {
      data.expiryDate = parseExpiryDate(body.expiryDate)
    }

    if (body?.eventId !== undefined) {
      if (body.eventId === null || body.eventId === "") {
        data.eventId = null
      } else {
        const normalizedEventId = normalizeEventId(body.eventId)
        const eventExists = await prisma.eventPricing.findUnique({
          where: { eventId: normalizedEventId },
          select: { id: true },
        })

        if (!eventExists) {
          return NextResponse.json(
            { success: false, error: "eventId is not configured in backend pricing" },
            { status: 400 }
          )
        }

        data.eventId = normalizedEventId
      }
    }

    const updated = await prisma.coupon.update({
      where: { id: couponId },
      data,
      include: {
        _count: {
          select: {
            redemptions: true,
          },
        },
      },
    })

    return NextResponse.json({
      success: true,
      data: serializeCoupon(updated),
    })
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error)
    return NextResponse.json({ success: false, error: message }, { status: 400 })
  }
}
