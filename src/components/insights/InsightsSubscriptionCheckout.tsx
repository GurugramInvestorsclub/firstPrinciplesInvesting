"use client"

import { useRouter } from "next/navigation"
import { useState } from "react"

type PlanKey = "monthly" | "three_monthly" | "yearly"

interface PlanOption {
  key: PlanKey
  label: string
  description: string
  cadence: string
  priceLabel: string
  badge: string | null
}

interface RazorpaySubscriptionCheckoutOptions {
  key: string
  subscription_id: string
  name: string
  description: string
  recurring?: boolean
  prefill?: {
    name?: string
    email?: string
  }
  modal?: {
    ondismiss?: () => void
  }
  handler: (response: {
    razorpay_payment_id: string
    razorpay_subscription_id: string
    razorpay_signature: string
  }) => void | Promise<void>
}

type RazorpaySubscriptionCheckoutInstance = {
  open: () => void
  on: (event: string, handler: (response: unknown) => void) => void
}

type RazorpaySubscriptionCheckoutConstructor = new (
  options: RazorpaySubscriptionCheckoutOptions
) => RazorpaySubscriptionCheckoutInstance

interface Props {
  callbackUrl: string
  userName?: string | null
  userEmail?: string | null
  compact?: boolean
  initialPlan?: PlanKey
  plans: PlanOption[]
}

let scriptLoaderPromise: Promise<boolean> | null = null

function loadRazorpayCheckoutScript(): Promise<boolean> {
  if (typeof window === "undefined") return Promise.resolve(false)
  const razorpayWindow = window as unknown as { Razorpay?: RazorpaySubscriptionCheckoutConstructor }
  if (razorpayWindow.Razorpay) return Promise.resolve(true)

  if (!scriptLoaderPromise) {
    scriptLoaderPromise = new Promise((resolve) => {
      const script = document.createElement("script")
      script.src = "https://checkout.razorpay.com/v1/checkout.js"
      script.async = true
      script.onload = () => resolve(true)
      script.onerror = () => resolve(false)
      document.body.appendChild(script)
    })
  }

  return scriptLoaderPromise
}

export function InsightsSubscriptionCheckout({
  callbackUrl,
  userName,
  userEmail,
  compact = false,
  initialPlan = "three_monthly",
  plans,
}: Props) {
  const router = useRouter()
  const defaultPlan = plans.find((entry) => entry.key === initialPlan) ?? plans[0]
  const [plan, setPlan] = useState<PlanKey>(defaultPlan?.key ?? "three_monthly")
  const [couponCode, setCouponCode] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const selectedPlan = plans.find((entry) => entry.key === plan) ?? plans[0]

  const startCheckout = async () => {
    setError(null)
    setSuccess(null)
    setIsSubmitting(true)

    try {
      const createResponse = await fetch("/api/subscriptions/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          plan,
          couponCode: couponCode.trim() || null,
        }),
      })

      const createPayload = await createResponse.json()
      if (!createResponse.ok || !createPayload.success) {
        throw new Error(createPayload.message ?? "Unable to create subscription")
      }

      const scriptReady = await loadRazorpayCheckoutScript()
      const RazorpayConstructor = (window as unknown as {
        Razorpay?: RazorpaySubscriptionCheckoutConstructor
      }).Razorpay

      if (!scriptReady || !RazorpayConstructor) {
        throw new Error("Unable to load Razorpay checkout")
      }

      const checkout = new RazorpayConstructor({
        key: createPayload.data.razorpayKeyId,
        subscription_id: createPayload.data.subscriptionId,
        name: "First Principles Investing",
        description: `Insights ${selectedPlan?.label ?? "Premium"} Membership`,
        recurring: true,
        prefill: {
          name: userName ?? undefined,
          email: userEmail ?? undefined,
        },
        modal: {
          ondismiss: () => {
            setError("Checkout was closed before completion")
          },
        },
        handler: async (checkoutResponse) => {
          try {
            const verifyResponse = await fetch("/api/subscriptions/verify", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                razorpaySubscriptionId: checkoutResponse.razorpay_subscription_id,
                razorpayPaymentId: checkoutResponse.razorpay_payment_id,
                razorpaySignature: checkoutResponse.razorpay_signature,
              }),
            })

            const verifyPayload = await verifyResponse.json()
            if (!verifyResponse.ok || !verifyPayload.success) {
              throw new Error(verifyPayload.message ?? "Subscription verification failed")
            }

            setSuccess("Membership activated. Refreshing access...")
            router.push(callbackUrl)
            router.refresh()
          } catch (verificationError) {
            setError(
              verificationError instanceof Error
                ? verificationError.message
                : "Subscription verification failed"
            )
          }
        },
      })

      checkout.on("payment.failed", (failure: unknown) => {
        const errorMessage =
          typeof failure === "object" &&
          failure !== null &&
          "error" in failure &&
          typeof (failure as { error?: { description?: string } }).error?.description === "string"
            ? (failure as { error: { description: string } }).error.description
            : "Subscription payment failed"

        setError(errorMessage)
      })

      checkout.open()
    } catch (checkoutError) {
      setError(checkoutError instanceof Error ? checkoutError.message : "Unable to start checkout")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className={compact ? "space-y-4" : "space-y-5 rounded-2xl border border-white/10 bg-white/5 p-5 md:p-6"}>
      <div className={plans.length === 1 ? "grid gap-2" : "grid gap-2 md:grid-cols-3"}>
        {plans.map((entry) => {
          const active = plan === entry.key
          return (
            <button
              key={entry.key}
              type="button"
              onClick={() => setPlan(entry.key)}
              className={`min-h-[116px] rounded-xl border px-4 py-3 text-left text-sm transition ${
                active
                  ? "border-gold bg-gold/10 text-gold"
                  : "border-white/10 bg-black/20 text-white/80 hover:border-white/20"
              }`}
              disabled={isSubmitting}
            >
              <span className="flex items-center justify-between gap-2">
                <span className="font-semibold">{entry.label}</span>
                {entry.badge ? (
                  <span className="rounded-full bg-white/10 px-2 py-1 text-[10px] font-bold uppercase tracking-[0.12em] text-white/70">
                    {entry.badge}
                  </span>
                ) : null}
              </span>
              <span className="mt-3 block text-lg font-bold text-white">{entry.priceLabel}</span>
              <span className="mt-1 block text-xs leading-5 text-white/55">{entry.cadence}</span>
            </button>
          )
        })}
      </div>

      <label className="hidden">
        <span className="text-xs font-semibold uppercase tracking-[0.16em] text-white/45">
          Offer code
        </span>
        <input
          value={couponCode}
          onChange={(event) => setCouponCode(event.target.value)}
          className="h-11 w-full rounded-xl border border-white/10 bg-black/20 px-4 text-sm text-white outline-none transition placeholder:text-white/35 focus:border-gold/60"
          placeholder="Optional"
          disabled={isSubmitting}
        />
      </label>

      <button
        type="button"
        onClick={startCheckout}
        disabled={isSubmitting}
        className="inline-flex w-full items-center justify-center rounded-xl bg-gold px-4 py-3 text-sm font-bold text-black transition hover:brightness-105 disabled:cursor-not-allowed disabled:opacity-70"
      >
        {isSubmitting ? "Starting Checkout..." : `Subscribe ${selectedPlan?.label ?? "Now"}`}
      </button>

      {error ? <p className="text-sm text-red-300">{error}</p> : null}
      {success ? <p className="text-sm text-emerald-300">{success}</p> : null}
    </div>
  )
}

