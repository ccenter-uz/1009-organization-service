/*
  Warnings:

  - You are about to drop the column `map` on the `site` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "site" DROP COLUMN "map",
ADD COLUMN     "branchs" JSON;
