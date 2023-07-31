/*
  Warnings:

  - The `prompt` column on the `OpenAICall` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- AlterTable
ALTER TABLE "OpenAICall" DROP COLUMN "prompt",
ADD COLUMN     "prompt" JSONB;
