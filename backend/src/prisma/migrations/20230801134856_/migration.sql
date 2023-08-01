/*
  Warnings:

  - You are about to drop the column `spent` on the `Budget` table. All the data in the column will be lost.
  - Added the required column `budgetId` to the `OpenAICall` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Budget" DROP COLUMN "spent";

-- AlterTable
ALTER TABLE "OpenAICall" ADD COLUMN     "budgetId" TEXT NOT NULL;

-- AddForeignKey
ALTER TABLE "OpenAICall" ADD CONSTRAINT "OpenAICall_budgetId_fkey" FOREIGN KEY ("budgetId") REFERENCES "Budget"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
