-- AlterTable
ALTER TABLE "GenerateJob" ADD COLUMN     "argumentPromptId" TEXT NOT NULL DEFAULT 'b8b9571d-495c-4dd2-aced-7aa402aca019';

-- AddForeignKey
ALTER TABLE "GenerateJob" ADD CONSTRAINT "GenerateJob_argumentPromptId_fkey" FOREIGN KEY ("argumentPromptId") REFERENCES "ArgumentPrompt"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
