/*
  Warnings:

  - You are about to drop the column `section_id` on the `organization` table. All the data in the column will be lost.
  - You are about to drop the column `section_id` on the `organization_version` table. All the data in the column will be lost.
  - You are about to drop the `section` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "organization" DROP CONSTRAINT "organization_section_id_fkey";

-- DropForeignKey
ALTER TABLE "organization_version" DROP CONSTRAINT "organization_version_section_id_fkey";

-- AlterTable
ALTER TABLE "organization" DROP COLUMN "section_id",
ALTER COLUMN "client_id" DROP NOT NULL;

-- AlterTable
ALTER TABLE "organization_version" DROP COLUMN "section_id",
ALTER COLUMN "client_id" DROP NOT NULL;

-- DropTable
DROP TABLE "section";
