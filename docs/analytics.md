# PostHog Analytics & Admin Analytics Dashboard Documentation

This document describes the design, architecture, setup, event taxonomy, security practices, and usage instructions for the PostHog analytics and admin reporting system implemented in First Principles Investing.

---

## 1. Overview & Architecture

The application uses an enterprise-grade dual-tier analytics implementation:
1. **Client-Side SDK (`posthog-js`)**: Handles real-time pageviews, UTM attribution, user identification across session lifecycles, and user interaction funnels (article reads, checkout openings, registrations).
2. **Server-Side SDK (`posthog-node`)**: Handles authoritative business events where financial veracity is essential (verified Razorpay payments, webhook events, subscription renewals, cancellations).
3. **HogQL Analytics API**: Powers the Admin Analytics Dashboard at `/admin/analytics` by querying raw event data directly from PostHog's data warehouse with automated fallback to the local PostgreSQL database (Prisma) when keys are pending or missing.

```
                      ┌────────────────────────────────────────┐
                      │              Browser                   │
                      │  (posthog-js + Route Tracker + Events) │
                      └───────────────────┬────────────────────┘
                                          │
                    Safe Client Events    │
                     (Sanitized Props)    │
                                          ▼
┌───────────────────────┐         ┌───────────────┐         ┌────────────────────────┐
│  Server Webhooks      │         │               │         │  Admin Dashboard       │
│  (Razorpay Signature  ├────────►│  PostHog Cloud│◄────────┤  (/admin/analytics)    │
│   Verified Events)    │         │  Data Engine  │         │  HogQL Query Layer     │
└───────────────────────┘         └───────────────┘         └────────────────────────┘
                                                                        ▲
                                                               Fallback │
                                                            Authoritative Prisma DB
```

---

## 2. Environment Variables & Setup

Add the following variables to your `.env.local` or production deployment environment:

```env
# ==============================================================================
# PostHog Analytics
# ==============================================================================

# Client-Side / Public Keys (Safe in browser bundle)
# Found in PostHog: Project Settings -> Project Variables -> Project API Key
NEXT_PUBLIC_POSTHOG_KEY=phc_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx

# PostHog Ingestion Host (Default US cloud; use https://eu.i.posthog.com for EU cloud)
NEXT_PUBLIC_POSTHOG_HOST=https://us.i.posthog.com

# Server-Side / Secret Keys (NEVER expose to browser bundles)
# Required for Admin Analytics Dashboard HogQL queries
# Found in PostHog: Project Settings -> General -> Project ID (numeric integer)
POSTHOG_PROJECT_ID=123456

# Personal API Key with Project "Read" permission
# Found in PostHog: User Settings -> Personal API Keys (starts with phx_)
POSTHOG_PERSONAL_API_KEY=phx_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

### Content Security Policy (CSP)
PostHog ingestion endpoints are whitelisted in `next.config.ts`:
- `script-src`: `'self'`, `'unsafe-inline'`, `'unsafe-eval'`, `https://us.i.posthog.com`, `https://eu.i.posthog.com`, `https://*.posthog.com`
- `connect-src`: `'self'`, `https://us.i.posthog.com`, `https://eu.i.posthog.com`, `https://*.posthog.com`
- `img-src`: `'self'`, `data:`, `blob:`, `https://us.i.posthog.com`, `https://eu.i.posthog.com`, `https://*.posthog.com`

---

## 3. Strict Privacy & Security Protections

To protect user confidentiality and comply with financial data security regulations:

1. **Automated Property Sanitizer**:
   Every event payload passes through `src/lib/analytics/client.ts` which automatically strips forbidden keys matching:
   - `password`, `secret`, `token`, `key`, `authorization`, `cookie`
   - `card`, `cvv`, `cvc`, `expiry`, `pan`, `account`, `upi`, `bank`, `vpa`
   - Form inputs and text fields
2. **Session Recording Masking**:
   `maskAllInputs: true` is configured in `posthog.init()`. User keystrokes, password fields, card numbers, and contact forms are masked before transmission.
3. **Contact & Newsletter Forms**:
   Only submission status (`success`, `failed`) and form category (`contact`, `newsletter`) are tracked. The user's message body and sensitive input are never logged.
4. **Payment Confirmation Isolation**:
   No payment is marked as verified or successful based on client-side code alone. Financial conversions are authoritative via Razorpay webhook HMAC signature verification on the server.

---

## 4. Event Taxonomy

All events are strictly typed in `src/lib/analytics/events.ts`.

### Acquisition & Navigation
| Event Name | Trigger | Key Properties |
| :--- | :--- | :--- |
| `$pageview` | Route change (debounced, deduplicated) | `path`, `title`, `referrer`, `search`, UTM parameters (`utm_source`, `utm_medium`, `utm_campaign`) |

### Identity & Authentication
| Event Name | Trigger | Key Properties |
| :--- | :--- | :--- |
| `signup_started` | User visits signup or clicks register | `source` |
| `signup_completed` | User successfully creates account | `method` (`credentials`, `google`), `hasName` |
| `login_completed` | User successfully signs in | `method` (`credentials`, `google`) |
| `logout` | User logs out | `userId` |

