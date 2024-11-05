/*
  Warnings:

  - You are about to drop the column `category_id` on the `segment_translations` table. All the data in the column will be lost.
  - You are about to drop the column `category_id` on the `sub_category_translations` table. All the data in the column will be lost.
  - Added the required column `segment_id` to the `segment_translations` table without a default value. This is not possible if the table is not empty.
  - Added the required column `sub_category_id` to the `sub_category_translations` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "segment_translations" DROP CONSTRAINT "segment_translations_category_id_fkey";

-- DropForeignKey
ALTER TABLE "sub_category_translations" DROP CONSTRAINT "sub_category_translations_category_id_fkey";

-- AlterTable
ALTER TABLE "segment_translations" DROP COLUMN "category_id",
ADD COLUMN     "segment_id" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "sub_category_translations" DROP COLUMN "category_id",
ADD COLUMN     "sub_category_id" INTEGER NOT NULL;

-- CreateTable
CREATE TABLE "product_service_category" (
    "id" SERIAL NOT NULL,
    "staff_number" INTEGER NOT NULL,
    "status" SMALLINT NOT NULL DEFAULT 1,
    "created_at" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3),
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "product_service_category_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "product_service_category_translations" (
    "id" SERIAL NOT NULL,
    "product_service_category_id" INTEGER NOT NULL,
    "language_code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "created_at" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3),

    CONSTRAINT "product_service_category_translations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "product_service_sub_category" (
    "id" SERIAL NOT NULL,
    "staff_number" INTEGER NOT NULL,
    "status" SMALLINT NOT NULL DEFAULT 1,
    "product_service_category_id" INTEGER NOT NULL,
    "created_at" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3),
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "product_service_sub_category_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "product_service_sub_category_translations" (
    "id" SERIAL NOT NULL,
    "product_service_sub_category_id" INTEGER NOT NULL,
    "language_code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "created_at" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3),

    CONSTRAINT "product_service_sub_category_translations_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "sub_category_translations" ADD CONSTRAINT "sub_category_translations_sub_category_id_fkey" FOREIGN KEY ("sub_category_id") REFERENCES "sub_category"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "segment_translations" ADD CONSTRAINT "segment_translations_segment_id_fkey" FOREIGN KEY ("segment_id") REFERENCES "segment"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "product_service_category_translations" ADD CONSTRAINT "product_service_category_translations_product_service_cate_fkey" FOREIGN KEY ("product_service_category_id") REFERENCES "product_service_category"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "product_service_sub_category" ADD CONSTRAINT "product_service_sub_category_product_service_category_id_fkey" FOREIGN KEY ("product_service_category_id") REFERENCES "product_service_category"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "product_service_sub_category_translations" ADD CONSTRAINT "product_service_sub_category_translations_product_service__fkey" FOREIGN KEY ("product_service_sub_category_id") REFERENCES "product_service_sub_category"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
