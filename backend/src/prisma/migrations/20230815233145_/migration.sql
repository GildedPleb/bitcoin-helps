/*
  Warnings:

  - You are about to drop the column `invoice` on the `AlbyInvoice` table. All the data in the column will be lost.
  - You are about to drop the column `payment_hash` on the `AlbyInvoice` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[paymentHash]` on the table `AlbyInvoice` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `paymentHash` to the `AlbyInvoice` table without a default value. This is not possible if the table is not empty.
  - Added the required column `paymentRequest` to the `AlbyInvoice` table without a default value. This is not possible if the table is not empty.
  - Added the required column `verify` to the `AlbyInvoice` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "AlbyInvoice" DROP CONSTRAINT "AlbyInvoice_payment_hash_fkey";

-- DropIndex
DROP INDEX "AlbyInvoice_payment_hash_key";

-- AlterTable
ALTER TABLE "AlbyInvoice" DROP COLUMN "invoice",
DROP COLUMN "payment_hash",
ADD COLUMN     "paymentHash" TEXT NOT NULL,
ADD COLUMN     "paymentRequest" TEXT NOT NULL,
ADD COLUMN     "verify" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "AlbyInvoice_paymentHash_key" ON "AlbyInvoice"("paymentHash");

-- AddForeignKey
ALTER TABLE "AlbyInvoice" ADD CONSTRAINT "AlbyInvoice_paymentHash_fkey" FOREIGN KEY ("paymentHash") REFERENCES "GenerateJob"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
