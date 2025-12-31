/*
  Warnings:

  - The primary key for the `MonthlyPortfolio` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `id` on the `MonthlyPortfolio` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX "MonthlyPortfolio_month_key";

-- AlterTable
ALTER TABLE "MonthlyPortfolio" DROP CONSTRAINT "MonthlyPortfolio_pkey",
DROP COLUMN "id",
ADD COLUMN     "ethPrice" DOUBLE PRECISION NOT NULL DEFAULT 0,
ADD COLUMN     "linkPrice" DOUBLE PRECISION NOT NULL DEFAULT 0,
ADD COLUMN     "mwrdPrice" DOUBLE PRECISION NOT NULL DEFAULT 0,
ADD COLUMN     "opPrice" DOUBLE PRECISION NOT NULL DEFAULT 0,
ADD COLUMN     "smeaPrice" DOUBLE PRECISION NOT NULL DEFAULT 0,
ADD COLUMN     "solPrice" DOUBLE PRECISION NOT NULL DEFAULT 0,
ADD COLUMN     "xmmePrice" DOUBLE PRECISION NOT NULL DEFAULT 0,
ALTER COLUMN "month" SET DATA TYPE DATE,
ADD CONSTRAINT "MonthlyPortfolio_pkey" PRIMARY KEY ("month");
