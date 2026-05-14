# First Principles Investing

Strip away noise. Think clearly. Compound intelligently.

**First Principles Investing** is a content platform dedicated to long-term structural thinking and business fundamentals. It serves as a digital journal and community hub for investors who prioritize signal over noise.

![Project Preview](/public/logo.png)

## 🚀 Key Features

-   **Insights**: A deep-dive blog system with a "Featured Insight" toggle powered by Sanity CMS.
    -   *Architecture*: Uses a split-query approach to ensure the most recently updated "Featured" post always takes the top spot, with a robust fallback to the latest post.
-   **Events**: A section to list upcoming and past events, complete with registration links and detailed agendas.
-   **CMS Powered**: Fully dynamic content managed via Sanity Studio.
-   **Modern UI**: Built with a custom Design System using Tailwind CSS v4, featuring dark mode aesthetics and gold accents.
-   **Performance**: Built on Next.js 16 (App Router) with Geist fonts and optimized image loading.

## 🛠️ Tech Stack

-   **Framework**: [Next.js 16](https://nextjs.org/) (App Router)
-   **CMS**: [Sanity v5](https://www.sanity.io/)
-   **Styling**: [Tailwind CSS v4](https://tailwindcss.com/)
-   **Icons**: [Lucide React](https://lucide.dev/)
-   **Analytics**: Google Analytics (via `@next/third-parties`)

## 🏁 Getting Started

### Prerequisites

-   Node.js 18+
-   npm or yarn

### 1. Clone & Install

```bash
git clone https://github.com/your-username/first-principles-investing.git
cd first-principles-investing
npm install
```

### 2. Configure Environment

Create a `.env.local` file in the root directory and add your Sanity credentials:

```bash
NEXT_PUBLIC_SANITY_PROJECT_ID=your_project_id
NEXT_PUBLIC_SANITY_DATASET=production
NEXT_PUBLIC_SANITY_API_VERSION=2024-03-19
NEXT_PUBLIC_GOOGLE_ANALYTICS_ID=your_ga_id
```

### 3. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the site.

### 4. Admin Studio

To manage content, navigate to `http://localhost:3000/studio`. This will open the embedded Sanity Studio where you can:

-   Create/Edit **Insights** (Blog posts)
-   Manage **Events**
-   Update **Authors**
-   Toggle **Featured Insights**

## Insights Subscriptions

Create one quarterly Razorpay subscription plan in the Razorpay dashboard, then add the plan ID and webhook secret to your environment:

```bash
INSIGHTS_SUBSCRIPTIONS_ENABLED=true
RAZORPAY_KEY_ID=your_key_id
RAZORPAY_KEY_SECRET=your_key_secret
RAZORPAY_SUBSCRIPTIONS_WEBHOOK_SECRET=your_subscription_webhook_secret
RAZORPAY_INSIGHTS_THREE_MONTHLY_PLAN_ID=plan_three_monthly
```

Optional labels shown on the Insights subscription landing panel:

```bash
INSIGHTS_THREE_MONTHLY_PRICE_LABEL=₹1,299/3 mo
```

Webhook URL for Razorpay Subscriptions:

```text
https://your-domain.com/api/webhook/subscriptions
```

For low-value checkout testing, create a Razorpay Offer that applies to the quarterly subscription plan, then map a local test code to that offer:

```bash
RAZORPAY_INSIGHTS_TEST_COUPON_CODE=TEST1
RAZORPAY_INSIGHTS_TEST_OFFER_ID=offer_all_plans
```

You can also use a quarterly-specific test offer:

```bash
RAZORPAY_INSIGHTS_THREE_MONTHLY_TEST_OFFER_ID=offer_three_monthly
```

Subscription records are managed separately at `/admin/subscriptions`.

## 📂 Project Structure

```
├── public/          # Static assets
├── src/
│   ├── app/         # Next.js App Router pages
│   ├── components/  # React components (UI, Layout, Cards)
│   ├── lib/         # Utilities, Types, Sanity Client
│   ├── sanity/      # Sanity Studio config & schemas
│   └── styles/      # Global styles
├── sanity.config.ts # Sanity Studio configuration
└── tailwind.config.ts # Tailwind configuration
```

## 🎨 Design System

The project uses a custom color palette defined in `src/app/globals.css`:

-   **Primary**: Deep Black/Grey backgrounds (`bg-bg-deep`)
-   **Accent**: Gold (`text-gold`) for highlights and active states.
-   **Typography**: Geist Sans & Mono for clean, editorial readability.

## 🤝 Contributing

1.  Fork the repository.
2.  Create a feature branch (`git checkout -b feature/amazing-feature`).
3.  Commit your changes (`git commit -m 'Add some amazing feature'`).
4.  Push to the branch (`git push origin feature/amazing-feature`).
5.  Open a Pull Request.

---

Built with ❤️ for clear thinkers.
