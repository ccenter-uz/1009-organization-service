/*
  Warnings:

  - You are about to drop the column `staff_id` on the `area` table. All the data in the column will be lost.
  - You are about to drop the column `staff_id` on the `avenue` table. All the data in the column will be lost.
  - You are about to drop the column `staff_id` on the `district` table. All the data in the column will be lost.
  - You are about to drop the column `staff_id` on the `impasse` table. All the data in the column will be lost.
  - You are about to drop the column `staff_id` on the `lane` table. All the data in the column will be lost.
  - You are about to drop the column `staff_id` on the `passage` table. All the data in the column will be lost.
  - You are about to drop the column `staff_id` on the `residential_area` table. All the data in the column will be lost.
  - You are about to drop the column `staff_id` on the `street` table. All the data in the column will be lost.
  - You are about to drop the column `staff_id` on the `village` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "area" DROP COLUMN "staff_id",
ADD COLUMN     "staff_number" VARCHAR(40) NOT NULL DEFAULT '1';

-- AlterTable
ALTER TABLE "avenue" DROP COLUMN "staff_id",
ADD COLUMN     "staff_number" VARCHAR(40) NOT NULL DEFAULT '1';

-- AlterTable
ALTER TABLE "category" ALTER COLUMN "staff_number" SET DEFAULT '1',
ALTER COLUMN "staff_number" SET DATA TYPE VARCHAR(40);

-- AlterTable
ALTER TABLE "district" DROP COLUMN "staff_id",
ADD COLUMN     "staff_number" VARCHAR(40) NOT NULL DEFAULT '1';

-- AlterTable
ALTER TABLE "impasse" DROP COLUMN "staff_id",
ADD COLUMN     "staff_number" VARCHAR(40) NOT NULL DEFAULT '1';

-- AlterTable
ALTER TABLE "lane" DROP COLUMN "staff_id",
ADD COLUMN     "staff_number" VARCHAR(40) NOT NULL DEFAULT '1';

-- AlterTable
ALTER TABLE "main_organization" ALTER COLUMN "staff_number" SET DEFAULT '1';

-- AlterTable
ALTER TABLE "nearby" ALTER COLUMN "staff_number" SET DEFAULT '1',
ALTER COLUMN "staff_number" SET DATA TYPE VARCHAR(40);

-- AlterTable
ALTER TABLE "nearby_category" ALTER COLUMN "staff_number" SET DEFAULT '1',
ALTER COLUMN "staff_number" SET DATA TYPE VARCHAR(40);

-- AlterTable
ALTER TABLE "passage" DROP COLUMN "staff_id",
ADD COLUMN     "staff_number" VARCHAR(40) NOT NULL DEFAULT '1';

-- AlterTable
ALTER TABLE "product_service_category" ALTER COLUMN "staff_number" SET DEFAULT '1',
ALTER COLUMN "staff_number" SET DATA TYPE VARCHAR(40);

-- AlterTable
ALTER TABLE "product_service_sub_category" ALTER COLUMN "staff_number" SET DEFAULT '1',
ALTER COLUMN "staff_number" SET DATA TYPE VARCHAR(40);

-- AlterTable
ALTER TABLE "residential_area" DROP COLUMN "staff_id",
ADD COLUMN     "staff_number" VARCHAR(40) NOT NULL DEFAULT '1';

-- AlterTable
ALTER TABLE "street" DROP COLUMN "staff_id",
ADD COLUMN     "staff_number" VARCHAR(40) NOT NULL DEFAULT '1';

-- AlterTable
ALTER TABLE "sub_category" ALTER COLUMN "staff_number" SET DEFAULT '1',
ALTER COLUMN "staff_number" SET DATA TYPE VARCHAR(40);

-- AlterTable
ALTER TABLE "village" DROP COLUMN "staff_id",
ADD COLUMN     "staff_number" VARCHAR(40) NOT NULL DEFAULT '1';
