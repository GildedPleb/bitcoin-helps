-- CreateEnum
CREATE TYPE "JobStatus" AS ENUM ('PENDING', 'PROCESSING', 'COMPLETED');

-- CreateEnum
CREATE TYPE "Role" AS ENUM ('AI', 'User', 'Admin');

-- CreateTable
CREATE TABLE "Language" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "Language_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "IssueCategory" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "languageId" TEXT NOT NULL,

    CONSTRAINT "IssueCategory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AffiliationType" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "languageId" TEXT NOT NULL,

    CONSTRAINT "AffiliationType_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Issue" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "issueCategoryId" TEXT NOT NULL,

    CONSTRAINT "Issue_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Affiliation" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "affiliationTypeId" TEXT NOT NULL,

    CONSTRAINT "Affiliation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "InputPair" (
    "id" TEXT NOT NULL,
    "issueId" TEXT NOT NULL,
    "affiliationId" TEXT NOT NULL,
    "languageId" TEXT NOT NULL,
    "created" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated" TIMESTAMP(3) NOT NULL,
    "hits" INTEGER NOT NULL DEFAULT 1,

    CONSTRAINT "InputPair_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Argument" (
    "id" SERIAL NOT NULL,
    "inputPairId" TEXT,
    "content" TEXT NOT NULL,
    "like" INTEGER NOT NULL DEFAULT 0,
    "dislike" INTEGER NOT NULL DEFAULT 0,
    "created" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated" TIMESTAMP(3) NOT NULL,
    "createdById" INTEGER,

    CONSTRAINT "Argument_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "User" (
    "id" SERIAL NOT NULL,
    "twitterHandle" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "hasSignedTerms" BOOLEAN NOT NULL,
    "role" "Role" NOT NULL,
    "password" TEXT NOT NULL,
    "token" TEXT,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "GenerateJob" (
    "id" TEXT NOT NULL,
    "argumentId" INTEGER NOT NULL,
    "languageId" TEXT NOT NULL,
    "issueId" TEXT NOT NULL,
    "affiliationId" TEXT NOT NULL,
    "status" "JobStatus" NOT NULL DEFAULT 'PENDING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "GenerateJob_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_ArgumentToUser" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "Language_name_key" ON "Language"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Issue_name_issueCategoryId_key" ON "Issue"("name", "issueCategoryId");

-- CreateIndex
CREATE UNIQUE INDEX "Affiliation_name_affiliationTypeId_key" ON "Affiliation"("name", "affiliationTypeId");

-- CreateIndex
CREATE UNIQUE INDEX "InputPair_id_key" ON "InputPair"("id");

-- CreateIndex
CREATE UNIQUE INDEX "InputPair_issueId_affiliationId_languageId_key" ON "InputPair"("issueId", "affiliationId", "languageId");

-- CreateIndex
CREATE UNIQUE INDEX "Argument_id_key" ON "Argument"("id");

-- CreateIndex
CREATE UNIQUE INDEX "User_id_key" ON "User"("id");

-- CreateIndex
CREATE UNIQUE INDEX "User_twitterHandle_key" ON "User"("twitterHandle");

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "GenerateJob_argumentId_key" ON "GenerateJob"("argumentId");

-- CreateIndex
CREATE UNIQUE INDEX "GenerateJob_issueId_affiliationId_languageId_key" ON "GenerateJob"("issueId", "affiliationId", "languageId");

-- CreateIndex
CREATE UNIQUE INDEX "_ArgumentToUser_AB_unique" ON "_ArgumentToUser"("A", "B");

-- CreateIndex
CREATE INDEX "_ArgumentToUser_B_index" ON "_ArgumentToUser"("B");

-- AddForeignKey
ALTER TABLE "IssueCategory" ADD CONSTRAINT "IssueCategory_languageId_fkey" FOREIGN KEY ("languageId") REFERENCES "Language"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AffiliationType" ADD CONSTRAINT "AffiliationType_languageId_fkey" FOREIGN KEY ("languageId") REFERENCES "Language"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Issue" ADD CONSTRAINT "Issue_issueCategoryId_fkey" FOREIGN KEY ("issueCategoryId") REFERENCES "IssueCategory"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Affiliation" ADD CONSTRAINT "Affiliation_affiliationTypeId_fkey" FOREIGN KEY ("affiliationTypeId") REFERENCES "AffiliationType"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InputPair" ADD CONSTRAINT "InputPair_issueId_fkey" FOREIGN KEY ("issueId") REFERENCES "Issue"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InputPair" ADD CONSTRAINT "InputPair_affiliationId_fkey" FOREIGN KEY ("affiliationId") REFERENCES "Affiliation"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InputPair" ADD CONSTRAINT "InputPair_languageId_fkey" FOREIGN KEY ("languageId") REFERENCES "Language"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Argument" ADD CONSTRAINT "Argument_inputPairId_fkey" FOREIGN KEY ("inputPairId") REFERENCES "InputPair"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Argument" ADD CONSTRAINT "Argument_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GenerateJob" ADD CONSTRAINT "GenerateJob_argumentId_fkey" FOREIGN KEY ("argumentId") REFERENCES "Argument"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GenerateJob" ADD CONSTRAINT "GenerateJob_languageId_fkey" FOREIGN KEY ("languageId") REFERENCES "Language"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GenerateJob" ADD CONSTRAINT "GenerateJob_issueId_fkey" FOREIGN KEY ("issueId") REFERENCES "Issue"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GenerateJob" ADD CONSTRAINT "GenerateJob_affiliationId_fkey" FOREIGN KEY ("affiliationId") REFERENCES "Affiliation"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ArgumentToUser" ADD CONSTRAINT "_ArgumentToUser_A_fkey" FOREIGN KEY ("A") REFERENCES "Argument"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ArgumentToUser" ADD CONSTRAINT "_ArgumentToUser_B_fkey" FOREIGN KEY ("B") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
