-- AlterTable
ALTER TABLE "product_service_category_translations" ADD COLUMN     "search_vector" tsvector;

-- AlterTable
ALTER TABLE "product_service_sub_category_translations" ADD COLUMN     "search_vector" tsvector;
