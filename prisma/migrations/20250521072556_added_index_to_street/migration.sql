-- CreateIndex
CREATE INDEX "idx_street_region_id" ON "street"("region_id");

-- CreateIndex
CREATE INDEX "idx_street_city_id" ON "street"("city_id");

-- CreateIndex
CREATE INDEX "idx_street_district_id" ON "street"("district_id");

-- CreateIndex
CREATE INDEX "idx_street_status" ON "street"("status");

-- CreateIndex
CREATE INDEX "idx_street_order_number" ON "street"("order_number");

-- CreateIndex
CREATE INDEX "idx_street_new_name_street_id" ON "street_new_name_translations"("street_id");

-- CreateIndex
CREATE INDEX "idx_street_new_name_lang" ON "street_new_name_translations"("language_code");

-- CreateIndex
CREATE INDEX "idx_street_new_name_name" ON "street_new_name_translations"("name");

-- CreateIndex
CREATE INDEX "idx_street_old_name_street_id" ON "street_old_name_translations"("street_id");

-- CreateIndex
CREATE INDEX "idx_street_old_name_lang" ON "street_old_name_translations"("language_code");

-- CreateIndex
CREATE INDEX "idx_street_old_name_name" ON "street_old_name_translations"("name");

-- CreateIndex
CREATE INDEX "idx_street_translations_street_id" ON "street_translations"("street_id");

-- CreateIndex
CREATE INDEX "idx_street_translations_lang" ON "street_translations"("language_code");

-- CreateIndex
CREATE INDEX "idx_street_translations_name" ON "street_translations"("name");
