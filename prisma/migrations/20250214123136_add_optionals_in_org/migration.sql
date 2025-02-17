-- AlterTable
ALTER TABLE "organization" ALTER COLUMN "address" DROP NOT NULL;

-- AlterTable
ALTER TABLE "organization_version" ALTER COLUMN "address" DROP NOT NULL;
