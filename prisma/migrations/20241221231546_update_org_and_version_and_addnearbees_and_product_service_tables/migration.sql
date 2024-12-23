/*
  Warnings:

  - You are about to drop the column `maneger` on the `organization` table. All the data in the column will be lost.
  - You are about to drop the column `product_service_category_id` on the `organization` table. All the data in the column will be lost.
  - You are about to drop the column `product_service_sub_category_id` on the `organization` table. All the data in the column will be lost.
  - You are about to drop the column `maneger` on the `organization_version` table. All the data in the column will be lost.
  - You are about to drop the column `product_service_category_id` on the `organization_version` table. All the data in the column will be lost.
  - You are about to drop the column `product_service_sub_category_id` on the `organization_version` table. All the data in the column will be lost.
  - You are about to drop the column `payment_action` on the `payment_types_version` table. All the data in the column will be lost.
  - You are about to drop the column `phone_action` on the `phone_version` table. All the data in the column will be lost.
  - You are about to drop the column `picture_action` on the `picture_version` table. All the data in the column will be lost.
  - Added the required column `description` to the `organization` table without a default value. This is not possible if the table is not empty.
  - Added the required column `manager` to the `organization` table without a default value. This is not possible if the table is not empty.
  - Added the required column `passage_id` to the `organization` table without a default value. This is not possible if the table is not empty.
  - Added the required column `description` to the `organization_version` table without a default value. This is not possible if the table is not empty.
  - Added the required column `manager` to the `organization_version` table without a default value. This is not possible if the table is not empty.
  - Added the required column `passage_id` to the `organization_version` table without a default value. This is not possible if the table is not empty.
  - Added the required column `isSecret` to the `phone` table without a default value. This is not possible if the table is not empty.
  - Added the required column `isSecret` to the `phone_version` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "organization" DROP CONSTRAINT "organization_product_service_category_id_fkey";

-- DropForeignKey
ALTER TABLE "organization" DROP CONSTRAINT "organization_product_service_sub_category_id_fkey";

-- AlterTable
ALTER TABLE "organization" DROP COLUMN "maneger",
DROP COLUMN "product_service_category_id",
DROP COLUMN "product_service_sub_category_id",
ADD COLUMN     "description" VARCHAR NOT NULL,
ADD COLUMN     "manager" VARCHAR NOT NULL,
ADD COLUMN     "passage_id" INTEGER NOT NULL,
ALTER COLUMN "home" SET DATA TYPE VARCHAR,
ALTER COLUMN "apartment" SET DATA TYPE VARCHAR;

-- AlterTable
ALTER TABLE "organization_version" DROP COLUMN "maneger",
DROP COLUMN "product_service_category_id",
DROP COLUMN "product_service_sub_category_id",
ADD COLUMN     "description" VARCHAR NOT NULL,
ADD COLUMN     "manager" VARCHAR NOT NULL,
ADD COLUMN     "passage_id" INTEGER NOT NULL,
ALTER COLUMN "home" SET DATA TYPE VARCHAR,
ALTER COLUMN "apartment" SET DATA TYPE VARCHAR;

-- AlterTable
ALTER TABLE "payment_types_version" DROP COLUMN "payment_action";

-- AlterTable
ALTER TABLE "phone" ADD COLUMN     "isSecret" BOOLEAN NOT NULL;

-- AlterTable
ALTER TABLE "phone_version" DROP COLUMN "phone_action",
ADD COLUMN     "isSecret" BOOLEAN NOT NULL;

-- AlterTable
ALTER TABLE "picture_version" DROP COLUMN "picture_action";

-- CreateTable
CREATE TABLE "product_services" (
    "id" SERIAL NOT NULL,
    "link" VARCHAR NOT NULL,
    "product_service_category_id" INTEGER,
    "product_service_sub_category_id" INTEGER,
    "organization_id" INTEGER NOT NULL,
    "created_at" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3),
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "product_services_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "nearbees" (
    "id" SERIAL NOT NULL,
    "description" VARCHAR NOT NULL,
    "nearby_id" INTEGER NOT NULL,
    "organization_version_id" INTEGER NOT NULL,
    "created_at" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3),
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "nearbees_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "product_services_version" (
    "id" SERIAL NOT NULL,
    "product_service_category_id" INTEGER,
    "product_service_sub_category_id" INTEGER,
    "organization_version_id" INTEGER NOT NULL,
    "created_at" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3),
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "product_services_version_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "nearbees_version" (
    "id" SERIAL NOT NULL,
    "description" VARCHAR NOT NULL,
    "nearby_id" INTEGER NOT NULL,
    "organization_version_id" INTEGER NOT NULL,
    "created_at" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3),
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "nearbees_version_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "organization" ADD CONSTRAINT "organization_passage_id_fkey" FOREIGN KEY ("passage_id") REFERENCES "passage"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "product_services" ADD CONSTRAINT "product_services_product_service_category_id_fkey" FOREIGN KEY ("product_service_category_id") REFERENCES "product_service_category"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "product_services" ADD CONSTRAINT "product_services_product_service_sub_category_id_fkey" FOREIGN KEY ("product_service_sub_category_id") REFERENCES "product_service_sub_category"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "product_services" ADD CONSTRAINT "product_services_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "nearbees" ADD CONSTRAINT "nearbees_nearby_id_fkey" FOREIGN KEY ("nearby_id") REFERENCES "nearby"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "nearbees" ADD CONSTRAINT "nearbees_organization_version_id_fkey" FOREIGN KEY ("organization_version_id") REFERENCES "organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "product_services_version" ADD CONSTRAINT "product_services_version_product_service_category_id_fkey" FOREIGN KEY ("product_service_category_id") REFERENCES "product_service_category"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "product_services_version" ADD CONSTRAINT "product_services_version_product_service_sub_category_id_fkey" FOREIGN KEY ("product_service_sub_category_id") REFERENCES "product_service_sub_category"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "product_services_version" ADD CONSTRAINT "product_services_version_organization_version_id_fkey" FOREIGN KEY ("organization_version_id") REFERENCES "organization_version"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "nearbees_version" ADD CONSTRAINT "nearbees_version_nearby_id_fkey" FOREIGN KEY ("nearby_id") REFERENCES "nearby"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "nearbees_version" ADD CONSTRAINT "nearbees_version_organization_version_id_fkey" FOREIGN KEY ("organization_version_id") REFERENCES "organization_version"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
