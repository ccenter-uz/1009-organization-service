-- AlterTable
ALTER TABLE "area" ALTER COLUMN "index" SET DATA TYPE BIGINT;

-- AlterTable
ALTER TABLE "avenue" ALTER COLUMN "index" SET DATA TYPE BIGINT;

-- AlterTable
ALTER TABLE "district" ALTER COLUMN "index" DROP DEFAULT,
ALTER COLUMN "index" SET DATA TYPE BIGINT;

-- AlterTable
ALTER TABLE "impasse" ALTER COLUMN "index" SET DATA TYPE BIGINT;

-- AlterTable
ALTER TABLE "lane" ALTER COLUMN "index" SET DATA TYPE BIGINT;

-- AlterTable
ALTER TABLE "organization" ALTER COLUMN "index" SET DATA TYPE BIGINT;

-- AlterTable
ALTER TABLE "organization_version" ALTER COLUMN "index" SET DATA TYPE BIGINT;

-- AlterTable
ALTER TABLE "passage" ALTER COLUMN "index" SET DATA TYPE BIGINT;

-- AlterTable
ALTER TABLE "residential_area" ALTER COLUMN "index" SET DATA TYPE BIGINT;

-- AlterTable
ALTER TABLE "street" ALTER COLUMN "index" SET DATA TYPE BIGINT;

-- AlterTable
ALTER TABLE "village" ALTER COLUMN "index" SET DATA TYPE BIGINT;
