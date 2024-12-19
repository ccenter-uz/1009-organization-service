/*
  Warnings:

  - You are about to drop the column `payment_types` on the `organization_version` table. All the data in the column will be lost.
  - Added the required column `organization_id` to the `organization_version` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "organization_version" DROP COLUMN "payment_types",
ADD COLUMN     "organization_id" INTEGER NOT NULL;

-- AddForeignKey
ALTER TABLE "organization_version" ADD CONSTRAINT "organization_version_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
