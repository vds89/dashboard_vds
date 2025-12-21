-- Step 1: Rimosse le righe di log di dotenv e il CREATE SCHEMA (spesso problematico su Neon)

-- CreateTable: Mantieni questa solo se esiste già nel DB
CREATE TABLE "vds_finance" (
    "date" TIMESTAMP(3) NOT NULL,
    "income" DOUBLE PRECISION NOT NULL,
    "outcome" DOUBLE PRECISION NOT NULL,

    CONSTRAINT "vds_finance_pkey" PRIMARY KEY ("date")
);

-- NOTA: Se le tabelle MonthlyPortfolio e PortfolioAssetClass NON esistono ancora 
-- sul database Neon, RIMOVILE da questo file 0_init e lascia che Prisma 
-- le crei con il prossimo comando 'migrate dev'.