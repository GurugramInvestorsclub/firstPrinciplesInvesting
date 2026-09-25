"use client"

import { useState, useCallback } from "react"
import { useRouter } from "next/navigation"
import { CreditCard, Loader2, AlertCircle, CheckCircle } from "lucide-react"

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

interface RenewSubscriptionButtonProps {
    userName?: string
    userEmail?: string
    userPhone?: string
    className?: string
    buttonText?: string
}

export function RenewSubscriptionButton({
    userName,
    userEmail,
    userPhone,
    className,
    buttonText = "Renew Subscription (₹2,100 / Qtr)",
}: RenewSubscriptionButtonProps) {
    const router = useRouter()
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [success, setSuccess] = useState(false)

    const handleRenew = useCallback(async () => {
        setIsLoading(true)
        setError(null)

        try {
            const createResponse = await fetch("/api/subscriptions/create", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    plan: "three_monthly",
                    couponCode: null,
                    phone: userPhone?.trim() || null,
                }),
            })

            const createPayload = await createResponse.json()
            if (!createResponse.ok || !createPayload.success) {
                if (createResponse.status === 401) {
                    router.push(`/login?callbackUrl=${encodeURIComponent("/dashboard")}`)
                    return
                }
                throw new Error(createPayload.message ?? "Unable to initiate renewal subscription")
            }

            const scriptReady = await loadRazorpayCheckoutScript()
            const RazorpayConstructor = (window as unknown as {
                Razorpay?: RazorpaySubscriptionCheckoutConstructor
            }).Razorpay

            if (!scriptReady || !RazorpayConstructor) {
                throw new Error("Unable to load Razorpay checkout script. Please disable ad-blockers and try again.")
            }

            const checkout = new RazorpayConstructor({
                key: createPayload.data.razorpayKeyId,
                subscription_id: createPayload.data.subscriptionId,
                name: "First Principles Investing",
                description: "Insights Quarterly Renewal (₹2,100)",
                recurring: true,
                prefill: {
                    name: userName ?? undefined,
                    email: userEmail ?? undefined,
                    contact: userPhone ?? createPayload.data?.userPhone ?? undefined,
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
                            throw new Error(verifyPayload.message ?? "Subscription payment verification failed")
                        }

                        setSuccess(true)
                        setIsLoading(false)
                        // Reload page to reflect updated active subscription
                        setTimeout(() => {
                            window.location.reload()
                        }, 1200)
                    } catch (verifyErr) {
                        setIsLoading(false)
                        setError(verifyErr instanceof Error ? verifyErr.message : "Failed to verify renewal payment")
                    }
                },
            })

            checkout.open()
        } catch (err) {
            setIsLoading(false)
            setError(err instanceof Error ? err.message : "Something went wrong while initiating renewal")
        }
    }, [userName, userEmail, router])

    if (success) {
        return (
            <div className="inline-flex items-center gap-2 px-4 py-2.5 bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 font-mono text-xs font-bold rounded-xl">
                <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Renewal Successful! Updating...</span>
            </div>
        )
    }

    return (
        <div className="flex flex-col items-start gap-1.5 w-full md:w-auto">
            <button
                type="button"
                onClick={handleRenew}
                disabled={isLoading}
                className={
                    className ??
                    "w-full md:w-auto inline-flex items-center justify-center gap-2 bg-gradient-to-r from-amber-400 via-amber-300 to-yellow-500 hover:from-amber-300 hover:to-yellow-400 disabled:opacity-60 text-black font-bold font-mono text-xs uppercase tracking-wider px-5 py-3 rounded-xl shadow-[0_4px_16px_rgba(245,158,11,0.3)] transition-all transform hover:-translate-y-0.5 active:translate-y-0 cursor-pointer disabled:cursor-not-allowed"
                }
            >
                {isLoading ? (
                    <>
                        <Loader2 className="w-4 h-4 animate-spin text-black" />
                        <span>Opening Razorpay...</span>
                    </>
                ) : (
                    <>
                        <CreditCard className="w-4 h-4 text-black" />
                        <span>{buttonText}</span>
                    </>
                )}
            </button>

            {error && (
                <div className="flex items-center gap-1.5 text-red-400 text-[11px] font-mono mt-1">
                    <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                    <span>{error}</span>
                </div>
            )}
        </div>
    )
}
