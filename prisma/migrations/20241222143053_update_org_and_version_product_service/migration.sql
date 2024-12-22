/*
  Warnings:

  - You are about to drop the column `nearby_description` on the `organization` table. All the data in the column will be lost.
  - You are about to drop the column `nearby_description` on the `organization_version` table. All the data in the column will be lost.
  - You are about to drop the column `link` on the `product_services` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "organization" DROP COLUMN "nearby_description";

-- AlterTable
ALTER TABLE "organization_version" DROP COLUMN "nearby_description";

-- AlterTable
ALTER TABLE "product_services" DROP COLUMN "link";
