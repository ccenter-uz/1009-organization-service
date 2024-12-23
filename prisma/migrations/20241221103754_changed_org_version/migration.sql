-- AddForeignKey
ALTER TABLE "organization_version" ADD CONSTRAINT "organization_version_main_organization_id_fkey" FOREIGN KEY ("main_organization_id") REFERENCES "main_organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "organization_version" ADD CONSTRAINT "organization_version_sub_category_id_fkey" FOREIGN KEY ("sub_category_id") REFERENCES "sub_category"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "organization_version" ADD CONSTRAINT "organization_version_product_service_category_id_fkey" FOREIGN KEY ("product_service_category_id") REFERENCES "product_service_category"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "organization_version" ADD CONSTRAINT "organization_version_product_service_sub_category_id_fkey" FOREIGN KEY ("product_service_sub_category_id") REFERENCES "product_service_sub_category"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "organization_version" ADD CONSTRAINT "organization_version_region_id_fkey" FOREIGN KEY ("region_id") REFERENCES "region"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "organization_version" ADD CONSTRAINT "organization_version_city_id_fkey" FOREIGN KEY ("city_id") REFERENCES "city"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "organization_version" ADD CONSTRAINT "organization_version_district_id_fkey" FOREIGN KEY ("district_id") REFERENCES "district"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "organization_version" ADD CONSTRAINT "organization_version_village_id_fkey" FOREIGN KEY ("village_id") REFERENCES "village"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "organization_version" ADD CONSTRAINT "organization_version_avenue_id_fkey" FOREIGN KEY ("avenue_id") REFERENCES "avenue"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "organization_version" ADD CONSTRAINT "organization_version_residential_id_fkey" FOREIGN KEY ("residential_id") REFERENCES "residential_area"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "organization_version" ADD CONSTRAINT "organization_version_area_id_fkey" FOREIGN KEY ("area_id") REFERENCES "area"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "organization_version" ADD CONSTRAINT "organization_version_street_id_fkey" FOREIGN KEY ("street_id") REFERENCES "street"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "organization_version" ADD CONSTRAINT "organization_version_lane_id_fkey" FOREIGN KEY ("lane_id") REFERENCES "lane"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "organization_version" ADD CONSTRAINT "organization_version_impasse_id_fkey" FOREIGN KEY ("impasse_id") REFERENCES "impasse"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "organization_version" ADD CONSTRAINT "organization_version_nearby_id_fkey" FOREIGN KEY ("nearby_id") REFERENCES "nearby"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "organization_version" ADD CONSTRAINT "organization_version_segment_id_fkey" FOREIGN KEY ("segment_id") REFERENCES "segment"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "organization_version" ADD CONSTRAINT "organization_version_section_id_fkey" FOREIGN KEY ("section_id") REFERENCES "section"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
