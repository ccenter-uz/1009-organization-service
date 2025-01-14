/*
  Warnings:

  - You are about to drop the column `legel_name` on the `organization` table. All the data in the column will be lost.
  - You are about to drop the column `legel_name` on the `organization_version` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "organization" DROP CONSTRAINT "organization_segment_id_fkey";

-- DropForeignKey
ALTER TABLE "organization_version" DROP CONSTRAINT "organization_version_segment_id_fkey";

-- AlterTable
ALTER TABLE "organization" DROP COLUMN "legel_name",
ADD COLUMN     "legal_name" VARCHAR,
ALTER COLUMN "inn" DROP NOT NULL,
ALTER COLUMN "bank_number" DROP NOT NULL,
ALTER COLUMN "mail" DROP NOT NULL,
ALTER COLUMN "segment_id" DROP NOT NULL;

-- AlterTable
ALTER TABLE "organization_version" DROP COLUMN "legel_name",
ADD COLUMN     "legal_name" VARCHAR,
ALTER COLUMN "inn" DROP NOT NULL,
ALTER COLUMN "bank_number" DROP NOT NULL,
ALTER COLUMN "segment_id" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "organization" ADD CONSTRAINT "organization_segment_id_fkey" FOREIGN KEY ("segment_id") REFERENCES "segment"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "organization_version" ADD CONSTRAINT "organization_version_segment_id_fkey" FOREIGN KEY ("segment_id") REFERENCES "segment"("id") ON DELETE SET NULL ON UPDATE CASCADE;
