-- AlterTable
ALTER TABLE "category" ADD COLUMN     "city_id" INTEGER;

-- AddForeignKey
ALTER TABLE "category" ADD CONSTRAINT "category_city_id_fkey" FOREIGN KEY ("city_id") REFERENCES "city"("id") ON DELETE SET NULL ON UPDATE CASCADE;
