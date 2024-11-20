/*
  Warnings:

  - You are about to drop the column `city_id` on the `district_translations` table. All the data in the column will be lost.
  - Added the required column `district_id` to the `district_translations` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "district_translations" DROP CONSTRAINT "district_translations_city_id_fkey";

-- AlterTable
ALTER TABLE "district" ADD COLUMN     "index" SMALLINT NOT NULL DEFAULT 1,
ADD COLUMN     "staff_id" SMALLINT NOT NULL DEFAULT 1;

-- AlterTable
ALTER TABLE "district_translations" DROP COLUMN "city_id",
ADD COLUMN     "district_id" INTEGER NOT NULL;

-- CreateTable
CREATE TABLE "district_new_name_translations" (
    "id" SERIAL NOT NULL,
    "district_id" INTEGER NOT NULL,
    "language_code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "created_at" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3),

    CONSTRAINT "district_new_name_translations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "district_old_name_translations" (
    "id" SERIAL NOT NULL,
    "district_id" INTEGER NOT NULL,
    "language_code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "created_at" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3),

    CONSTRAINT "district_old_name_translations_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "district_translations" ADD CONSTRAINT "district_translations_district_id_fkey" FOREIGN KEY ("district_id") REFERENCES "district"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "district_new_name_translations" ADD CONSTRAINT "district_new_name_translations_district_id_fkey" FOREIGN KEY ("district_id") REFERENCES "district"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "district_old_name_translations" ADD CONSTRAINT "district_old_name_translations_district_id_fkey" FOREIGN KEY ("district_id") REFERENCES "district"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
