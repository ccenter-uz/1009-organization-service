-- AddForeignKey
ALTER TABLE "phone_version" ADD CONSTRAINT "phone_version_phone_type_id_fkey" FOREIGN KEY ("phone_type_id") REFERENCES "phone_types"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
