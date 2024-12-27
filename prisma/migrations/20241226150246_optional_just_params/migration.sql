-- AlterTable
ALTER TABLE "organization" ALTER COLUMN "kvartal" DROP NOT NULL,
ALTER COLUMN "home" DROP NOT NULL,
ALTER COLUMN "account" DROP NOT NULL;

-- AlterTable
ALTER TABLE "organization_version" ALTER COLUMN "kvartal" DROP NOT NULL,
ALTER COLUMN "home" DROP NOT NULL,
ALTER COLUMN "account" DROP NOT NULL;
