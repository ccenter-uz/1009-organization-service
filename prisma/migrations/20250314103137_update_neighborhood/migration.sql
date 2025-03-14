-- AlterTable
ALTER TABLE "neighborhood_translations" ADD COLUMN     "search_vector" tsvector;

-- CreateIndex
CREATE INDEX "neighborhood_translations_search_vector_idx" ON "neighborhood_translations" USING GIN ("search_vector");
