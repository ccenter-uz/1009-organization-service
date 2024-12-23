/*
  Warnings:

  - You are about to drop the column `staff_number` on the `payment_types_version` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "organization_version" ALTER COLUMN "status" SET DATA TYPE VARCHAR,
ALTER COLUMN "staff_number" SET DATA TYPE VARCHAR;

-- AlterTable
ALTER TABLE "payment_types_version" DROP COLUMN "staff_number";
