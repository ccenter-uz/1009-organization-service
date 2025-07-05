-- AlterTable
ALTER TABLE "organization" ADD COLUMN     "certificate" VARCHAR,
ADD COLUMN     "logo" VARCHAR,
ADD COLUMN     "socials" JSON;

-- AlterTable
ALTER TABLE "organization_version" ADD COLUMN     "certificate" VARCHAR,
ADD COLUMN     "logo" VARCHAR,
ADD COLUMN     "socials" JSON;
