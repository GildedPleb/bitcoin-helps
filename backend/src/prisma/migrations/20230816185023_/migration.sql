/*
  Warnings:

  - A unique constraint covering the columns `[paymentRequest]` on the table `AlbyInvoice` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[paymentHash]` on the table `AlbyInvoice` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "AlbyInvoice_paymentRequest_key" ON "AlbyInvoice"("paymentRequest");

-- CreateIndex
CREATE UNIQUE INDEX "AlbyInvoice_paymentHash_key" ON "AlbyInvoice"("paymentHash");
