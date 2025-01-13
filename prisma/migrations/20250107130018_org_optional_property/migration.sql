-- DropForeignKey
ALTER TABLE "organization" DROP CONSTRAINT "organization_city_id_fkey";

-- DropForeignKey
ALTER TABLE "organization" DROP CONSTRAINT "organization_main_organization_id_fkey";

-- DropForeignKey
ALTER TABLE "organization" DROP CONSTRAINT "organization_region_id_fkey";

-- DropForeignKey
ALTER TABLE "organization" DROP CONSTRAINT "organization_sub_category_id_fkey";

-- DropForeignKey
ALTER TABLE "organization_version" DROP CONSTRAINT "organization_version_city_id_fkey";

-- DropForeignKey
ALTER TABLE "organization_version" DROP CONSTRAINT "organization_version_main_organization_id_fkey";

-- DropForeignKey
ALTER TABLE "organization_version" DROP CONSTRAINT "organization_version_region_id_fkey";

-- DropForeignKey
ALTER TABLE "organization_version" DROP CONSTRAINT "organization_version_sub_category_id_fkey";

-- AlterTable
ALTER TABLE "organization" ALTER COLUMN "secret" DROP NOT NULL,
ALTER COLUMN "apartment" DROP NOT NULL,
ALTER COLUMN "index" DROP NOT NULL,
ALTER COLUMN "work_time" DROP NOT NULL,
ALTER COLUMN "transport" DROP NOT NULL,
ALTER COLUMN "main_organization_id" DROP NOT NULL,
ALTER COLUMN "sub_category_id" DROP NOT NULL,
ALTER COLUMN "region_id" DROP NOT NULL,
ALTER COLUMN "city_id" DROP NOT NULL,
ALTER COLUMN "legel_name" DROP NOT NULL,
ALTER COLUMN "staff_number" DROP NOT NULL,
ALTER COLUMN "description" DROP NOT NULL,
ALTER COLUMN "manager" DROP NOT NULL,
ALTER COLUMN "status" DROP NOT NULL;

-- AlterTable
ALTER TABLE "organization_version" ALTER COLUMN "secret" DROP NOT NULL,
ALTER COLUMN "apartment" DROP NOT NULL,
ALTER COLUMN "index" DROP NOT NULL,
ALTER COLUMN "work_time" DROP NOT NULL,
ALTER COLUMN "transport" DROP NOT NULL,
ALTER COLUMN "main_organization_id" DROP NOT NULL,
ALTER COLUMN "sub_category_id" DROP NOT NULL,
ALTER COLUMN "region_id" DROP NOT NULL,
ALTER COLUMN "city_id" DROP NOT NULL,
ALTER COLUMN "legel_name" DROP NOT NULL,
ALTER COLUMN "staff_number" DROP NOT NULL,
ALTER COLUMN "description" DROP NOT NULL,
ALTER COLUMN "manager" DROP NOT NULL,
ALTER COLUMN "status" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "organization" ADD CONSTRAINT "organization_main_organization_id_fkey" FOREIGN KEY ("main_organization_id") REFERENCES "main_organization"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "organization" ADD CONSTRAINT "organization_sub_category_id_fkey" FOREIGN KEY ("sub_category_id") REFERENCES "sub_category"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "organization" ADD CONSTRAINT "organization_region_id_fkey" FOREIGN KEY ("region_id") REFERENCES "region"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "organization" ADD CONSTRAINT "organization_city_id_fkey" FOREIGN KEY ("city_id") REFERENCES "city"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "organization_version" ADD CONSTRAINT "organization_version_main_organization_id_fkey" FOREIGN KEY ("main_organization_id") REFERENCES "main_organization"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "organization_version" ADD CONSTRAINT "organization_version_sub_category_id_fkey" FOREIGN KEY ("sub_category_id") REFERENCES "sub_category"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "organization_version" ADD CONSTRAINT "organization_version_region_id_fkey" FOREIGN KEY ("region_id") REFERENCES "region"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "organization_version" ADD CONSTRAINT "organization_version_city_id_fkey" FOREIGN KEY ("city_id") REFERENCES "city"("id") ON DELETE SET NULL ON UPDATE CASCADE;
