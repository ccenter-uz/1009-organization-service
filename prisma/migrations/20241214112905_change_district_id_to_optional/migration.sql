-- DropForeignKey
ALTER TABLE "area" DROP CONSTRAINT "area_district_id_fkey";

-- DropForeignKey
ALTER TABLE "avenue" DROP CONSTRAINT "avenue_district_id_fkey";

-- DropForeignKey
ALTER TABLE "impasse" DROP CONSTRAINT "impasse_district_id_fkey";

-- DropForeignKey
ALTER TABLE "lane" DROP CONSTRAINT "lane_district_id_fkey";

-- DropForeignKey
ALTER TABLE "passage" DROP CONSTRAINT "passage_district_id_fkey";

-- DropForeignKey
ALTER TABLE "residential_area" DROP CONSTRAINT "residential_area_district_id_fkey";

-- DropForeignKey
ALTER TABLE "street" DROP CONSTRAINT "street_district_id_fkey";

-- DropForeignKey
ALTER TABLE "village" DROP CONSTRAINT "village_district_id_fkey";

-- AlterTable
ALTER TABLE "area" ALTER COLUMN "district_id" DROP NOT NULL;

-- AlterTable
ALTER TABLE "avenue" ALTER COLUMN "district_id" DROP NOT NULL;

-- AlterTable
ALTER TABLE "impasse" ALTER COLUMN "district_id" DROP NOT NULL;

-- AlterTable
ALTER TABLE "lane" ALTER COLUMN "district_id" DROP NOT NULL;

-- AlterTable
ALTER TABLE "passage" ALTER COLUMN "district_id" DROP NOT NULL;

-- AlterTable
ALTER TABLE "residential_area" ALTER COLUMN "district_id" DROP NOT NULL;

-- AlterTable
ALTER TABLE "street" ALTER COLUMN "district_id" DROP NOT NULL;

-- AlterTable
ALTER TABLE "village" ALTER COLUMN "district_id" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "passage" ADD CONSTRAINT "passage_district_id_fkey" FOREIGN KEY ("district_id") REFERENCES "district"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "area" ADD CONSTRAINT "area_district_id_fkey" FOREIGN KEY ("district_id") REFERENCES "district"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "avenue" ADD CONSTRAINT "avenue_district_id_fkey" FOREIGN KEY ("district_id") REFERENCES "district"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "residential_area" ADD CONSTRAINT "residential_area_district_id_fkey" FOREIGN KEY ("district_id") REFERENCES "district"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "impasse" ADD CONSTRAINT "impasse_district_id_fkey" FOREIGN KEY ("district_id") REFERENCES "district"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "village" ADD CONSTRAINT "village_district_id_fkey" FOREIGN KEY ("district_id") REFERENCES "district"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "lane" ADD CONSTRAINT "lane_district_id_fkey" FOREIGN KEY ("district_id") REFERENCES "district"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "street" ADD CONSTRAINT "street_district_id_fkey" FOREIGN KEY ("district_id") REFERENCES "district"("id") ON DELETE SET NULL ON UPDATE CASCADE;
