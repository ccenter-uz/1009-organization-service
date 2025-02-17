-- DropForeignKey
ALTER TABLE "additional_content" DROP CONSTRAINT "additional_content_additional_id_fkey";

-- DropForeignKey
ALTER TABLE "additional_content_content_translations" DROP CONSTRAINT "additional_content_content_translations_additional_content_fkey";

-- DropForeignKey
ALTER TABLE "additional_content_name_translations" DROP CONSTRAINT "additional_content_name_translations_additional_content_id_fkey";

-- DropForeignKey
ALTER TABLE "additional_table_content_translations" DROP CONSTRAINT "additional_table_content_translations_additional_table_id_fkey";

-- DropForeignKey
ALTER TABLE "additional_table_name_translations" DROP CONSTRAINT "additional_table_name_translations_additional_table_id_fkey";

-- AddForeignKey
ALTER TABLE "additional_content" ADD CONSTRAINT "additional_content_additional_id_fkey" FOREIGN KEY ("additional_id") REFERENCES "additional"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "additional_content_name_translations" ADD CONSTRAINT "additional_content_name_translations_additional_content_id_fkey" FOREIGN KEY ("additional_content_id") REFERENCES "additional_content"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "additional_content_content_translations" ADD CONSTRAINT "additional_content_content_translations_additional_content_fkey" FOREIGN KEY ("additional_content_id") REFERENCES "additional_content"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "additional_table_name_translations" ADD CONSTRAINT "additional_table_name_translations_additional_table_id_fkey" FOREIGN KEY ("additional_table_id") REFERENCES "additional_table"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "additional_table_content_translations" ADD CONSTRAINT "additional_table_content_translations_additional_table_id_fkey" FOREIGN KEY ("additional_table_id") REFERENCES "additional_table"("id") ON DELETE CASCADE ON UPDATE CASCADE;
