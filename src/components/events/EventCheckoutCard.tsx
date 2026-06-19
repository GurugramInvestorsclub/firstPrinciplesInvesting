"use client"

import { Button } from "@/components/ui/button"
import { Event } from "@/lib/types"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useEffect, useMemo, useState } from "react"

declare global {
  interface Window {
    Razorpay?: new (options: RazorpayCheckoutOptions) => {
      open: () => void
      on: (event: string, handler: (response: unknown) => void) => void
    }
  }
}

interface RazorpayCheckoutOptions {
  key: string
  amount: number
  currency: string
  name: string
  description: string
  order_id: string
  notes?: Record<string, string>
  prefill?: {
    name?: string
    email?: string
    contact?: string
  }
  modal?: {
    ondismiss?: () => void
  }
  handler: (response: {
    razorpay_order_id: string
    razorpay_payment_id: string
    razorpay_signature: string
  }) => void | Promise<void>
}

interface PricingState {
  baseAmount: number
  discountAmount: number
  finalAmount: number
  couponCode: string | null
}

interface GuestCheckoutState {
  name: string
  email: string
  phone: string
}

let scriptLoaderPromise: Promise<boolean> | null = null

function loadRazorpayCheckoutScript(): Promise<boolean> {
  if (typeof window === "undefined") return Promise.resolve(false)
  if (window.Razorpay) return Promise.resolve(true)

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

function formatInrFromPaise(amountPaise: number): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
  }).format(amountPaise / 100)
}

function eventIsOpen(date: string): boolean {
  return new Date(date).getTime() > Date.now()
}

