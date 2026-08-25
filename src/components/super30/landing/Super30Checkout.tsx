"use client"

// The right-hand column of the register panel: fee, program facts, coupon,
// Razorpay checkout (logged-in + guest). The payment flow is identical to
// EventCheckoutCard — same endpoints, same payloads, same verification and
// thank-you redirect — only the presentation follows the Super30 design
// language (flat, hairlines, mono labels, green CTA).

import { Super30Program } from "@/lib/types"
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
        maximumFractionDigits: amountPaise % 100 === 0 ? 0 : 2,
    }).format(amountPaise / 100)
}

const SERIF = "var(--font-s30-serif), var(--font-cormorant), var(--font-display), 'Cormorant Garamond', Georgia, serif"
const SANS = "var(--font-geist-sans), var(--font-sans), system-ui, -apple-system, sans-serif"
const MONO = "var(--font-s30-mono), var(--font-jetbrains), var(--font-geist-mono), var(--font-mono-code), monospace"

const labelStyle: React.CSSProperties = {
    fontFamily: MONO,
    fontWeight: 500,
    fontSize: 12,
    lineHeight: 1,
    letterSpacing: ".14em",
    textTransform: "uppercase",
    color: "#C5BFB5",
    margin: 0,
}

const rowStyle: React.CSSProperties = {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "baseline",
    gap: 16,
    padding: "20px 0",
    borderTop: "1px solid rgba(244,241,234,.14)",
}

const rowValueStyle: React.CSSProperties = {
    fontFamily: SERIF,
    fontWeight: 400,
    fontSize: 26,
    lineHeight: 1,
    color: "#F4F1EA",
}

const inputStyle: React.CSSProperties = {
    fontFamily: MONO,
    fontSize: 13,
    letterSpacing: ".04em",
    height: 48,
    width: "100%",
    padding: "0 14px",
    background: "rgba(244,241,234,.04)",
    border: "1px solid rgba(244,241,234,.18)",
    borderRadius: 0,
    color: "#F4F1EA",
    outline: "none",
}

interface Super30CheckoutProps {
    program: Super30Program
    registrationOpen: boolean
    seats: number
    showSeats?: boolean
}

