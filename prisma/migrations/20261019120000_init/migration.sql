-- CreateTable
CREATE TABLE "Analysis" (
    "id" TEXT NOT NULL,
    "cacheKey" TEXT NOT NULL,
    "normalized" TEXT NOT NULL,
    "language" TEXT NOT NULL,
    "inputType" TEXT NOT NULL,
    "rawInput" TEXT NOT NULL,
    "result" JSONB NOT NULL,
    "serious" BOOLEAN NOT NULL DEFAULT false,
    "sensitive" BOOLEAN NOT NULL DEFAULT false,
    "category" TEXT,
    "checks" INTEGER NOT NULL DEFAULT 1,
    "recentChecks" INTEGER NOT NULL DEFAULT 1,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "lastCheckedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Analysis_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Analysis_cacheKey_key" ON "Analysis"("cacheKey");

-- CreateIndex
CREATE INDEX "Analysis_createdAt_idx" ON "Analysis"("createdAt");

-- CreateIndex
CREATE INDEX "Analysis_lastCheckedAt_idx" ON "Analysis"("lastCheckedAt");

-- CreateIndex
CREATE INDEX "Analysis_checks_idx" ON "Analysis"("checks");

-- CreateIndex
CREATE INDEX "Analysis_recentChecks_idx" ON "Analysis"("recentChecks");
