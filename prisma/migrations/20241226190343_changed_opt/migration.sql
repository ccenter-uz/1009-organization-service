-- DropForeignKey
ALTER TABLE "organization" DROP CONSTRAINT "organization_street_id_fkey";

-- AlterTable
ALTER TABLE "organization" ALTER COLUMN "street_id" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "organization" ADD CONSTRAINT "organization_street_id_fkey" FOREIGN KEY ("street_id") REFERENCES "street"("id") ON DELETE SET NULL ON UPDATE CASCADE;
