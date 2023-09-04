/*
  Warnings:

  - Added the required column `comment` to the `AlbyInvoice` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "AlbyInvoice" ADD COLUMN     "comment" TEXT NOT NULL;
