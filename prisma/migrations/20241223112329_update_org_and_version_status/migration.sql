/*
  Warnings:

  - Changed the type of `status` on the `organization` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `status` on the `organization_version` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- AlterTable
ALTER TABLE "organization" DROP COLUMN "status",
ADD COLUMN     "status" SMALLINT NOT NULL;

-- AlterTable
ALTER TABLE "organization_version" DROP COLUMN "status",
ADD COLUMN     "status" SMALLINT NOT NULL;
