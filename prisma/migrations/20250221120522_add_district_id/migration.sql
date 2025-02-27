-- AddForeignKey
ALTER TABLE "category" ADD CONSTRAINT "category_district_id_fkey" FOREIGN KEY ("district_id") REFERENCES "district"("id") ON DELETE SET NULL ON UPDATE CASCADE;
