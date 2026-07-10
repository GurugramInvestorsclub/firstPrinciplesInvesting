"use client"

import { useEffect, useState, useCallback } from "react"
import { useRouter } from "next/navigation"
import { AlertCircle, CheckCircle } from "lucide-react"

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

interface StickyFooterCheckoutProps {
  paywallReady: boolean
  hasSubscriptionAccess: boolean
  session: {
    user?: {
      id?: string | null
      name?: string | null
      email?: string | null
    } | null
  } | null
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

export function StickyFooterCheckout({
  paywallReady,
  hasSubscriptionAccess,
  session,
  plans,
}: StickyFooterCheckoutProps) {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [isVisible, setIsVisible] = useState(false)

  // Only target the active plan (three_monthly)
  const targetPlanKey: PlanKey = "three_monthly"
  const selectedPlan = plans.find((entry) => entry.key === targetPlanKey) ?? plans[0]

  // Show footer only after scrolling past the hero section (~600px)
  useEffect(() => {
    if (typeof window === "undefined" || hasSubscriptionAccess) return

    const handleScroll = () => {
      if (window.scrollY > 600) {
        setIsVisible(true)
      } else {
        setIsVisible(false)
      }
    }

    window.addEventListener("scroll", handleScroll, { passive: true })
    handleScroll() // Check immediately on mount

    return () => window.removeEventListener("scroll", handleScroll)
  }, [hasSubscriptionAccess])

  const handleCheckout = useCallback(async () => {
    setError(null)
    setSuccess(null)

    // Redirect to login if user is not authenticated
    if (!session?.user?.id) {
      router.push(`/login?callbackUrl=${encodeURIComponent("/insights")}`)
      return
    }

    if (!paywallReady) {
      setError("Subscriptions are currently disabled.")
      return
    }

    setIsSubmitting(true)

    try {
      const createResponse = await fetch("/api/subscriptions/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          plan: targetPlanKey,
          couponCode: null,
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
        throw new Error("Unable to load Razorpay checkout script")
      }

      const checkout = new RazorpayConstructor({
        key: createPayload.data.razorpayKeyId,
        subscription_id: createPayload.data.subscriptionId,
        name: "First Principles Investing",
        description: `Insights ${selectedPlan?.label ?? "Quarterly"} Membership`,
        recurring: true,
        prefill: {
          name: session.user.name ?? undefined,
          email: session.user.email ?? undefined,
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

            setSuccess("Membership activated. Redirecting to members portal...")
            setTimeout(() => {
              router.push("/insights/members-only")
              router.refresh()
            }, 1500)
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
  }, [session, paywallReady, router, selectedPlan, targetPlanKey])

  // Global click interceptor to catch clicks on any CTA anchor and trigger Razorpay directly without jumps/scrolls
  useEffect(() => {
    if (typeof window === "undefined" || hasSubscriptionAccess) return

    const handleGlobalClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement
      const anchor = target.closest('a[href="#membership"]')
      if (anchor) {
        e.preventDefault() // Prevent native hash jump / page scroll
        handleCheckout()
      }
    }

    document.addEventListener("click", handleGlobalClick)
    return () => document.removeEventListener("click", handleGlobalClick)
  }, [hasSubscriptionAccess, handleCheckout])

  // Hide the footer completely if the user already has full subscription access
  if (hasSubscriptionAccess) return null

  return (
    <>
      {/* Golden Brand Loading Overlay */}
      {isSubmitting && (
        <div className="fixed inset-0 bg-[#0C0C0E]/80 backdrop-blur-sm z-[9999] flex flex-col items-center justify-center gap-4 transition-all duration-300">
          <div className="relative flex items-center justify-center">
            {/* Pulsing Backglow */}
            <div className="absolute w-20 h-20 bg-gold/10 rounded-full blur-xl animate-pulse" />
            {/* Custom Golden Spinning Loader Ring */}
            <div className="w-14 h-14 rounded-full border-4 border-gold/10 border-t-gold animate-spin" />
          </div>
          <span className="text-white text-sm font-sans font-bold tracking-wider uppercase">
            Preparing Secure Checkout...
          </span>
        </div>
      )}

      {/* Toast Notification Container for Errors & Success */}
      {(error || success) && (
        <div className="fixed bottom-24 left-6 right-6 md:left-auto md:right-8 z-50 max-w-sm w-full mx-auto">
          {error && (
            <div className="flex items-center gap-3 bg-red-950/90 border border-red-500/30 p-4 rounded-xl text-red-200 text-sm shadow-2xl backdrop-blur-md">
              <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}
          {success && (
            <div className="flex items-center gap-3 bg-emerald-950/90 border border-emerald-500/30 p-4 rounded-xl text-emerald-200 text-sm shadow-2xl backdrop-blur-md">
              <CheckCircle className="w-5 h-5 text-emerald-400 flex-shrink-0" />
              <span>{success}</span>
            </div>
          )}
        </div>
      )}

      {/* Floating Bottom Sticky Bar */}
      <div className={`fixed bottom-0 left-0 right-0 bg-[#0e0e12]/95 border-t border-white/10 backdrop-blur-md z-45 py-4 px-6 flex items-center justify-center shadow-[0_-10px_30px_rgba(0,0,0,0.5)] transition-all duration-300 ease-in-out ${isVisible ? "translate-y-0 opacity-100" : "translate-y-full opacity-0 pointer-events-none"}`}>
        <button
          onClick={handleCheckout}
          disabled={isSubmitting}
          className="w-full sm:w-auto min-w-[280px] sm:min-w-[340px] inline-flex items-center justify-center gap-3 rounded-[10px] bg-gold text-[#16161C] px-8 py-3.5 font-sans font-bold tracking-wide hover:brightness-[1.06] active:scale-[0.98] transition-all duration-150 disabled:opacity-50 disabled:pointer-events-none shadow-lg shadow-gold/10"
        >
          <span>Subscribe Quarterly (₹23/day)</span>
        </button>
      </div>
    </>
  )
}
