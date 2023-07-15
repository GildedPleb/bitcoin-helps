/*
  Warnings:

  - Added the required column `translations` to the `Language` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Language" ADD COLUMN     "translations" JSONB NOT NULL;
