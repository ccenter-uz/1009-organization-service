-- AlterTable
ALTER TABLE "category" ADD COLUMN     "region_id" INTEGER;

-- AddForeignKey
ALTER TABLE "category" ADD CONSTRAINT "category_region_id_fkey" FOREIGN KEY ("region_id") REFERENCES "region"("id") ON DELETE SET NULL ON UPDATE CASCADE;
