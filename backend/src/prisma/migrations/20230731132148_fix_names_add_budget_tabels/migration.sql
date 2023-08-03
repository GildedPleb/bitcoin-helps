-- CreateEnum
CREATE TYPE "BudgetType" AS ENUM ('LANGUAGE', 'ESSAY');

-- CreateTable
CREATE TABLE "Budget" (
    "id" TEXT NOT NULL,
    "budgetType" "BudgetType" NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "spent" DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    "month" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Budget_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OpenAICall" (
    "id" TEXT NOT NULL,
    "promptTokens" INTEGER NOT NULL,
    "completionTokens" INTEGER NOT NULL,
    "cost" DOUBLE PRECISION NOT NULL,
    "prompt" TEXT,
    "completion" TEXT,
    "generateJobId" TEXT,
    "languageId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "OpenAICall_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "OpenAICall" ADD CONSTRAINT "OpenAICall_generateJobId_fkey" FOREIGN KEY ("generateJobId") REFERENCES "GenerateJob"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OpenAICall" ADD CONSTRAINT "OpenAICall_languageId_fkey" FOREIGN KEY ("languageId") REFERENCES "Language"("id") ON DELETE SET NULL ON UPDATE CASCADE;
