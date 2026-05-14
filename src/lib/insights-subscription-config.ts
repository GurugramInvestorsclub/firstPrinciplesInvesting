export type InsightsPlanSlug = "monthly" | "three_monthly" | "yearly"

export interface InsightsPlanCatalogEntry {
  key: InsightsPlanSlug
  label: string
  description: string
  cadence: string
  priceLabel: string
  badge?: string
  totalCount: number
  envVar: string
}

const PLAN_CATALOG: Record<InsightsPlanSlug, InsightsPlanCatalogEntry> = {
  monthly: {
    key: "monthly",
    label: "Monthly",
    description: "Flexible recurring access to premium Insights.",
    cadence: "Billed every month",
    priceLabel: process.env.INSIGHTS_MONTHLY_PRICE_LABEL ?? "Monthly billing",
    totalCount: 600,
    envVar: "RAZORPAY_INSIGHTS_MONTHLY_PLAN_ID",
  },
  three_monthly: {
    key: "three_monthly",
    label: "Quarterly",
    description: "Quarterly access for readers who want a longer research window.",
    cadence: "Billed every 3 months",
    priceLabel: process.env.INSIGHTS_THREE_MONTHLY_PRICE_LABEL ?? "3-month billing",
    badge: "Quarterly",
    totalCount: 200,
    envVar: "RAZORPAY_INSIGHTS_THREE_MONTHLY_PLAN_ID",
  },
  yearly: {
    key: "yearly",
    label: "Annual",
    description: "Full-year membership for the complete archive and future memos.",
    cadence: "Billed once a year",
    priceLabel: process.env.INSIGHTS_YEARLY_PRICE_LABEL ?? "Annual billing",
    badge: "Best value",
    totalCount: 50,
    envVar: "RAZORPAY_INSIGHTS_YEARLY_PLAN_ID",
  },
}

const ACTIVE_PLAN_SLUGS: InsightsPlanSlug[] = ["three_monthly"]

function parseBooleanEnv(value: string | undefined): boolean {
  if (!value) {
    return false
  }

  const normalized = value.trim().toLowerCase()
  return normalized === "1" || normalized === "true" || normalized === "yes" || normalized === "on"
}

export function isInsightsSubscriptionsFeatureEnabled(): boolean {
  return parseBooleanEnv(process.env.INSIGHTS_SUBSCRIPTIONS_ENABLED)
}

export function getInsightsSubscriptionPlanCatalog(): InsightsPlanCatalogEntry[] {
  return ACTIVE_PLAN_SLUGS.map((plan) => PLAN_CATALOG[plan])
}

export function getInsightsSubscriptionPlanDefinition(
  plan: InsightsPlanSlug
): InsightsPlanCatalogEntry {
  return PLAN_CATALOG[plan]
}

export function getInsightsSubscriptionPlanId(plan: InsightsPlanSlug): string | null {
  const envVar = PLAN_CATALOG[plan].envVar
  const value = process.env[envVar]
  return typeof value === "string" && value.trim().length > 0 ? value.trim() : null
}

export function getInsightsSubscriptionTestOffer(params: {
  couponCode?: string | null
  plan: InsightsPlanSlug
}): { couponCode: string; offerId: string } | null {
  const configuredCode = process.env.RAZORPAY_INSIGHTS_TEST_COUPON_CODE?.trim()
  if (!configuredCode || !params.couponCode) {
    return null
  }

  if (params.couponCode.trim().toUpperCase() !== configuredCode.toUpperCase()) {
    return null
  }

  const specificOfferEnv =
    params.plan === "three_monthly"
      ? "RAZORPAY_INSIGHTS_THREE_MONTHLY_TEST_OFFER_ID"
      : params.plan === "monthly"
        ? "RAZORPAY_INSIGHTS_MONTHLY_TEST_OFFER_ID"
        : "RAZORPAY_INSIGHTS_YEARLY_TEST_OFFER_ID"
  const offerId = process.env[specificOfferEnv]?.trim() || process.env.RAZORPAY_INSIGHTS_TEST_OFFER_ID?.trim()

  if (!offerId) {
    return null
  }

  return {
    couponCode: configuredCode,
    offerId,
  }
}

export function hasInsightsSubscriptionCouponCode(value?: string | null): boolean {
  return typeof value === "string" && value.trim().length > 0
}

export function getInsightsSubscriptionKeyId(): string | null {
  const value = process.env.RAZORPAY_KEY_ID
  return typeof value === "string" && value.trim().length > 0 ? value.trim() : null
}

export function getInsightsSubscriptionKeySecret(): string | null {
  const value = process.env.RAZORPAY_KEY_SECRET
  return typeof value === "string" && value.trim().length > 0 ? value.trim() : null
}

export function getInsightsSubscriptionsWebhookSecret(): string | null {
  const value = process.env.RAZORPAY_SUBSCRIPTIONS_WEBHOOK_SECRET
  return typeof value === "string" && value.trim().length > 0 ? value.trim() : null
}

export function getInsightsSubscriptionRuntimeState() {
  const featureEnabled = isInsightsSubscriptionsFeatureEnabled()
  const keyId = getInsightsSubscriptionKeyId()
  const keySecret = getInsightsSubscriptionKeySecret()
  const webhookSecret = getInsightsSubscriptionsWebhookSecret()

  const missingCheckoutConfig = [
    !keyId ? "RAZORPAY_KEY_ID" : null,
    !keySecret ? "RAZORPAY_KEY_SECRET" : null,
    ...ACTIVE_PLAN_SLUGS.map((plan) => {
      const definition = PLAN_CATALOG[plan]
      return getInsightsSubscriptionPlanId(plan) ? null : definition.envVar
    }),
  ].filter((value): value is string => Boolean(value))

  return {
    featureEnabled,
    checkoutReady: featureEnabled && missingCheckoutConfig.length === 0,
    webhookReady: featureEnabled && Boolean(webhookSecret),
    missingCheckoutConfig,
    missingWebhookConfig: webhookSecret ? [] : ["RAZORPAY_SUBSCRIPTIONS_WEBHOOK_SECRET"],
  }
}