### Content & Engagement
| Event Name | Trigger | Key Properties |
| :--- | :--- | :--- |
| `article_viewed` | Insight article page load | `article_id`, `article_title`, `article_slug`, `category`, `is_premium` |
| `article_completed` | User scrolls past 80% of article content | `article_id`, `article_title`, `reading_time_seconds`, `scroll_depth_percent` |
| `contact_form_started` | User focuses contact form | `form_id` |
| `contact_form_submitted`| User sends message | `form_id`, `success` (zero user text stored) |
| `newsletter_subscribed` | User signs up for newsletter | `source`, `success` |

### Webinars & Events Funnel
| Event Name | Trigger | Key Properties |
| :--- | :--- | :--- |
| `webinar_viewed` | Webinar checkout card viewed | `webinar_id`, `webinar_title`, `is_free`, `price` |
| `webinar_registration_started`| User opens registration dialog | `webinar_id`, `webinar_title`, `is_free`, `price` |
| `webinar_checkout_started` | Razorpay modal initiated for paid event | `webinar_id`, `price`, `order_id` |
| `webinar_registered` | Free webinar registration completed | `webinar_id`, `webinar_title`, `is_free: true` |
| `webinar_payment_success` | Authoritative Razorpay webhook captured | `webinar_id`, `payment_id`, `amount`, `currency` |
| `webinar_payment_failed` | Client Razorpay handler failure | `webinar_id`, `error_code`, `reason` |

### Memberships & Subscriptions Funnel
| Event Name | Trigger | Key Properties |
| :--- | :--- | :--- |
| `product_viewed` | Pricing section viewed | `product_id`, `product_name`, `price`, `billing_interval` |
| `subscription_started` | User clicks Subscribe | `plan_id`, `plan_name`, `price`, `billing_interval` |
| `checkout_started` | Razorpay subscription checkout opened | `plan_id`, `amount`, `order_id` |
| `payment_success` | Authoritative server capture / webhook | `plan_id`, `amount`, `currency`, `subscription_id`, `payment_id` |
| `payment_failed` | Client or webhook payment failure | `plan_id`, `error_code`, `reason` |
| `subscription_renewed`| Razorpay `subscription.charged` webhook | `subscription_id`, `plan_id`, `amount`, `cycle` |
| `subscription_cancelled`| User or admin cancellation webhook | `subscription_id`, `plan_id`, `reason` |

---

## 5. Admin Analytics Dashboard (`/admin/analytics`)

The Admin Analytics page provides two dedicated views accessed via top tabs:
1. **PostHog Analytics & User Funnels** (`PostHogAnalyticsDashboard`):
   - **KPI Overview Cards**: Total Unique Visitors, Signups, Paid Conversions, Overall Funnel Conversion Rate, and Gross Revenue with percentage changes.
   - **Full Conversion Funnel**: Visual multi-step funnel showing Visitors &rarr; Account Signups &rarr; Checkout Starts &rarr; Paid Conversions with step-by-step dropoff and conversion rates.
   - **Traffic Sources & Acquisition**: Breakdown by UTM Source, Medium, Referrer, and top visited landing pages.
   - **Content Engagement**: Most read insights, reader completion rates, and average reading time.
   - **Webinars & Events Performance**: Registration totals, checkout conversions, and revenue by webinar.
   - **Membership Subscriptions**: Plan distribution (Quarterly, Annual), active counts, renewals, and cancellations.
   - **Retention Cohort Matrix**: User return retention grouped by weekly signup cohorts.
   - **Live Activity Stream**: Real-time chronological feed of critical user milestones.
2. **Sales & Razorpay Reconciliation**:
   - Preserves the existing, comprehensive 2,075-line financial LTV and Razorpay month-by-month transaction audit tool without any breaking changes.

### Fallback Guarantee
If `POSTHOG_PERSONAL_API_KEY` or `POSTHOG_PROJECT_ID` are omitted or pending configuration in your deployment, `/api/admin/posthog-analytics` automatically computes authoritative KPIs, revenue, user signups, and top events directly from the Prisma database, ensuring the admin dashboard never displays a blank or broken screen.

---

## 6. Verification & Troubleshooting

1. **Verify Client Telemetry**:
   - Open browser developer tools (`F12`) &rarr; Network tab.
   - Filter by `posthog` or `i.posthog.com`.
   - As you navigate pages, read articles, or open checkout, verify `POST` requests to `/e/` or `/batch/` with status `200 OK`.
2. **Verify Server Webhooks**:
   - When a Razorpay payment succeeds, check server console logs for `[PostHog Server] Event tracked: payment_success`.
3. **Verify Admin Dashboard**:
   - Log into `/admin/analytics`.
   - Select different timeframes (`Today`, `Last 7 Days`, `Last 30 Days`, `Last 90 Days`).
   - Confirm funnel visualization and table metrics load cleanly.
