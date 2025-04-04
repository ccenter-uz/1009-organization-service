/*
  Warnings:

  - You are about to drop the column `edited_staff_number` on the `district` table. All the data in the column will be lost.
  - You are about to drop the column `edited_staff_number` on the `passage` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "district" DROP COLUMN "edited_staff_number";

-- AlterTable
ALTER TABLE "passage" DROP COLUMN "edited_staff_number";
