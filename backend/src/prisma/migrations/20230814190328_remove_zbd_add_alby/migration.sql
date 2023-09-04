/*
  Warnings:

  - You are about to drop the `ZBDInvoice` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "ZBDInvoice" DROP CONSTRAINT "ZBDInvoice_internalId_fkey";

-- DropTable
DROP TABLE "ZBDInvoice";

-- CreateTable
CREATE TABLE "AlbyInvoice" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "amount" TEXT NOT NULL,
    "settled" BOOLEAN NOT NULL,
    "invoice" JSONB NOT NULL,
    "description_hash" TEXT,

    CONSTRAINT "AlbyInvoice_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "AlbyInvoice_description_hash_key" ON "AlbyInvoice"("description_hash");

-- AddForeignKey
ALTER TABLE "AlbyInvoice" ADD CONSTRAINT "AlbyInvoice_description_hash_fkey" FOREIGN KEY ("description_hash") REFERENCES "GenerateJob"("id") ON DELETE SET NULL ON UPDATE CASCADE;
