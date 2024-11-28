/*
  Warnings:

  - You are about to drop the column `newName` on the `passage_new_name_translations` table. All the data in the column will be lost.
  - You are about to drop the column `oldName` on the `passage_old_name_translations` table. All the data in the column will be lost.
  - Added the required column `name` to the `passage_new_name_translations` table without a default value. This is not possible if the table is not empty.
  - Added the required column `name` to the `passage_old_name_translations` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "passage_new_name_translations" DROP COLUMN "newName",
ADD COLUMN     "name" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "passage_old_name_translations" DROP COLUMN "oldName",
ADD COLUMN     "name" TEXT NOT NULL;
