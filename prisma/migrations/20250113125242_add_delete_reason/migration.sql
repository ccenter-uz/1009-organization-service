/*
  Warnings:

  - You are about to drop the column `descrioption` on the `organization_version` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "organization" ADD COLUMN     "delete_reason" TEXT;

-- AlterTable
ALTER TABLE "organization_version" DROP COLUMN "descrioption",
ADD COLUMN     "delete_reason" TEXT,
ADD COLUMN     "reject_reason" VARCHAR;
