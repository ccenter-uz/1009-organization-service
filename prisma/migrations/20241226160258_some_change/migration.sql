/*
  Warnings:

  - Made the column `description` on table `nearbees` required. This step will fail if there are existing NULL values in that column.
  - Made the column `description` on table `nearbees_version` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "nearbees" ALTER COLUMN "description" SET NOT NULL;

-- AlterTable
ALTER TABLE "nearbees_version" ALTER COLUMN "description" SET NOT NULL;
