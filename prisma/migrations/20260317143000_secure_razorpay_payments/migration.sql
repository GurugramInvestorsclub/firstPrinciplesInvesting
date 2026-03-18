-- CreateEnum
CREATE TYPE "coupon_type" AS ENUM ('percentage', 'flat');

-- CreateEnum
CREATE TYPE "payment_status" AS ENUM ('created', 'success', 'failed');

-- CreateTable
CREATE TABLE "events" (
    "id" TEXT NOT NULL,
    "event_id" TEXT NOT NULL,
    "price" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "events_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "events_price_positive" CHECK ("price" > 0)
);

-- CreateTable
CREATE TABLE "coupons" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "type" "coupon_type" NOT NULL,
    "value" INTEGER NOT NULL,
    "max_uses" INTEGER,
    "used_count" INTEGER NOT NULL DEFAULT 0,
    "expiry_date" TIMESTAMP(3) NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "event_id" TEXT,
    "per_user_limit" INTEGER,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "coupons_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "coupons_value_positive" CHECK ("value" > 0),
    CONSTRAINT "coupons_max_uses_positive" CHECK ("max_uses" IS NULL OR "max_uses" > 0),
    CONSTRAINT "coupons_per_user_limit_positive" CHECK ("per_user_limit" IS NULL OR "per_user_limit" > 0),
    CONSTRAINT "coupons_used_count_non_negative" CHECK ("used_count" >= 0),
    CONSTRAINT "coupons_usage_within_limit" CHECK ("max_uses" IS NULL OR "used_count" <= "max_uses")
);

-- CreateTable
CREATE TABLE "payments" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "event_id" TEXT NOT NULL,
    "coupon_id" TEXT,
    "razorpay_order_id" TEXT,
    "razorpay_payment_id" TEXT,
    "amount" INTEGER NOT NULL,
    "coupon_code" TEXT,
    "status" "payment_status" NOT NULL DEFAULT 'created',
    "failure_reason" TEXT,
    "refund_status" TEXT,
    "refund_reason" TEXT,
    "razorpay_refund_id" TEXT,
    "refund_initiated_at" TIMESTAMP(3),
    "razorpay_signature" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "paid_at" TIMESTAMP(3),

    CONSTRAINT "payments_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "payments_amount_positive" CHECK ("amount" > 0)
);

-- CreateTable
CREATE TABLE "coupon_redemptions" (
    "id" TEXT NOT NULL,
    "coupon_id" TEXT NOT NULL,
    "payment_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "event_id" TEXT NOT NULL,
    "used_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "coupon_redemptions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "razorpay_webhook_events" (
    "id" TEXT NOT NULL,
    "webhook_event_id" TEXT NOT NULL,
    "event_type" TEXT NOT NULL,
    "razorpay_order_id" TEXT,
    "razorpay_payment_id" TEXT,
    "payload_hash" TEXT NOT NULL,
    "received_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "processing_started_at" TIMESTAMP(3),
    "processed_at" TIMESTAMP(3),

    CONSTRAINT "razorpay_webhook_events_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "payment_audit_logs" (
    "id" TEXT NOT NULL,
    "payment_id" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "metadata" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "payment_audit_logs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "events_event_id_key" ON "events"("event_id");

-- CreateIndex
CREATE UNIQUE INDEX "coupons_code_key" ON "coupons"("code");

-- CreateIndex
CREATE INDEX "coupons_event_id_idx" ON "coupons"("event_id");

-- CreateIndex
CREATE INDEX "coupons_is_active_expiry_date_idx" ON "coupons"("is_active", "expiry_date");

-- CreateIndex
CREATE UNIQUE INDEX "payments_razorpay_order_id_key" ON "payments"("razorpay_order_id");

-- CreateIndex
CREATE UNIQUE INDEX "payments_razorpay_payment_id_key" ON "payments"("razorpay_payment_id");

-- CreateIndex
CREATE UNIQUE INDEX "payments_razorpay_refund_id_key" ON "payments"("razorpay_refund_id");

-- CreateIndex
CREATE INDEX "payments_user_id_event_id_idx" ON "payments"("user_id", "event_id");

-- CreateIndex
CREATE INDEX "payments_event_id_status_idx" ON "payments"("event_id", "status");

-- CreateIndex
CREATE UNIQUE INDEX "payments_user_event_success_unique" ON "payments"("user_id", "event_id") WHERE "status" = 'success';

-- CreateIndex
CREATE UNIQUE INDEX "coupon_redemptions_payment_id_key" ON "coupon_redemptions"("payment_id");

-- CreateIndex
CREATE INDEX "coupon_redemptions_coupon_id_user_id_idx" ON "coupon_redemptions"("coupon_id", "user_id");

-- CreateIndex
CREATE INDEX "coupon_redemptions_event_id_idx" ON "coupon_redemptions"("event_id");

-- CreateIndex
CREATE UNIQUE INDEX "razorpay_webhook_events_webhook_event_id_key" ON "razorpay_webhook_events"("webhook_event_id");

-- CreateIndex
CREATE INDEX "razorpay_webhook_events_razorpay_order_id_idx" ON "razorpay_webhook_events"("razorpay_order_id");

-- CreateIndex
CREATE INDEX "razorpay_webhook_events_razorpay_payment_id_idx" ON "razorpay_webhook_events"("razorpay_payment_id");

-- CreateIndex
CREATE INDEX "payment_audit_logs_payment_id_created_at_idx" ON "payment_audit_logs"("payment_id", "created_at");

-- AddForeignKey
ALTER TABLE "coupons" ADD CONSTRAINT "coupons_event_id_fkey" FOREIGN KEY ("event_id") REFERENCES "events"("event_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payments" ADD CONSTRAINT "payments_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payments" ADD CONSTRAINT "payments_event_id_fkey" FOREIGN KEY ("event_id") REFERENCES "events"("event_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payments" ADD CONSTRAINT "payments_coupon_id_fkey" FOREIGN KEY ("coupon_id") REFERENCES "coupons"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "coupon_redemptions" ADD CONSTRAINT "coupon_redemptions_coupon_id_fkey" FOREIGN KEY ("coupon_id") REFERENCES "coupons"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "coupon_redemptions" ADD CONSTRAINT "coupon_redemptions_payment_id_fkey" FOREIGN KEY ("payment_id") REFERENCES "payments"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "coupon_redemptions" ADD CONSTRAINT "coupon_redemptions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "coupon_redemptions" ADD CONSTRAINT "coupon_redemptions_event_id_fkey" FOREIGN KEY ("event_id") REFERENCES "events"("event_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payment_audit_logs" ADD CONSTRAINT "payment_audit_logs_payment_id_fkey" FOREIGN KEY ("payment_id") REFERENCES "payments"("id") ON DELETE CASCADE ON UPDATE CASCADE;
