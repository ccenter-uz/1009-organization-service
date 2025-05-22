-- CreateIndex
CREATE INDEX "idx_category_status" ON "category"("status");

-- CreateIndex
CREATE INDEX "idx_category_city_id" ON "category"("city_id");

-- CreateIndex
CREATE INDEX "idx_category_region_id" ON "category"("region_id");

-- CreateIndex
CREATE INDEX "idx_category_district_id" ON "category"("district_id");

-- CreateIndex
CREATE INDEX "idx_category_translations_name" ON "category_translations"("name");
