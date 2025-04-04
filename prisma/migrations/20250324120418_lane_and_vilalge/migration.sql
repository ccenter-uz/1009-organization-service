-- AlterTable
ALTER TABLE "lane_translations" ADD COLUMN     "search_vector" tsvector;

-- AlterTable
ALTER TABLE "village_translations" ADD COLUMN     "search_vector" tsvector;

-- CreateIndex
CREATE INDEX "lane_translations_search_vector_idx" ON "lane_translations" USING GIN ("search_vector");

-- CreateIndex
CREATE INDEX "village_translations_search_vector_idx" ON "village_translations" USING GIN ("search_vector");
