"use client"

import { useCallback, useState } from "react"
import { useRouter } from "next/navigation"
import { useSession } from "next-auth/react"
import { AlertCircle, Check, CheckCircle, ShieldCheck, Zap } from "lucide-react"

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

export function PricingSection() {
    const router = useRouter()
    const { data: session, status: sessionStatus } = useSession()
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [success, setSuccess] = useState<string | null>(null)

    const pricingFeatures = [
        "2 Premium Research Reports every month (PDF)",
        "Monthly Live Member Meetups & Case Studies",
        "Complete Historical Research Archive Access",
        "50% discount on live sectoral webinars",
        "Direct Q&A thread with our analyst team",
        "Valuation models (Excel / Google Sheets)"
    ]

    const handleCheckout = useCallback(async () => {
        setError(null)
        setSuccess(null)

        if (sessionStatus === "unauthenticated") {
            router.push(`/login?callbackUrl=${encodeURIComponent("/membership")}`)
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
                    plan: "three_monthly",
                    couponCode: null,
                }),
            })

            const createPayload = await createResponse.json()
            if (!createResponse.ok || !createPayload.success) {
                if (createResponse.status === 401) {
                    router.push(`/login?callbackUrl=${encodeURIComponent("/membership")}`)
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
                    name: session?.user?.name ?? undefined,
                    email: session?.user?.email ?? undefined,
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
    }, [session, sessionStatus, router])

    return (
        <section id="pricing" className="py-24 md:py-32 bg-bg-deep relative overflow-hidden">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gold/5 rounded-full blur-[150px] pointer-events-none" />

            {/* Golden Brand Loading Overlay */}
            {isSubmitting && (
                <div className="fixed inset-0 bg-[#0C0C0E]/80 backdrop-blur-sm z-[9999] flex flex-col items-center justify-center gap-4 transition-all duration-300">
                    <div className="relative flex items-center justify-center">
                        <div className="absolute w-20 h-20 bg-gold/10 rounded-full blur-xl animate-pulse" />
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

            <div className="container max-w-7xl px-6 mx-auto relative z-10">

                {/* Header */}
                <div className="max-w-3xl mx-auto text-center mb-16 md:mb-20">
                    <span className="text-gold font-mono uppercase tracking-[0.2em] text-[10px] bg-gold/10 px-3 py-1 rounded-full">
                        Membership Pricing
                    </span>
                    <h2 className="text-3xl md:text-5xl font-bold tracking-tight text-text-primary mt-4 leading-tight">
                        One Plan. Complete Access.
                    </h2>
                    <p className="text-neutral-400 mt-4 text-lg font-light max-w-2xl mx-auto">
                        No tiered pricing plans. No upsells. Get access to our entire institutional workspace and compound your conviction.
                    </p>
                </div>

                {/* Pricing Box - Premium Double Bezel */}
                <div className="max-w-2xl mx-auto p-2 rounded-[2.5rem] bg-white/5 border border-white/10 backdrop-blur shadow-2xl">
                    <div className="rounded-[2.2rem] bg-bg-deep border border-[#2E2E2E] p-8 md:p-12 space-y-8 relative overflow-hidden">

                        {/* Gold Badge */}
                        <div className="absolute top-6 right-6 font-mono text-[9px] text-gold bg-gold/10 border border-gold/30 px-3 py-1 rounded-full font-bold uppercase tracking-wider flex items-center gap-1.5">
                            <Zap className="w-3 h-3 text-gold" />
                            <span>ALL ACCESSPASS</span>
                        </div>

                        {/* Price Details */}
                        <div className="space-y-3">
                            <span className="text-xs font-mono text-neutral-500 uppercase tracking-widest">
                                3 MONTH MEMBERSHIP
                            </span>
                            <div className="flex items-baseline gap-2">
                                <span className="text-4xl md:text-5xl font-bold text-text-primary font-sans">
                                    ₹2,100
                                </span>
                                <span className="text-neutral-500 font-mono text-xs">/ 3 MONTHS</span>
                            </div>
                            <div className="text-xs font-mono text-gold font-semibold">
                                Equivalent to less than ₹24/day
                            </div>
                        </div>

                        {/* Value Statement */}
                        <div className="p-4 rounded-2xl bg-white/5 border border-white/5 text-xs text-neutral-400 font-light leading-relaxed">
                            <span className="text-text-primary font-medium">Value Frame:</span> One single correct investment decision pays back a decade of subscription. One bad corporate governance trap avoided is worth lakhs.
                        </div>

                        {/* Feature List */}
                        <div className="space-y-4 pt-4 border-t border-[#2E2E2E]">
                            <span className="text-[10px] font-mono text-neutral-500 uppercase tracking-wider block">
                                WHAT IS INCLUDED:
                            </span>
                            <ul className="grid md:grid-cols-2 gap-4">
                                {pricingFeatures.map((feat, idx) => (
                                    <li key={idx} className="flex items-start gap-2.5 text-xs text-neutral-300 font-light leading-relaxed">
                                        <Check className="w-3.5 h-3.5 text-gold shrink-0 mt-0.5" />
                                        <span>{feat}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>

                        {/* Checkout CTA */}
                        <div className="pt-8 border-t border-[#2E2E2E] space-y-4">
                            <button
                                onClick={handleCheckout}
                                disabled={isSubmitting}
                                className="w-full relative flex items-center justify-center bg-gold hover:bg-[#E0A800] text-bg-deep font-extrabold py-4 rounded-full transition-all duration-300 active:scale-[0.98] shadow-lg shadow-gold/10 cursor-pointer disabled:opacity-50 disabled:pointer-events-none"
                            >
                                <span>Subscribe & Start Reading</span>
                            </button>

                            {/* Secure Indicator */}
                            <div className="flex items-center justify-center gap-2 text-[10px] font-mono text-neutral-500">
                                <ShieldCheck className="w-4 h-4 text-neutral-600" />
                                <span>SECURE CHECKOUT · INSTANT ACCESS · 14-DAY REFUND POLICY</span>
                            </div>
                        </div>

                    </div>
                </div>

            </div>
        </section>
    )
}
