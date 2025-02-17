/*
  Warnings:

  - You are about to drop the column `additional_category_id` on the `additional_content` table. All the data in the column will be lost.
  - You are about to drop the column `additional_id` on the `additional_content_content_translations` table. All the data in the column will be lost.
  - You are about to drop the column `additional_id` on the `additional_table_content_translations` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "additional_content" DROP CONSTRAINT "additional_content_additional_category_id_fkey";

-- DropForeignKey
ALTER TABLE "additional_content_content_translations" DROP CONSTRAINT "additional_content_content_translations_additional_id_fkey";

-- DropForeignKey
ALTER TABLE "additional_table_content_translations" DROP CONSTRAINT "additional_table_content_translations_additional_id_fkey";

-- AlterTable
ALTER TABLE "additional_content" DROP COLUMN "additional_category_id",
ADD COLUMN     "additional_id" INTEGER NOT NULL DEFAULT 1;

-- AlterTable
ALTER TABLE "additional_content_content_translations" DROP COLUMN "additional_id",
ADD COLUMN     "additional_content_id" INTEGER NOT NULL DEFAULT 1;

-- AlterTable
ALTER TABLE "additional_table_content_translations" DROP COLUMN "additional_id",
ADD COLUMN     "additional_table_id" INTEGER NOT NULL DEFAULT 1;

-- AddForeignKey
ALTER TABLE "additional_content" ADD CONSTRAINT "additional_content_additional_id_fkey" FOREIGN KEY ("additional_id") REFERENCES "additional"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "additional_content_content_translations" ADD CONSTRAINT "additional_content_content_translations_additional_content_fkey" FOREIGN KEY ("additional_content_id") REFERENCES "additional_content"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "additional_table_content_translations" ADD CONSTRAINT "additional_table_content_translations_additional_table_id_fkey" FOREIGN KEY ("additional_table_id") REFERENCES "additional_table"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
