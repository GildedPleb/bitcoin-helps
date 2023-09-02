-- AlterTable
ALTER TABLE "Argument" ADD COLUMN     "subtitle" TEXT,
ADD COLUMN     "title" TEXT,
ADD COLUMN     "titlePromptId" TEXT;

-- CreateTable
CREATE TABLE "TitlePrompt" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "version" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TitlePrompt_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "TitlePrompt_name_version_key" ON "TitlePrompt"("name", "version");

-- AddForeignKey
ALTER TABLE "Argument" ADD CONSTRAINT "Argument_titlePromptId_fkey" FOREIGN KEY ("titlePromptId") REFERENCES "TitlePrompt"("id") ON DELETE SET NULL ON UPDATE CASCADE;
