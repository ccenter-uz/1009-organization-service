/*
  Warnings:

  - You are about to drop the column `updated_at` on the `district` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "district" DROP COLUMN "updated_at",
ADD COLUMN     "upd ated_at" TIMESTAMP(3);

-- CreateTable
CREATE TABLE "street" (
    "id" SERIAL NOT NULL,
    "region_id" INTEGER NOT NULL,
    "city_id" INTEGER NOT NULL,
    "district_id" INTEGER NOT NULL,
    "index" INTEGER NOT NULL,
    "status" SMALLINT NOT NULL DEFAULT 1,
    "staff_id" INTEGER NOT NULL,
    "created_at" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3),
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "street_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "street_translations" (
    "id" SERIAL NOT NULL,
    "street_id" INTEGER NOT NULL,
    "language_code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "created_at" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3),

    CONSTRAINT "street_translations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "street_old_name_translations" (
    "id" SERIAL NOT NULL,
    "street_id" INTEGER NOT NULL,
    "language_code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "created_at" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3),

    CONSTRAINT "street_old_name_translations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "street_new_name_translations" (
    "id" SERIAL NOT NULL,
    "street_id" INTEGER NOT NULL,
    "language_code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "created_at" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3),

    CONSTRAINT "street_new_name_translations_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "street" ADD CONSTRAINT "street_region_id_fkey" FOREIGN KEY ("region_id") REFERENCES "region"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "street" ADD CONSTRAINT "street_city_id_fkey" FOREIGN KEY ("city_id") REFERENCES "city"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "street" ADD CONSTRAINT "street_district_id_fkey" FOREIGN KEY ("district_id") REFERENCES "district"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "street_translations" ADD CONSTRAINT "street_translations_street_id_fkey" FOREIGN KEY ("street_id") REFERENCES "street"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "street_old_name_translations" ADD CONSTRAINT "street_old_name_translations_street_id_fkey" FOREIGN KEY ("street_id") REFERENCES "street"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "street_new_name_translations" ADD CONSTRAINT "street_new_name_translations_street_id_fkey" FOREIGN KEY ("street_id") REFERENCES "street"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
