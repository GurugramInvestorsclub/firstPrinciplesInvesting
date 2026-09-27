"use client"

import { useState, useCallback, useEffect } from "react"
import { useRouter } from "next/navigation"
import { AlertCircle, CheckCircle } from "lucide-react"

interface RazorpaySubscriptionCheckoutOptions {
  key: string
  subscription_id: string
  name: string
  description: string
  recurring?: boolean
  prefill?: {
    name?: string
    email?: string
    contact?: string
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

export interface InsightsSubscribeButtonProps {
  session?: {
    user?: {
      id?: string | null
      name?: string | null
      email?: string | null
      phone?: string | null
    } | null
  } | null
  paywallReady?: boolean
  buttonText?: string
  className?: string
  planKey?: "monthly" | "three_monthly" | "yearly"
  autoOpenOnParam?: boolean
}

export function InsightsSubscribeButton({
  session,
  paywallReady = true,
  buttonText = "Subscribe for ₹23/day",
  className = "inline-flex items-center justify-center rounded-[10px] bg-gold text-[#16161C] px-7 py-3.5 font-semibold tracking-wide hover:brightness-[1.06] motion-safe:hover:-translate-y-[1px] transition-[transform,filter] duration-150 ease-out text-center shadow-lg shadow-gold/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold focus-visible:ring-offset-2 focus-visible:ring-offset-[#1A1A1A] cursor-pointer",
  planKey = "three_monthly",
  autoOpenOnParam = true,
}: InsightsSubscribeButtonProps) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  const handleSubscribe = useCallback(async () => {
    setError(null)
    setSuccess(null)

    // Redirect to login if user is not authenticated
    if (!session?.user?.id) {
      router.push(`/login?callbackUrl=${encodeURIComponent("/insights?subscribe=true")}`)
      return
    }

    if (!paywallReady) {
      setError("Subscriptions are currently disabled. Please try again shortly.")
      return
    }

    setIsLoading(true)

    try {
      const createResponse = await fetch("/api/subscriptions/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          plan: planKey,
          couponCode: null,
          phone: (session.user as any)?.phone || null,
        }),
      })

      const createPayload = await createResponse.json()
      if (!createResponse.ok || !createPayload.success) {
        if (createResponse.status === 401) {
          router.push(`/login?callbackUrl=${encodeURIComponent("/insights?subscribe=true")}`)
          return
        }
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
        description: "Insights Quarterly Membership",
        recurring: true,
        prefill: {
          name: session.user.name ?? undefined,
          email: session.user.email ?? undefined,
          contact: (session.user as any)?.phone ?? createPayload.data?.userPhone ?? undefined,
        },
        modal: {
          ondismiss: () => {
            setIsLoading(false)
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

            setSuccess("Membership activated! Redirecting to members portal...")
            setTimeout(() => {
              router.push("/insights/members-only")
              router.refresh()
            }, 1200)
          } catch (verificationError) {
            setError(
              verificationError instanceof Error
                ? verificationError.message
                : "Subscription verification failed"
            )
            setIsLoading(false)
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
        setIsLoading(false)
      })

      checkout.open()
    } catch (checkoutError) {
      setError(checkoutError instanceof Error ? checkoutError.message : "Unable to start checkout")
      setIsLoading(false)
    }
  }, [session, paywallReady, router, planKey])

  // Auto-open checkout if user was redirected from login with ?subscribe=true
  useEffect(() => {
    if (!autoOpenOnParam || typeof window === "undefined") return

    const params = new URLSearchParams(window.location.search)
    if (params.get("subscribe") === "true" && session?.user?.id && paywallReady) {
      // Clean query parameter from URL cleanly without reload
      const newUrl = window.location.pathname
      window.history.replaceState({}, "", newUrl)
      handleSubscribe()
    }
  }, [autoOpenOnParam, session?.user?.id, paywallReady, handleSubscribe])

  return (
    <>
      {/* Golden Brand Loading Overlay */}
      {isLoading && (
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

      <button
        type="button"
        onClick={handleSubscribe}
        disabled={isLoading}
        className={className}
        data-insights-subscribe="true"
      >
        <span>{buttonText}</span>
      </button>
    </>
  )
}
