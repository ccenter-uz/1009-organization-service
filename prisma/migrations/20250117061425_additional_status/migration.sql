-- AlterTable
ALTER TABLE "additional" ADD COLUMN     "status" SMALLINT NOT NULL DEFAULT 1;

-- AlterTable
ALTER TABLE "additional_category" ADD COLUMN     "status" SMALLINT NOT NULL DEFAULT 1;

-- AlterTable
ALTER TABLE "additional_content" ADD COLUMN     "status" SMALLINT NOT NULL DEFAULT 1;

-- AlterTable
ALTER TABLE "additional_table" ADD COLUMN     "status" SMALLINT NOT NULL DEFAULT 1;
