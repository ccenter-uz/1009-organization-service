/*
  Warnings:

  - You are about to drop the column `lagel_name` on the `organization` table. All the data in the column will be lost.
  - You are about to drop the column `payment_types` on the `organization` table. All the data in the column will be lost.
  - You are about to drop the column `lagel_name` on the `organization_version` table. All the data in the column will be lost.
  - Added the required column `legel_name` to the `organization` table without a default value. This is not possible if the table is not empty.
  - Added the required column `staff_number` to the `organization` table without a default value. This is not possible if the table is not empty.
  - Added the required column `legel_name` to the `organization_version` table without a default value. This is not possible if the table is not empty.
  - Added the required column `staff_number` to the `organization_version` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "organization" DROP COLUMN "lagel_name",
DROP COLUMN "payment_types",
ADD COLUMN     "legel_name" VARCHAR NOT NULL,
ADD COLUMN     "staff_number" VARCHAR NOT NULL,
ALTER COLUMN "status" SET DATA TYPE VARCHAR;

-- AlterTable
ALTER TABLE "organization_version" DROP COLUMN "lagel_name",
ADD COLUMN     "legel_name" VARCHAR NOT NULL,
ADD COLUMN     "staff_number" INTEGER NOT NULL;

-- CreateTable
CREATE TABLE "payment_types" (
    "id" SERIAL NOT NULL,
    "cash" BOOLEAN NOT NULL,
    "terminal" BOOLEAN NOT NULL,
    "transfer" BOOLEAN NOT NULL,
    "organization_id" INTEGER NOT NULL,
    "created_at" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3),

    CONSTRAINT "payment_types_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "payment_types_version" (
    "id" SERIAL NOT NULL,
    "cash" BOOLEAN NOT NULL,
    "terminal" BOOLEAN NOT NULL,
    "transfer" BOOLEAN NOT NULL,
    "staff_number" VARCHAR(40) NOT NULL,
    "organization_version_id" INTEGER NOT NULL,
    "payment_action" VARCHAR NOT NULL,
    "created_at" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3),

    CONSTRAINT "payment_types_version_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "payment_types" ADD CONSTRAINT "payment_types_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payment_types_version" ADD CONSTRAINT "payment_types_version_organization_version_id_fkey" FOREIGN KEY ("organization_version_id") REFERENCES "organization_version"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
