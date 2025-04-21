-- AlterTable
ALTER TABLE "category" ADD COLUMN     "delete_reason" TEXT;

-- AlterTable
ALTER TABLE "product_service_category" ADD COLUMN     "delete_reason" TEXT;

-- AlterTable
ALTER TABLE "product_service_sub_category" ADD COLUMN     "delete_reason" TEXT;

-- AlterTable
ALTER TABLE "sub_category" ADD COLUMN     "delete_reason" TEXT;
