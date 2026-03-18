-- CreateTable
CREATE TABLE "api_rate_limits" (
    "id" TEXT NOT NULL,
    "scope" TEXT NOT NULL,
    "key_hash" TEXT NOT NULL,
    "count" INTEGER NOT NULL DEFAULT 0,
    "window_start" TIMESTAMP(3) NOT NULL,
    "blocked_until" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "api_rate_limits_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "api_rate_limits_count_non_negative" CHECK ("count" >= 0)
);

-- CreateIndex
CREATE UNIQUE INDEX "api_rate_limits_scope_key_hash_key" ON "api_rate_limits"("scope", "key_hash");

-- CreateIndex
CREATE INDEX "api_rate_limits_scope_blocked_until_idx" ON "api_rate_limits"("scope", "blocked_until");