export function Super30Checkout({ program, registrationOpen, seats, showSeats = true }: Super30CheckoutProps) {
    const { data: session, status } = useSession()
    const router = useRouter()

    const cmsDisplayPricePaise = useMemo(() => {
        if (typeof program.price !== "number" || !Number.isFinite(program.price)) return null
        const rounded = Math.round(program.price * 100)
        return rounded > 0 ? rounded : null
    }, [program.price])

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
    const [guestCheckout, setGuestCheckout] = useState({ name: "", email: "", phone: "" })
    const [error, setError] = useState<string | null>(null)
    const [success, setSuccess] = useState<string | null>(null)
    const [isPricingLoading, setIsPricingLoading] = useState(false)

    const eventDateForThankYou = program.applicationDeadline || new Date(Date.now() + 86400000 * 365).toISOString()

    useEffect(() => {
        if (status === "loading") {
            setIsPricingLoading(true)
            return
        }

        if (status === "authenticated" && program.eventId) {
            setIsPricingLoading(true)
            const fetchInitialPricing = async () => {
                try {
                    const response = await fetch("/api/validate-coupon", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ eventId: program.eventId, couponCode: null }),
                    })
                    const payload = await response.json()
                    if (response.ok && payload.success) {
                        setPricing({
                            baseAmount: payload.data.baseAmount,
                            discountAmount: payload.data.discountAmount,
                            finalAmount: payload.data.finalAmount,
                            couponCode: payload.data.coupon?.code ?? null,
                        })
                    }
                } catch (e) {
                    console.error("Failed to fetch initial pricing preview", e)
                } finally {
                    setIsPricingLoading(false)
                }
            }
            fetchInitialPricing()
        } else {
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
    }, [status, program.eventId, cmsDisplayPricePaise])

    const navigateToLogin = () => {
        const callbackUrl = `/super30/${program.slug.current}`
        router.push(`/login?callbackUrl=${encodeURIComponent(callbackUrl)}`)
    }

    const applyCoupon = async () => {
        setError(null)
        setSuccess(null)

        if (!program.eventId) {
            setError("Payment configuration is missing")
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
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    eventId: program.eventId,
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
                    ? { ...current, discountAmount: 0, finalAmount: current.baseAmount, couponCode: null }
                    : current
            )
        } finally {
            setIsApplyingCoupon(false)
        }
    }

    const openRazorpay = async (orderData: {
        razorpayKeyId: string
        amount: number
        currency: string
        orderId: string
        eventId: string
        couponCode: string | null
    }, options: {
        prefill: { name?: string; email?: string; contact?: string }
        verifyUrl: string
        fallbackEmail: string
        guest: boolean
    }) => {
        const scriptReady = await loadRazorpayCheckoutScript()
        if (!scriptReady || !window.Razorpay) {
            throw new Error("Unable to load Razorpay checkout")
        }

        const notes: Record<string, string> = {
            eventId: orderData.eventId,
            couponCode: orderData.couponCode ?? "",
        }
        if (options.guest) notes.checkoutMode = "guest"

        const checkout = new window.Razorpay({
            key: orderData.razorpayKeyId,
            amount: orderData.amount,
            currency: orderData.currency,
            name: "First Principles Investing",
            description: program.title,
            order_id: orderData.orderId,
            notes,
            prefill: options.prefill,
            modal: {
                ondismiss: () => {
                    setError("Checkout was closed before completion")
                },
            },
            handler: async (checkoutResponse) => {
                try {
                    const verifyResponse = await fetch(options.verifyUrl, {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
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
                        eventTitle: program.title,
                        eventDate: eventDateForThankYou,
                        email: verifyPayload.data?.email || options.fallbackEmail,
                        whatsappLink: verifyPayload.data?.whatsappLink || "",
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
    }

    const startPayment = async () => {
        setError(null)
        setSuccess(null)

        if (!registrationOpen) {
            setError("Registration is closed for this batch")
            return
        }

        if (!program.eventId) {
            setError("Payment configuration is missing")
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
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    eventId: program.eventId,
                    couponCode: pricing?.couponCode ?? null,
                }),
            })

            const orderPayload = await orderResponse.json()
            if (!orderResponse.ok || !orderPayload.success) {
                throw new Error(orderPayload.message ?? "Failed to create order")
            }

            await openRazorpay(orderPayload.data, {
                prefill: {
                    name: session.user.name ?? undefined,
                    email: session.user.email ?? undefined,
                },
                verifyUrl: "/api/verify-payment",
                fallbackEmail: session.user.email ?? "",
                guest: false,
            })
        } catch (checkoutError) {
            setError(checkoutError instanceof Error ? checkoutError.message : "Unable to complete checkout")
        } finally {
            setIsCreatingOrder(false)
        }
    }

    const startGuestPayment = async () => {
        setError(null)
        setSuccess(null)

        if (!registrationOpen) {
            setError("Registration is closed for this batch")
            return
        }

        if (!program.eventId) {
            setError("Payment configuration is missing")
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
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    name,
                    email,
                    phone,
                    eventId: program.eventId,
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

            await openRazorpay(orderPayload.data, {
                prefill: { name, email, contact: phone },
                verifyUrl: "/api/guest-checkout/verify-payment",
                fallbackEmail: email,
                guest: true,
            })
        } catch (checkoutError) {
            setError(checkoutError instanceof Error ? checkoutError.message : "Unable to complete checkout")
        } finally {
            setIsCreatingGuestOrder(false)
        }
    }

    if (!program.eventId) {
        return (
            <div style={{ border: "1px solid rgba(169,59,50,.5)", padding: 24 }}>
                <p style={{ fontFamily: SANS, fontWeight: 300, fontSize: 14, lineHeight: 1.6, color: "#E4A9A3", margin: 0 }}>
                    This program is missing its eventId configuration. Contact support before taking payments.
                </p>
            </div>
        )
    }

    const busy = isCreatingOrder || isCreatingGuestOrder

    return (
        <div>
            <p style={{ ...labelStyle, marginBottom: 12 }}>Fee, all inclusive</p>
            <p
                style={{
                    fontFamily: SERIF,
                    fontWeight: 400,
                    fontSize: "clamp(58px,7vw,88px)",
                    lineHeight: 1,
                    margin: "0 0 32px",
                    color: "var(--go)",
                }}
            >
                {isPricingLoading ? "…" : pricing ? formatInrFromPaise(pricing.baseAmount) : cmsDisplayPricePaise ? formatInrFromPaise(cmsDisplayPricePaise) : "—"}
            </p>

            <div style={rowStyle}>
                <span style={labelStyle}>Format</span>
                <span style={rowValueStyle}>Live, online</span>
            </div>
            <div style={rowStyle}>
                <span style={labelStyle}>Duration</span>
                <span style={rowValueStyle}>16 hours</span>
            </div>
            <div style={rowStyle}>
                <span style={labelStyle}>Cohort</span>
                <span style={rowValueStyle}>{seats} seats</span>
            </div>

            {pricing && pricing.discountAmount > 0 && (
                <>
                    <div style={rowStyle}>
                        <span style={labelStyle}>Discount{pricing.couponCode ? ` · ${pricing.couponCode}` : ""}</span>
                        <span style={{ ...rowValueStyle, color: "var(--go)" }}>−{formatInrFromPaise(pricing.discountAmount)}</span>
                    </div>
                    <div style={rowStyle}>
                        <span style={labelStyle}>Payable now</span>
                        <span style={{ ...rowValueStyle, color: "var(--go)" }}>{formatInrFromPaise(pricing.finalAmount)}</span>
                    </div>
                </>
            )}

            {registrationOpen && (
                <div style={{ display: "grid", gridTemplateColumns: "1fr auto", gap: 10, marginTop: 28 }}>
                    <input
                        type="text"
                        placeholder="COUPON CODE"
                        value={couponInput}
                        onChange={(e) => setCouponInput(e.target.value.toUpperCase())}
                        style={inputStyle}
                        autoComplete="off"
                        maxLength={32}
                        disabled={isApplyingCoupon || busy || isPricingLoading}
                        aria-label="Coupon code"
                    />
                    <button
                        type="button"
                        onClick={applyCoupon}
                        disabled={isApplyingCoupon || busy || couponInput.trim().length === 0 || isPricingLoading || status !== "authenticated"}
                        className="s30l-btn-outline"
                        style={{ height: 48, padding: "0 20px" }}
                        title={status !== "authenticated" ? "Log in to validate a coupon, or enter it here — it is applied at fast checkout" : undefined}
                    >
                        {isApplyingCoupon ? "Checking…" : "Apply"}
                    </button>
                </div>
            )}

            {error && (
                <p style={{ fontFamily: SANS, fontWeight: 300, fontSize: 14, lineHeight: 1.6, color: "#E4A9A3", margin: "14px 0 0" }}>{error}</p>
            )}
            {success && (
                <p style={{ fontFamily: SANS, fontWeight: 300, fontSize: 14, lineHeight: 1.6, color: "var(--go)", margin: "14px 0 0" }}>{success}</p>
            )}

            <button
                type="button"
                onClick={startPayment}
                disabled={busy || !registrationOpen}
                className="s30l-btn-register"
                style={{ margin: "28px 0 18px" }}
            >
                {!registrationOpen
                    ? "Registration closed"
                    : isCreatingOrder
                      ? "Preparing secure checkout…"
                      : status === "authenticated"
                        ? "Register for Super30 →"
                        : "Login to register →"}
            </button>

            {showSeats && (
                <p style={{ fontFamily: SANS, fontWeight: 400, fontSize: 13, lineHeight: 1.5, color: "rgba(244,241,234,.55)", margin: 0, textAlign: "center" }}>
                    {seats === 30 ? "Thirty" : seats} participants per batch. No repeats, no recordings sold later.
                </p>
            )}

            {registrationOpen && status !== "authenticated" && (
                <div style={{ marginTop: 36, borderTop: "1px solid rgba(244,241,234,.14)", paddingTop: 28 }}>
                    <p style={{ ...labelStyle, marginBottom: 8 }}>Fast checkout</p>
                    <p style={{ fontFamily: SANS, fontWeight: 300, fontSize: 14, lineHeight: 1.6, color: "rgba(244,241,234,.6)", margin: "0 0 18px" }}>
                        Pay without logging in — enter your details and we will capture your registration after payment.
                    </p>
                    <div style={{ display: "grid", gap: 10 }}>
                        <input
                            type="text"
                            placeholder="FULL NAME"
                            value={guestCheckout.name}
                            onChange={(e) => setGuestCheckout((c) => ({ ...c, name: e.target.value }))}
                            style={inputStyle}
                            autoComplete="name"
                            maxLength={120}
                            disabled={busy}
                            aria-label="Full name"
                        />
                        <input
                            type="email"
                            placeholder="EMAIL ADDRESS"
                            value={guestCheckout.email}
                            onChange={(e) => setGuestCheckout((c) => ({ ...c, email: e.target.value }))}
                            style={inputStyle}
                            autoComplete="email"
                            maxLength={254}
                            disabled={busy}
                            aria-label="Email address"
                        />
                        <input
                            type="tel"
                            placeholder="MOBILE NUMBER"
                            value={guestCheckout.phone}
                            onChange={(e) => setGuestCheckout((c) => ({ ...c, phone: e.target.value }))}
                            style={inputStyle}
                            autoComplete="tel"
                            maxLength={32}
                            disabled={busy}
                            aria-label="Mobile number"
                        />
                    </div>
                    <button
                        type="button"
                        onClick={startGuestPayment}
                        disabled={busy || !registrationOpen}
                        className="s30l-btn-outline"
                        style={{ marginTop: 14, width: "100%", height: 52 }}
                    >
                        {isCreatingGuestOrder ? "Preparing fast checkout…" : "Fast checkout without login"}
                    </button>
                </div>
            )}
        </div>
    )
}
