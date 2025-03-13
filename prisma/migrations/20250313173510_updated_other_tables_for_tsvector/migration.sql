-- AlterTable
ALTER TABLE "area_translations" ADD COLUMN     "search_vector" tsvector;

-- AlterTable
ALTER TABLE "avenue_translations" ADD COLUMN     "search_vector" tsvector;

-- AlterTable
ALTER TABLE "city_translations" ADD COLUMN     "search_vector" tsvector;

-- AlterTable
ALTER TABLE "district_translations" ADD COLUMN     "search_vector" tsvector;

-- AlterTable
ALTER TABLE "impasse_translations" ADD COLUMN     "search_vector" tsvector;

-- AlterTable
ALTER TABLE "nearbees" ADD COLUMN     "description_search_vector" tsvector;

-- AlterTable
ALTER TABLE "nearby_translations" ADD COLUMN     "search_vector" tsvector;

-- AlterTable
ALTER TABLE "organization" ADD COLUMN     "address_search_vector" tsvector;

-- AlterTable
ALTER TABLE "passage_translations" ADD COLUMN     "search_vector" tsvector;

-- AlterTable
ALTER TABLE "region_translations" ADD COLUMN     "search_vector" tsvector;

-- AlterTable
ALTER TABLE "residential_area_translations" ADD COLUMN     "search_vector" tsvector;

-- AlterTable
ALTER TABLE "street_translations" ADD COLUMN     "search_vector" tsvector;

-- CreateIndex
CREATE INDEX "area_translations_search_vector_idx" ON "area_translations" USING GIN ("search_vector");

-- CreateIndex
CREATE INDEX "avenue_translations_search_vector_idx" ON "avenue_translations" USING GIN ("search_vector");

-- CreateIndex
CREATE INDEX "city_translations_search_vector_idx" ON "city_translations" USING GIN ("search_vector");

-- CreateIndex
CREATE INDEX "district_translations_search_vector_idx" ON "district_translations" USING GIN ("search_vector");

-- CreateIndex
CREATE INDEX "impasse_translations_search_vector_idx" ON "impasse_translations" USING GIN ("search_vector");

-- CreateIndex
CREATE INDEX "nearbees_description_search_vector_idx" ON "nearbees" USING GIN ("description_search_vector");

-- CreateIndex
CREATE INDEX "nearby_translations_search_vector_idx" ON "nearby_translations" USING GIN ("search_vector");

-- CreateIndex
CREATE INDEX "organization_address_search_vector_idx" ON "organization" USING GIN ("address_search_vector");

-- CreateIndex
CREATE INDEX "passage_translations_search_vector_idx" ON "passage_translations" USING GIN ("search_vector");

-- CreateIndex
CREATE INDEX "region_translations_search_vector_idx" ON "region_translations" USING GIN ("search_vector");

-- CreateIndex
CREATE INDEX "residential_area_translations_search_vector_idx" ON "residential_area_translations" USING GIN ("search_vector");

-- CreateIndex
CREATE INDEX "street_translations_search_vector_idx" ON "street_translations" USING GIN ("search_vector");
