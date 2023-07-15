-- AlterTable
ALTER TABLE "Argument" ADD COLUMN     "promptId" TEXT;

-- AlterTable
ALTER TABLE "Language" ADD COLUMN     "languagePromptId" TEXT;

-- CreateTable
CREATE TABLE "ArgumentPrompt" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "version" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ArgumentPrompt_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LanguagePrompt" (
    "id" TEXT NOT NULL,
    "version" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "translationPrompt" TEXT NOT NULL,
    "translationExample" JSONB NOT NULL,
    "issuePrompt" TEXT NOT NULL,
    "issueCategoryPrompt" TEXT NOT NULL,
    "issueExample" JSONB NOT NULL,
    "affiliationPrompt" TEXT NOT NULL,
    "affiliationTypePrompt" TEXT NOT NULL,
    "affiliationExample" JSONB NOT NULL,

    CONSTRAINT "LanguagePrompt_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ArgumentPrompt_name_version_key" ON "ArgumentPrompt"("name", "version");

-- CreateIndex
CREATE UNIQUE INDEX "LanguagePrompt_name_version_key" ON "LanguagePrompt"("name", "version");

-- AddForeignKey
ALTER TABLE "Language" ADD CONSTRAINT "Language_languagePromptId_fkey" FOREIGN KEY ("languagePromptId") REFERENCES "LanguagePrompt"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Argument" ADD CONSTRAINT "Argument_promptId_fkey" FOREIGN KEY ("promptId") REFERENCES "ArgumentPrompt"("id") ON DELETE SET NULL ON UPDATE CASCADE;
