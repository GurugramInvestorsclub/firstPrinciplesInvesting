/**
 * Central Analytics Events Definition
 * Strictly typed PostHog events for First Principles Investing.
 * 
 * SENSITIVITY NOTICE:
 * Under NO circumstances should passwords, card details, UPI IDs, banking info,
 * raw contact form contents, or Razorpay secrets be passed into any event payload.
 */

export interface PageViewProperties {
    path: string
    referrer?: string
    landing_page?: string
    utm_source?: string | null
    utm_medium?: string | null
    utm_campaign?: string | null
    utm_content?: string | null
    utm_term?: string | null
}

export interface ArticleViewedProperties {
    article_id: string
    article_title: string
    article_category?: string
    content_type: "insight" | "memo" | "report"
    is_premium: boolean
}

export interface ArticleCompletedProperties {
    article_id: string
    article_title: string
    content_type?: string
    scroll_depth?: number
    read_time_seconds?: number
}

export interface ContentDownloadedProperties {
    content_id: string
    content_type: string
}

export interface SignupStartedProperties {
    method?: "credentials" | "google" | "other"
}

export interface SignupCompletedProperties {
    signup_method: "credentials" | "google" | "other"
    user_type?: "free" | "subscriber" | "attendee"
}

export interface LoginCompletedProperties {
    method: "credentials" | "google"
    user_type?: "free" | "subscriber" | "attendee" | "admin"
}

export interface LogoutProperties {
    [key: string]: unknown
}

export interface WebinarViewedProperties {
    webinar_id: string
    webinar_name: string
    price?: number
    currency?: string
}

export interface WebinarRegistrationStartedProperties {
    webinar_id: string
    webinar_name: string
}

export interface WebinarCheckoutStartedProperties {
    webinar_id: string
    webinar_name: string
    amount: number
    currency: string
    coupon_applied?: boolean
}

export interface WebinarRegisteredProperties {
    webinar_id: string
    webinar_name: string
    amount?: number
    currency?: string
}

export interface WebinarPaymentSuccessProperties {
    webinar_id: string
    webinar_name: string
    amount: number
    currency: string
    order_id?: string | null
    payment_id?: string | null
    payment_provider: "razorpay"
}

export interface WebinarPaymentFailedProperties {
    webinar_id: string
    webinar_name?: string
    reason?: string
}

export interface ProductViewedProperties {
    product_id: string
    product_name: string
    plan?: string
    amount?: number
    currency?: string
}

export interface SubscriptionStartedProperties {
    plan: "three_monthly" | "yearly" | string
    billing_period: string
}

export interface CheckoutStartedProperties {
    product_id: string
    product_name: string
    plan: string
    amount: number
    currency: string
    billing_period?: string
}

export interface PaymentSuccessProperties {
    product_id: string
    product_name: string
    plan?: string
    amount: number
    currency: string
    order_id?: string | null
    payment_id?: string | null
    subscription_id?: string | null
    payment_provider: "razorpay"
}

export interface PaymentFailedProperties {
    product_id?: string
    plan?: string
    reason?: string
    payment_provider?: "razorpay"
}

export interface SubscriptionCancelledProperties {
    plan?: string
    reason?: string
}

export interface SubscriptionRenewedProperties {
    plan: string
    amount: number
    currency: string
    payment_provider: "razorpay"
}

export interface ContactFormStartedProperties {
    form_type: "contact"
}

export interface ContactFormSubmittedProperties {
    form_type: "contact"
}

export interface NewsletterSubscribedProperties {
    form_type: "newsletter"
}

/**
 * Event Name to Properties Mapping
 */
export interface EventMap {
    page_view: PageViewProperties
    article_viewed: ArticleViewedProperties
    article_completed: ArticleCompletedProperties
    content_downloaded: ContentDownloadedProperties
    signup_started: SignupStartedProperties
    signup_completed: SignupCompletedProperties
    login_completed: LoginCompletedProperties
    logout: LogoutProperties
    webinar_viewed: WebinarViewedProperties
    webinar_registration_started: WebinarRegistrationStartedProperties
    webinar_checkout_started: WebinarCheckoutStartedProperties
    webinar_registered: WebinarRegisteredProperties
    webinar_payment_success: WebinarPaymentSuccessProperties
    webinar_payment_failed: WebinarPaymentFailedProperties
    product_viewed: ProductViewedProperties
    subscription_started: SubscriptionStartedProperties
    checkout_started: CheckoutStartedProperties
    payment_success: PaymentSuccessProperties
    payment_failed: PaymentFailedProperties
    subscription_cancelled: SubscriptionCancelledProperties
    subscription_renewed: SubscriptionRenewedProperties
    contact_form_started: ContactFormStartedProperties
    contact_form_submitted: ContactFormSubmittedProperties
    newsletter_subscribed: NewsletterSubscribedProperties
}

export type AnalyticsEvent = keyof EventMap

export interface UserTraits {
    account_type?: "free" | "subscriber" | "attendee" | "admin"
    subscription_status?: string
    plan?: string
    created_at?: string
    [key: string]: unknown
}
