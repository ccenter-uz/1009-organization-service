-- DropForeignKey
ALTER TABLE "organization" DROP CONSTRAINT "organization_area_id_fkey";

-- DropForeignKey
ALTER TABLE "organization" DROP CONSTRAINT "organization_avenue_id_fkey";

-- DropForeignKey
ALTER TABLE "organization" DROP CONSTRAINT "organization_district_id_fkey";

-- DropForeignKey
ALTER TABLE "organization" DROP CONSTRAINT "organization_impasse_id_fkey";

-- DropForeignKey
ALTER TABLE "organization" DROP CONSTRAINT "organization_lane_id_fkey";

-- DropForeignKey
ALTER TABLE "organization" DROP CONSTRAINT "organization_passage_id_fkey";

-- DropForeignKey
ALTER TABLE "organization" DROP CONSTRAINT "organization_residential_id_fkey";

-- DropForeignKey
ALTER TABLE "organization" DROP CONSTRAINT "organization_street_id_fkey";

-- DropForeignKey
ALTER TABLE "organization" DROP CONSTRAINT "organization_village_id_fkey";

-- DropForeignKey
ALTER TABLE "organization_version" DROP CONSTRAINT "organization_version_area_id_fkey";

-- DropForeignKey
ALTER TABLE "organization_version" DROP CONSTRAINT "organization_version_avenue_id_fkey";

-- DropForeignKey
ALTER TABLE "organization_version" DROP CONSTRAINT "organization_version_district_id_fkey";

-- DropForeignKey
ALTER TABLE "organization_version" DROP CONSTRAINT "organization_version_impasse_id_fkey";

-- DropForeignKey
ALTER TABLE "organization_version" DROP CONSTRAINT "organization_version_lane_id_fkey";

-- DropForeignKey
ALTER TABLE "organization_version" DROP CONSTRAINT "organization_version_residential_id_fkey";

-- DropForeignKey
ALTER TABLE "organization_version" DROP CONSTRAINT "organization_version_street_id_fkey";

-- DropForeignKey
ALTER TABLE "organization_version" DROP CONSTRAINT "organization_version_village_id_fkey";

-- AlterTable
ALTER TABLE "nearbees" ALTER COLUMN "description" DROP NOT NULL;

-- AlterTable
ALTER TABLE "nearbees_version" ALTER COLUMN "description" DROP NOT NULL;

-- AlterTable
ALTER TABLE "organization" ALTER COLUMN "kvartal" DROP NOT NULL,
ALTER COLUMN "home" DROP NOT NULL,
ALTER COLUMN "account" DROP NOT NULL,
ALTER COLUMN "district_id" DROP NOT NULL,
ALTER COLUMN "village_id" DROP NOT NULL,
ALTER COLUMN "avenue_id" DROP NOT NULL,
ALTER COLUMN "residential_id" DROP NOT NULL,
ALTER COLUMN "area_id" DROP NOT NULL,
ALTER COLUMN "street_id" DROP NOT NULL,
ALTER COLUMN "lane_id" DROP NOT NULL,
ALTER COLUMN "impasse_id" DROP NOT NULL,
ALTER COLUMN "passage_id" DROP NOT NULL;

-- AlterTable
ALTER TABLE "organization_version" ALTER COLUMN "kvartal" DROP NOT NULL,
ALTER COLUMN "home" DROP NOT NULL,
ALTER COLUMN "account" DROP NOT NULL,
ALTER COLUMN "district_id" DROP NOT NULL,
ALTER COLUMN "village_id" DROP NOT NULL,
ALTER COLUMN "avenue_id" DROP NOT NULL,
ALTER COLUMN "residential_id" DROP NOT NULL,
ALTER COLUMN "area_id" DROP NOT NULL,
ALTER COLUMN "street_id" DROP NOT NULL,
ALTER COLUMN "lane_id" DROP NOT NULL,
ALTER COLUMN "impasse_id" DROP NOT NULL,
ALTER COLUMN "passage_id" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "organization" ADD CONSTRAINT "organization_district_id_fkey" FOREIGN KEY ("district_id") REFERENCES "district"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "organization" ADD CONSTRAINT "organization_village_id_fkey" FOREIGN KEY ("village_id") REFERENCES "village"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "organization" ADD CONSTRAINT "organization_avenue_id_fkey" FOREIGN KEY ("avenue_id") REFERENCES "avenue"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "organization" ADD CONSTRAINT "organization_residential_id_fkey" FOREIGN KEY ("residential_id") REFERENCES "residential_area"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "organization" ADD CONSTRAINT "organization_area_id_fkey" FOREIGN KEY ("area_id") REFERENCES "area"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "organization" ADD CONSTRAINT "organization_street_id_fkey" FOREIGN KEY ("street_id") REFERENCES "street"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "organization" ADD CONSTRAINT "organization_lane_id_fkey" FOREIGN KEY ("lane_id") REFERENCES "lane"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "organization" ADD CONSTRAINT "organization_impasse_id_fkey" FOREIGN KEY ("impasse_id") REFERENCES "impasse"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "organization" ADD CONSTRAINT "organization_passage_id_fkey" FOREIGN KEY ("passage_id") REFERENCES "passage"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "organization_version" ADD CONSTRAINT "organization_version_district_id_fkey" FOREIGN KEY ("district_id") REFERENCES "district"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "organization_version" ADD CONSTRAINT "organization_version_village_id_fkey" FOREIGN KEY ("village_id") REFERENCES "village"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "organization_version" ADD CONSTRAINT "organization_version_avenue_id_fkey" FOREIGN KEY ("avenue_id") REFERENCES "avenue"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "organization_version" ADD CONSTRAINT "organization_version_residential_id_fkey" FOREIGN KEY ("residential_id") REFERENCES "residential_area"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "organization_version" ADD CONSTRAINT "organization_version_area_id_fkey" FOREIGN KEY ("area_id") REFERENCES "area"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "organization_version" ADD CONSTRAINT "organization_version_street_id_fkey" FOREIGN KEY ("street_id") REFERENCES "street"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "organization_version" ADD CONSTRAINT "organization_version_lane_id_fkey" FOREIGN KEY ("lane_id") REFERENCES "lane"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "organization_version" ADD CONSTRAINT "organization_version_impasse_id_fkey" FOREIGN KEY ("impasse_id") REFERENCES "impasse"("id") ON DELETE SET NULL ON UPDATE CASCADE;
