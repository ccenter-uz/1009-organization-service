/*
  Warnings:

  - You are about to drop the column `branchs` on the `site` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "site" DROP COLUMN "branchs",
ADD COLUMN     "branches" JSON;
