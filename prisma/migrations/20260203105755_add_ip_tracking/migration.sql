-- AlterTable
ALTER TABLE "site_statistics" ADD COLUMN     "ip" VARCHAR(64),
ADD COLUMN     "uniqueKey" VARCHAR,
ADD COLUMN     "userAgent" VARCHAR(255);
