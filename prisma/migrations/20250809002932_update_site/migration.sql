/*
  Warnings:

  - You are about to drop the `business` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "business" DROP CONSTRAINT "business_organization_id_fkey";

-- DropTable
DROP TABLE "business";

-- CreateTable
CREATE TABLE "site" (
    "id" SERIAL NOT NULL,
    "site_description" VARCHAR,
    "banner" VARCHAR,
    "map" JSON,
    "organization_id" INTEGER NOT NULL,
    "created_at" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3),
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "site_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "site" ADD CONSTRAINT "site_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
