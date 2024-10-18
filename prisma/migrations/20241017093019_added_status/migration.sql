-- AlterTable
ALTER TABLE "category" ADD COLUMN     "status" SMALLINT NOT NULL DEFAULT 1;

-- AlterTable
ALTER TABLE "sub_category" ADD COLUMN     "status" SMALLINT NOT NULL DEFAULT 1;
