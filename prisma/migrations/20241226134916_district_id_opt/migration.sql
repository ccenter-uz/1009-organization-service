-- DropForeignKey
ALTER TABLE "organization" DROP CONSTRAINT "organization_district_id_fkey";

-- DropForeignKey
ALTER TABLE "organization_version" DROP CONSTRAINT "organization_version_district_id_fkey";

-- AlterTable
ALTER TABLE "organization" ALTER COLUMN "district_id" DROP NOT NULL;

-- AlterTable
ALTER TABLE "organization_version" ALTER COLUMN "district_id" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "organization" ADD CONSTRAINT "organization_district_id_fkey" FOREIGN KEY ("district_id") REFERENCES "district"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "organization_version" ADD CONSTRAINT "organization_version_district_id_fkey" FOREIGN KEY ("district_id") REFERENCES "district"("id") ON DELETE SET NULL ON UPDATE CASCADE;
