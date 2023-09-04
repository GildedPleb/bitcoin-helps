/*
  Warnings:

  - A unique constraint covering the columns `[generateJobId]` on the table `AlbyInvoice` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `generateJobId` to the `AlbyInvoice` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "AlbyInvoice" DROP CONSTRAINT "AlbyInvoice_paymentHash_fkey";

-- DropIndex
DROP INDEX "AlbyInvoice_paymentHash_key";

-- AlterTable
ALTER TABLE "AlbyInvoice" ADD COLUMN     "generateJobId" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "AlbyInvoice_generateJobId_key" ON "AlbyInvoice"("generateJobId");

-- AddForeignKey
ALTER TABLE "AlbyInvoice" ADD CONSTRAINT "AlbyInvoice_generateJobId_fkey" FOREIGN KEY ("generateJobId") REFERENCES "GenerateJob"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
