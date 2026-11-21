-- CreateTable
CREATE TABLE "weekly_reports" (
    "id" TEXT NOT NULL,
    "report_type" TEXT NOT NULL DEFAULT 'WEEKLY',
    "title" TEXT,
    "year" INTEGER,
    "week_number" INTEGER,
    "start_date" TIMESTAMP(3) NOT NULL,
    "end_date" TIMESTAMP(3) NOT NULL,
    "total_visitors" INTEGER NOT NULL DEFAULT 0,
    "total_pageviews" INTEGER NOT NULL DEFAULT 0,
    "top_page_path" TEXT NOT NULL DEFAULT '/',
    "top_page_views" INTEGER NOT NULL DEFAULT 0,
    "top_pages" JSONB,
    "insights_visitors" INTEGER NOT NULL DEFAULT 0,
    "insights_pageviews" INTEGER NOT NULL DEFAULT 0,
    "top_referrers" JSONB,
    "total_new_subscriptions" INTEGER NOT NULL DEFAULT 0,
    "active_subscriptions" INTEGER NOT NULL DEFAULT 0,
    "subscription_revenue" INTEGER NOT NULL DEFAULT 0,
    "webinar_revenue" INTEGER NOT NULL DEFAULT 0,
    "total_revenue" INTEGER NOT NULL DEFAULT 0,
    "new_signups" INTEGER NOT NULL DEFAULT 0,
    "wow_metrics" JSONB,
    "detailed_breakdown" JSONB,
    "status" TEXT NOT NULL DEFAULT 'GENERATED',
    "error_message" TEXT,
    "generated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "weekly_reports_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "weekly_reports_report_type_start_date_end_date_idx" ON "weekly_reports"("report_type", "start_date", "end_date");

-- CreateIndex
CREATE INDEX "weekly_reports_year_week_number_idx" ON "weekly_reports"("year", "week_number");
