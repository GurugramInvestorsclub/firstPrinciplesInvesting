-- CreateEnum
CREATE TYPE "insights_plan_key" AS ENUM ('monthly', 'yearly');

-- CreateEnum
CREATE TYPE "insights_subscription_status" AS ENUM (
    'created',
    'authenticated',
    'active',
    'pending',
    'halted',
    'paused',
    'cancel_requested',
    'cancelled',
    'completed',
    'expired'
);

-- CreateEnum
CREATE TYPE "insights_subscription_charge_status" AS ENUM ('created', 'captured', 'failed');

-- CreateTable
CREATE TABLE "insights_subscriptions" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "plan_key" "insights_plan_key" NOT NULL,
    "razorpay_plan_id" TEXT NOT NULL,
    "razorpay_subscription_id" TEXT,
    "status" "insights_subscription_status" NOT NULL DEFAULT 'created',
    "current_start_at" TIMESTAMP(3),
    "current_end_at" TIMESTAMP(3),
    "charge_at" TIMESTAMP(3),
    "start_at" TIMESTAMP(3),
    "ended_at" TIMESTAMP(3),
    "cancelled_at" TIMESTAMP(3),
    "cancel_requested_at" TIMESTAMP(3),
    "cancel_at_cycle_end" BOOLEAN NOT NULL DEFAULT false,
    "customer_id" TEXT,
    "quantity" INTEGER NOT NULL DEFAULT 1,
    "total_count" INTEGER,
    "paid_count" INTEGER NOT NULL DEFAULT 0,
    "remaining_count" INTEGER,
    "source" TEXT,
    "short_url" TEXT,
    "notes" JSONB,
    "last_webhook_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "insights_subscriptions_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "insights_subscriptions_quantity_positive" CHECK ("quantity" > 0),
    CONSTRAINT "insights_subscriptions_total_count_positive" CHECK ("total_count" IS NULL OR "total_count" > 0),
    CONSTRAINT "insights_subscriptions_paid_count_non_negative" CHECK ("paid_count" >= 0),
    CONSTRAINT "insights_subscriptions_remaining_count_non_negative" CHECK ("remaining_count" IS NULL OR "remaining_count" >= 0)
);

-- CreateTable
CREATE TABLE "insights_subscription_charges" (
    "id" TEXT NOT NULL,
    "subscription_id" TEXT NOT NULL,
    "razorpay_payment_id" TEXT,
    "razorpay_invoice_id" TEXT,
    "amount" INTEGER NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'INR',
    "status" "insights_subscription_charge_status" NOT NULL DEFAULT 'created',
    "failure_reason" TEXT,
    "charged_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "insights_subscription_charges_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "insights_subscription_charges_amount_positive" CHECK ("amount" > 0)
);

-- CreateTable
CREATE TABLE "insights_subscription_webhook_events" (
    "id" TEXT NOT NULL,
    "webhook_event_id" TEXT NOT NULL,
    "event_type" TEXT NOT NULL,
    "razorpay_subscription_id" TEXT,
    "razorpay_payment_id" TEXT,
    "payload_hash" TEXT NOT NULL,
    "received_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "processing_started_at" TIMESTAMP(3),
    "processed_at" TIMESTAMP(3),

    CONSTRAINT "insights_subscription_webhook_events_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "insights_subscription_audit_logs" (
    "id" TEXT NOT NULL,
    "subscription_id" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "metadata" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "insights_subscription_audit_logs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "insights_subscriptions_razorpay_subscription_id_key" ON "insights_subscriptions"("razorpay_subscription_id");

-- CreateIndex
CREATE INDEX "insights_subscriptions_user_id_status_idx" ON "insights_subscriptions"("user_id", "status");

-- CreateIndex
CREATE INDEX "insights_subscriptions_status_current_end_at_idx" ON "insights_subscriptions"("status", "current_end_at");

-- CreateIndex
CREATE INDEX "insights_subscriptions_razorpay_plan_id_idx" ON "insights_subscriptions"("razorpay_plan_id");

-- CreateIndex
CREATE UNIQUE INDEX "insights_subscription_charges_razorpay_payment_id_key" ON "insights_subscription_charges"("razorpay_payment_id");

-- CreateIndex
CREATE UNIQUE INDEX "insights_subscription_charges_razorpay_invoice_id_key" ON "insights_subscription_charges"("razorpay_invoice_id");

-- CreateIndex
CREATE INDEX "insights_subscription_charges_subscription_id_created_at_idx" ON "insights_subscription_charges"("subscription_id", "created_at");

-- CreateIndex
CREATE INDEX "insights_subscription_charges_status_charged_at_idx" ON "insights_subscription_charges"("status", "charged_at");

-- CreateIndex
CREATE UNIQUE INDEX "insights_subscription_webhook_events_webhook_event_id_key" ON "insights_subscription_webhook_events"("webhook_event_id");

-- CreateIndex
CREATE INDEX "insights_subscription_webhook_events_razorpay_subscription_id_idx" ON "insights_subscription_webhook_events"("razorpay_subscription_id");

-- CreateIndex
CREATE INDEX "insights_subscription_webhook_events_razorpay_payment_id_idx" ON "insights_subscription_webhook_events"("razorpay_payment_id");

-- CreateIndex
CREATE INDEX "insights_subscription_audit_logs_subscription_id_created_at_idx" ON "insights_subscription_audit_logs"("subscription_id", "created_at");

-- AddForeignKey
ALTER TABLE "insights_subscriptions" ADD CONSTRAINT "insights_subscriptions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "insights_subscription_charges" ADD CONSTRAINT "insights_subscription_charges_subscription_id_fkey" FOREIGN KEY ("subscription_id") REFERENCES "insights_subscriptions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "insights_subscription_audit_logs" ADD CONSTRAINT "insights_subscription_audit_logs_subscription_id_fkey" FOREIGN KEY ("subscription_id") REFERENCES "insights_subscriptions"("id") ON DELETE CASCADE ON UPDATE CASCADE;
