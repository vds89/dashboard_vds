-- CreateTable
CREATE TABLE "MonthlyPortfolio" (
    "id" TEXT NOT NULL,
    "month" TIMESTAMP(3) NOT NULL,
    "fixedIncome" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "variableIncome" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "fixedExpenses" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "variableExpenses" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "ing" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "bbva" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "revolut" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "directa" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "mwrd" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "smea" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "xmme" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "bond" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "eth" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "sol" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "link" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "op" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "usdt" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "cometa" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MonthlyPortfolio_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PortfolioAssetClass" (
    "id" TEXT NOT NULL,
    "assetClass" TEXT NOT NULL,
    "ticker" TEXT NOT NULL,
    "quantity" DOUBLE PRECISION NOT NULL,
    "valueEUR" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PortfolioAssetClass_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "MonthlyPortfolio_month_key" ON "MonthlyPortfolio"("month");

-- CreateIndex
CREATE INDEX "MonthlyPortfolio_month_idx" ON "MonthlyPortfolio"("month");

-- CreateIndex
CREATE INDEX "PortfolioAssetClass_assetClass_idx" ON "PortfolioAssetClass"("assetClass");

-- CreateIndex
CREATE UNIQUE INDEX "PortfolioAssetClass_assetClass_ticker_key" ON "PortfolioAssetClass"("assetClass", "ticker");
