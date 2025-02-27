-- AddForeignKey
ALTER TABLE "nearby" ADD CONSTRAINT "nearby_district_id_fkey" FOREIGN KEY ("district_id") REFERENCES "district"("id") ON DELETE SET NULL ON UPDATE CASCADE;
