/*
  Warnings:

  - You are about to drop the column `name` on the `category` table. All the data in the column will be lost.
  - You are about to drop the column `name` on the `sub_category` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "category" DROP COLUMN "name";

-- AlterTable
ALTER TABLE "sub_category" DROP COLUMN "name";
