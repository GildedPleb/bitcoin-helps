/*
  Warnings:

  - You are about to drop the column `description_hash` on the `AlbyInvoice` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[payment_hash]` on the table `AlbyInvoice` will be added. If there are existing duplicate values, this will fail.

*/
-- DropForeignKey
ALTER TABLE "AlbyInvoice" DROP CONSTRAINT "AlbyInvoice_description_hash_fkey";

-- DropIndex
DROP INDEX "AlbyInvoice_description_hash_key";

-- AlterTable
ALTER TABLE "AlbyInvoice" DROP COLUMN "description_hash",
ADD COLUMN     "payment_hash" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "AlbyInvoice_payment_hash_key" ON "AlbyInvoice"("payment_hash");

-- AddForeignKey
ALTER TABLE "AlbyInvoice" ADD CONSTRAINT "AlbyInvoice_payment_hash_fkey" FOREIGN KEY ("payment_hash") REFERENCES "GenerateJob"("id") ON DELETE SET NULL ON UPDATE CASCADE;
