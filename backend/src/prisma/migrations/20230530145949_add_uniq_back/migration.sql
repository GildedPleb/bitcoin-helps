/*
  Warnings:

  - A unique constraint covering the columns `[issueId,affiliationId,languageId]` on the table `InputPair` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "InputPair_issueId_affiliationId_languageId_key" ON "InputPair"("issueId", "affiliationId", "languageId");
