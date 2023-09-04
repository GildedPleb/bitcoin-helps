-- CreateTable
CREATE TABLE "ZBDInvoice" (
    "id" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "callbackUrl" TEXT NOT NULL,
    "amount" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "invoice" JSONB NOT NULL,
    "internalId" TEXT,

    CONSTRAINT "ZBDInvoice_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ZBDInvoice_internalId_key" ON "ZBDInvoice"("internalId");

-- AddForeignKey
ALTER TABLE "ZBDInvoice" ADD CONSTRAINT "ZBDInvoice_internalId_fkey" FOREIGN KEY ("internalId") REFERENCES "GenerateJob"("id") ON DELETE SET NULL ON UPDATE CASCADE;
