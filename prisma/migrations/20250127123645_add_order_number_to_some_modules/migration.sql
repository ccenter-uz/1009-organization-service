-- AlterTable
ALTER TABLE "area" ADD COLUMN     "order_number" INTEGER;

-- AlterTable
ALTER TABLE "avenue" ADD COLUMN     "order_number" INTEGER;

-- AlterTable
ALTER TABLE "district" ADD COLUMN     "order_number" INTEGER;

-- AlterTable
ALTER TABLE "impasse" ADD COLUMN     "order_number" INTEGER;

-- AlterTable
ALTER TABLE "lane" ADD COLUMN     "order_number" INTEGER;

-- AlterTable
ALTER TABLE "main_organization" ADD COLUMN     "order_number" INTEGER;

-- AlterTable
ALTER TABLE "nearby" ADD COLUMN     "order_number" INTEGER;

-- AlterTable
ALTER TABLE "nearby_category" ADD COLUMN     "order_number" INTEGER;

-- AlterTable
ALTER TABLE "phone_types" ADD COLUMN     "order_number" INTEGER;

-- AlterTable
ALTER TABLE "product_service_category" ADD COLUMN     "order_number" INTEGER;

-- AlterTable
ALTER TABLE "product_service_sub_category" ADD COLUMN     "order_number" INTEGER;

-- AlterTable
ALTER TABLE "residential_area" ADD COLUMN     "order_number" INTEGER;

-- AlterTable
ALTER TABLE "segment" ADD COLUMN     "order_number" INTEGER,
ALTER COLUMN "name" DROP DEFAULT;

-- AlterTable
ALTER TABLE "street" ADD COLUMN     "order_number" INTEGER;

-- AlterTable
ALTER TABLE "sub_category" ADD COLUMN     "order_number" INTEGER;

-- AlterTable
ALTER TABLE "village" ADD COLUMN     "order_number" INTEGER;
