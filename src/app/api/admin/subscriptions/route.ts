import { InsightsPlanKey } from "@prisma/client"
import { isAdminAuthenticated } from "@/lib/admin-auth"
import { getInsightsSubscriptionUiState } from "@/lib/insights-subscription-service"
import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"

export const runtime = "nodejs"

function planKeyToSlug(planKey: InsightsPlanKey) {
  if (planKey === InsightsPlanKey.MONTHLY) {
    return "monthly"
  }

  if (planKey === InsightsPlanKey.THREE_MONTHLY) {
    return "three_monthly"
  }

  return "yearly"
}

function unauthorized() {
  return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 })
}

export async function GET() {
  try {
    if (!(await isAdminAuthenticated())) {
      return unauthorized()
    }

    const subscriptions = await prisma.insightsSubscription.findMany({
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        charges: {
          orderBy: {
            createdAt: "desc",
          },
          take: 1,
        },
      },
      orderBy: {
        updatedAt: "desc",
      },
    })

    return NextResponse.json({
      success: true,
      data: {
        config: getInsightsSubscriptionUiState(),
        rows: subscriptions.map((subscription) => ({
          id: subscription.id,
          userId: subscription.userId,
          userName: subscription.user.name,
          userEmail: subscription.user.email,
          planKey: planKeyToSlug(subscription.planKey),
          status: subscription.status.toLowerCase(),
          cancelAtCycleEnd: subscription.cancelAtCycleEnd,
          currentStartAt: subscription.currentStartAt,
          currentEndAt: subscription.currentEndAt,
          cancelRequestedAt: subscription.cancelRequestedAt,
          cancelledAt: subscription.cancelledAt,
          endedAt: subscription.endedAt,
          razorpaySubscriptionId: subscription.razorpaySubscriptionId,
          razorpayPlanId: subscription.razorpayPlanId,
          createdAt: subscription.createdAt,
          updatedAt: subscription.updatedAt,
          latestCharge: subscription.charges[0]
            ? {
                amount: subscription.charges[0].amount,
                currency: subscription.charges[0].currency,
                status: subscription.charges[0].status.toLowerCase(),
                chargedAt: subscription.charges[0].chargedAt,
                failureReason: subscription.charges[0].failureReason,
                razorpayPaymentId: subscription.charges[0].razorpayPaymentId,
                razorpayInvoiceId: subscription.charges[0].razorpayInvoiceId,
              }
            : null,
        })),
      },
    })
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error)
    return NextResponse.json({ success: false, error: message }, { status: 500 })
  }
}
