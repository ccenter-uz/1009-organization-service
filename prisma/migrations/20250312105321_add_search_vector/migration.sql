/*
  Warnings:

  - Added the required column `search_vector` to the `lane_translations` table without a default value. This is not possible if the table is not empty.
  - Added the required column `search_vector` to the `village_translations` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "lane_translations" ADD COLUMN     "search_vector" tsvector NOT NULL;

-- AlterTable
ALTER TABLE "village_translations" ADD COLUMN     "search_vector" tsvector NOT NULL;

-- CreateIndex
CREATE INDEX "lane_translations_search_vector_idx" ON "lane_translations" USING GIN ("search_vector");

-- CreateIndex
CREATE INDEX "village_translations_search_vector_idx" ON "village_translations" USING GIN ("search_vector");
