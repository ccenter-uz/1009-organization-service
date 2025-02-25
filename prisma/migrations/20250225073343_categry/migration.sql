/*
  Warnings:

  - Made the column `city_id` on table `category` required. This step will fail if there are existing NULL values in that column.
  - Made the column `region_id` on table `category` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE "category" DROP CONSTRAINT "category_city_id_fkey";

-- DropForeignKey
ALTER TABLE "category" DROP CONSTRAINT "category_region_id_fkey";

-- AlterTable
ALTER TABLE "category" ALTER COLUMN "city_id" SET NOT NULL,
ALTER COLUMN "region_id" SET NOT NULL;

-- AddForeignKey
ALTER TABLE "category" ADD CONSTRAINT "category_city_id_fkey" FOREIGN KEY ("city_id") REFERENCES "city"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "category" ADD CONSTRAINT "category_region_id_fkey" FOREIGN KEY ("region_id") REFERENCES "region"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
