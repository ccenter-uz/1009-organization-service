/*
  Warnings:

  - You are about to drop the column `nearby_id` on the `organization` table. All the data in the column will be lost.
  - You are about to drop the column `nearby_id` on the `organization_version` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "organization" DROP CONSTRAINT "organization_nearby_id_fkey";

-- AlterTable
ALTER TABLE "organization" DROP COLUMN "nearby_id";

-- AlterTable
ALTER TABLE "organization_version" DROP COLUMN "nearby_id";