export function EventCheckoutCard({ event, minimal }: { event: Event, minimal?: boolean }) {
  const { data: session, status } = useSession()
  const router = useRouter()

  const cmsDisplayPricePaise = useMemo(() => {
    if (typeof event.price !== "number" || !Number.isFinite(event.price)) return null
    const rounded = Math.round(event.price * 100)
    return rounded > 0 ? rounded : null
  }, [event.price])

  const [couponInput, setCouponInput] = useState("")
  const [pricing, setPricing] = useState<PricingState | null>(
    cmsDisplayPricePaise
      ? {
          baseAmount: cmsDisplayPricePaise,
          discountAmount: 0,
          finalAmount: cmsDisplayPricePaise,
          couponCode: null,
        }
      : null
  )
  const [isApplyingCoupon, setIsApplyingCoupon] = useState(false)
  const [isCreatingOrder, setIsCreatingOrder] = useState(false)
  const [isCreatingGuestOrder, setIsCreatingGuestOrder] = useState(false)
  const [guestCheckout, setGuestCheckout] = useState<GuestCheckoutState>({
    name: "",
    email: "",
    phone: "",
  })
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [isSubscriber, setIsSubscriber] = useState(false)
  const [isPricingLoading, setIsPricingLoading] = useState(false)

  const isRegistrationOpen = eventIsOpen(event.date)

  useEffect(() => {
    if (status === "loading") {
      setIsPricingLoading(true)
      return
    }

    if (status === "authenticated" && event.eventId) {
      setIsPricingLoading(true)
      const fetchInitialPricing = async () => {
        try {
          const response = await fetch("/api/validate-coupon", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              eventId: event.eventId,
              couponCode: null,
            }),
          })
          const payload = await response.json()
          if (response.ok && payload.success) {
            setPricing({
              baseAmount: payload.data.baseAmount,
              discountAmount: payload.data.discountAmount,
              finalAmount: payload.data.finalAmount,
              couponCode: payload.data.coupon?.code ?? null,
            })
            setIsSubscriber(!!payload.data.isSubscriber)
          }
        } catch (e) {
          console.error("Failed to fetch initial pricing preview", e)
        } finally {
          setIsPricingLoading(false)
        }
      }
      fetchInitialPricing()
    } else {
      setIsSubscriber(false)
      setIsPricingLoading(false)
      if (cmsDisplayPricePaise) {
        setPricing({
          baseAmount: cmsDisplayPricePaise,
          discountAmount: 0,
          finalAmount: cmsDisplayPricePaise,
          couponCode: null,
        })
      }
    }
  }, [status, event.eventId, cmsDisplayPricePaise])

  const navigateToLogin = () => {
    const callbackUrl = `/events/${event.slug.current}`
    router.push(`/login?callbackUrl=${encodeURIComponent(callbackUrl)}`)
  }

  const applyCoupon = async () => {
    setError(null)
    setSuccess(null)

    if (!event.eventId) {
      setError("Event payment configuration is missing")
      return
    }

    if (status !== "authenticated" || !session?.user?.id) {
      setError("Please log in to validate coupon codes")
      return
    }

    setIsApplyingCoupon(true)

    try {
      const response = await fetch("/api/validate-coupon", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          eventId: event.eventId,
          couponCode: couponInput.trim() || null,
        }),
      })

      const payload = await response.json()
      if (!response.ok || !payload.success) {
        throw new Error(payload.message ?? "Coupon validation failed")
      }

      setPricing({
        baseAmount: payload.data.baseAmount,
        discountAmount: payload.data.discountAmount,
        finalAmount: payload.data.finalAmount,
        couponCode: payload.data.coupon?.code ?? null,
      })

      if (payload.data.coupon?.code) {
        setCouponInput(payload.data.coupon.code)
        setSuccess(`Coupon ${payload.data.coupon.code} applied`)
      } else {
        setCouponInput("")
        setSuccess("Coupon cleared")
      }
    } catch (apiError) {
      setError(apiError instanceof Error ? apiError.message : "Failed to validate coupon")
      setPricing((current) =>
        current
          ? {
              ...current,
              discountAmount: 0,
              finalAmount: current.baseAmount,
              couponCode: null,
            }
          : current
      )
    } finally {
      setIsApplyingCoupon(false)
    }
  }

  const startPayment = async () => {
    setError(null)
    setSuccess(null)

    if (!isRegistrationOpen) {
      setError("Registration is closed for this event")
      return
    }

    if (!event.eventId) {
      setError("Event payment configuration is missing")
      return
    }

    if (status !== "authenticated" || !session?.user?.id) {
      navigateToLogin()
      return
    }

    setIsCreatingOrder(true)

    try {
      const orderResponse = await fetch("/api/create-order", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          eventId: event.eventId,
          couponCode: pricing?.couponCode ?? null,
        }),
      })

      const orderPayload = await orderResponse.json()
      if (!orderResponse.ok || !orderPayload.success) {
        throw new Error(orderPayload.message ?? "Failed to create order")
      }

      const scriptReady = await loadRazorpayCheckoutScript()
      if (!scriptReady || !window.Razorpay) {
        throw new Error("Unable to load Razorpay checkout")
      }

      const checkout = new window.Razorpay({
        key: orderPayload.data.razorpayKeyId,
        amount: orderPayload.data.amount,
        currency: orderPayload.data.currency,
        name: "First Principles Investing",
        description: event.title,
        order_id: orderPayload.data.orderId,
        notes: {
          eventId: orderPayload.data.eventId,
          couponCode: orderPayload.data.couponCode ?? "",
        },
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
            const verifyResponse = await fetch("/api/verify-payment", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                razorpayOrderId: checkoutResponse.razorpay_order_id,
                razorpayPaymentId: checkoutResponse.razorpay_payment_id,
                razorpaySignature: checkoutResponse.razorpay_signature,
              }),
            })

            const verifyPayload = await verifyResponse.json()
            if (!verifyResponse.ok || !verifyPayload.success) {
              throw new Error(verifyPayload.message ?? "Payment verification failed")
            }

            // Redirect to the thank-you page with event details
            const searchParams = new URLSearchParams({
              type: "event",
              eventTitle: event.title,
              eventDate: event.startTime || event.date,
              email: session?.user?.email ?? "",
              whatsappLink: verifyPayload.data?.whatsappLink || ""
            })
            router.push(`/thank-you?${searchParams.toString()}`)
          } catch (verificationError) {
            setError(
              verificationError instanceof Error
                ? verificationError.message
                : "Payment verification failed"
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
            : "Payment failed"

        setError(errorMessage)
      })

      checkout.open()
    } catch (checkoutError) {
      setError(checkoutError instanceof Error ? checkoutError.message : "Unable to complete checkout")
    } finally {
      setIsCreatingOrder(false)
    }
  }

  const updateGuestCheckout = (field: keyof GuestCheckoutState, value: string) => {
    setGuestCheckout((current) => ({
      ...current,
      [field]: value,
    }))
  }

  const startGuestPayment = async () => {
    setError(null)
    setSuccess(null)

    if (!isRegistrationOpen) {
      setError("Registration is closed for this event")
      return
    }

    if (!event.eventId) {
      setError("Event payment configuration is missing")
      return
    }

    const name = guestCheckout.name.trim()
    const email = guestCheckout.email.trim().toLowerCase()
    const phone = guestCheckout.phone.trim()

    if (!name || !email || !phone) {
      setError("Name, email, and mobile number are required for fast checkout")
      return
    }

    setIsCreatingGuestOrder(true)

    try {
      const orderResponse = await fetch("/api/guest-checkout/create-order", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name,
          email,
          phone,
          eventId: event.eventId,
          couponCode: couponInput.trim() || null,
        }),
      })

      const orderPayload = await orderResponse.json()
      if (!orderResponse.ok || !orderPayload.success) {
        throw new Error(orderPayload.message ?? "Failed to create order")
      }

      setPricing({
        baseAmount: orderPayload.data.amount,
        discountAmount: 0,
        finalAmount: orderPayload.data.amount,
        couponCode: orderPayload.data.couponCode ?? null,
      })

      const scriptReady = await loadRazorpayCheckoutScript()
      if (!scriptReady || !window.Razorpay) {
        throw new Error("Unable to load Razorpay checkout")
      }

      const checkout = new window.Razorpay({
        key: orderPayload.data.razorpayKeyId,
        amount: orderPayload.data.amount,
        currency: orderPayload.data.currency,
        name: "First Principles Investing",
        description: event.title,
        order_id: orderPayload.data.orderId,
        notes: {
          eventId: orderPayload.data.eventId,
          couponCode: orderPayload.data.couponCode ?? "",
          checkoutMode: "guest",
        },
        prefill: {
          name,
          email,
          contact: phone,
        },
        modal: {
          ondismiss: () => {
            setError("Checkout was closed before completion")
          },
        },
        handler: async (checkoutResponse) => {
          try {
            const verifyResponse = await fetch("/api/guest-checkout/verify-payment", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                razorpayOrderId: checkoutResponse.razorpay_order_id,
                razorpayPaymentId: checkoutResponse.razorpay_payment_id,
                razorpaySignature: checkoutResponse.razorpay_signature,
              }),
            })

            const verifyPayload = await verifyResponse.json()
            if (!verifyResponse.ok || !verifyPayload.success) {
              throw new Error(verifyPayload.message ?? "Payment verification failed")
            }

            const searchParams = new URLSearchParams({
              type: "event",
              eventTitle: event.title,
              eventDate: event.startTime || event.date,
              email: verifyPayload.data?.email || email,
              whatsappLink: verifyPayload.data?.whatsappLink || ""
            })
            router.push(`/thank-you?${searchParams.toString()}`)
          } catch (verificationError) {
            setError(
              verificationError instanceof Error
                ? verificationError.message
                : "Payment verification failed"
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
            : "Payment failed"

        setError(errorMessage)
      })

      checkout.open()
    } catch (checkoutError) {
      setError(checkoutError instanceof Error ? checkoutError.message : "Unable to complete checkout")
    } finally {
      setIsCreatingGuestOrder(false)
    }
  }

  if (!event.eventId) {
    return (
      <div className="rounded-2xl border border-red-500/30 bg-red-500/5 p-5 text-sm text-red-300">
        This event is missing `eventId` configuration. Contact support before taking payments.
      </div>
    )
  }

  return (
    <div className={minimal ? "" : "rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl p-6 md:p-8"}>
      <div className="flex flex-col gap-3">
        <p className="text-xs uppercase tracking-[0.18em] text-gray-400">Secure Checkout</p>
        <div className="flex items-center justify-between gap-4">
          <span className="text-sm text-gray-400">Secure Your Spot</span>
          <div className="flex flex-col items-end gap-1">
            {isPricingLoading ? (
              <span className="text-sm text-gray-500 animate-pulse">Calculating price...</span>
            ) : isSubscriber ? (
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-500 line-through">
                  {cmsDisplayPricePaise ? formatInrFromPaise(cmsDisplayPricePaise) : ""}
                </span>
                <span className="text-lg font-semibold text-gold">
                  {pricing ? formatInrFromPaise(pricing.finalAmount) : ""}
                </span>
              </div>
            ) : (
              <span className="text-lg font-semibold text-white">
                {pricing ? formatInrFromPaise(pricing.baseAmount) : (cmsDisplayPricePaise ? formatInrFromPaise(cmsDisplayPricePaise) : "Not configured")}
              </span>
            )}
            {isSubscriber && !isPricingLoading && (
              <span className="text-[10px] uppercase tracking-wider text-gold font-semibold bg-gold/10 px-2.5 py-0.5 rounded-full border border-gold/20">
                Subscriber Discount
              </span>
            )}
          </div>
        </div>

        {pricing && (
          <>
            {pricing.discountAmount > 0 && (
              <div className="flex items-center justify-between gap-4 text-sm text-emerald-300">
                <span>Discount ({pricing.couponCode})</span>
                <span>-{formatInrFromPaise(pricing.discountAmount)}</span>
              </div>
            )}
            <div className="flex items-center justify-between gap-4 border-t border-white/10 pt-3 text-base font-semibold text-white">
              <span>Payable now</span>
              <span className={isSubscriber ? "text-gold" : ""}>{formatInrFromPaise(pricing.finalAmount)}</span>
            </div>
          </>
        )}
      </div>

      <div className="mt-6 grid gap-3 md:grid-cols-[1fr_auto]">
        <input
          type="text"
          placeholder={isSubscriber ? "Coupons disabled for subscribers" : "Coupon code"}
          value={couponInput}
          onChange={(e) => setCouponInput(e.target.value.toUpperCase())}
          className="h-12 rounded-xl border border-white/15 bg-black/20 px-4 text-sm text-white outline-none transition focus:border-gold disabled:opacity-40 disabled:cursor-not-allowed"
          autoComplete="off"
          maxLength={32}
          disabled={isApplyingCoupon || isCreatingOrder || isSubscriber || isPricingLoading}
        />
        <Button
          type="button"
          onClick={applyCoupon}
          disabled={isApplyingCoupon || isCreatingOrder || couponInput.trim().length === 0 || !isRegistrationOpen || isSubscriber || isPricingLoading}
          className="h-12 rounded-xl bg-white/10 text-white hover:bg-white/20 disabled:cursor-not-allowed"
        >
          {isApplyingCoupon ? "Validating..." : "Apply"}
        </Button>
      </div>

      {isSubscriber && !isPricingLoading && (
        <p className="mt-2 text-xs text-gold/80 italic font-medium">
          ★ Subscriber discount applied automatically. Coupon codes cannot be combined with subscriber pricing.
        </p>
      )}

      {error && <p className="mt-3 text-sm text-red-300">{error}</p>}
      {success && <p className="mt-3 text-sm text-emerald-300">{success}</p>}

      <Button
        type="button"
        onClick={startPayment}
        disabled={isCreatingOrder || !isRegistrationOpen}
        className="mt-6 h-14 w-full text-base font-bold bg-gradient-to-r from-[#FFC72C] via-[#E6B422] to-[#C89B3C] text-[#0b0b0c] hover:shadow-[0_14px_35px_rgba(255,199,44,0.35)] hover:-translate-y-0.5 border-none transition-all duration-300"
      >
        {isCreatingOrder
          ? "Preparing secure checkout..."
          : status === "authenticated"
            ? "Pay Securely"
            : "Login to Pay"}
      </Button>

      {status !== "authenticated" && (
        <a
          href="#fast-checkout"
          className="mt-3 block text-center text-sm font-medium text-gold transition hover:text-white"
        >
          Skip login and use fast checkout
        </a>
      )}

      {!isRegistrationOpen && (
        <p className="mt-3 text-sm text-gray-500">Registration is closed for this event.</p>
      )}

      <div id="fast-checkout" className="mt-8 border-t border-white/10 pt-6">
        <div className="mb-4">
          <p className="text-xs uppercase tracking-[0.18em] text-gray-400">Fast Checkout</p>
          <h4 className="mt-1 text-lg font-semibold text-white">Pay without logging in</h4>
          <p className="mt-1 text-sm text-gray-400">
            Enter your details and we will capture your registration in admin after payment.
          </p>
        </div>

        <div className="grid gap-3">
          <input
            type="text"
            placeholder="Full name"
            value={guestCheckout.name}
            onChange={(e) => updateGuestCheckout("name", e.target.value)}
            className="h-12 rounded-xl border border-white/15 bg-black/20 px-4 text-sm text-white outline-none transition focus:border-gold"
            autoComplete="name"
            maxLength={120}
            disabled={isCreatingGuestOrder || isCreatingOrder}
          />
          <input
            type="email"
            placeholder="Email address"
            value={guestCheckout.email}
            onChange={(e) => updateGuestCheckout("email", e.target.value)}
            className="h-12 rounded-xl border border-white/15 bg-black/20 px-4 text-sm text-white outline-none transition focus:border-gold"
            autoComplete="email"
            maxLength={254}
            disabled={isCreatingGuestOrder || isCreatingOrder}
          />
          <input
            type="tel"
            placeholder="Mobile number"
            value={guestCheckout.phone}
            onChange={(e) => updateGuestCheckout("phone", e.target.value)}
            className="h-12 rounded-xl border border-white/15 bg-black/20 px-4 text-sm text-white outline-none transition focus:border-gold"
            autoComplete="tel"
            maxLength={32}
            disabled={isCreatingGuestOrder || isCreatingOrder}
          />
        </div>

        <Button
          type="button"
          onClick={startGuestPayment}
          disabled={isCreatingGuestOrder || isCreatingOrder || !isRegistrationOpen}
          className="mt-4 h-12 w-full rounded-xl bg-white text-[#0b0b0c] hover:bg-white/90"
        >
          {isCreatingGuestOrder ? "Preparing fast checkout..." : "Fast Checkout Without Login"}
        </Button>
      </div>
    </div>
  )
}
