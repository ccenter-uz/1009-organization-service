-- AlterTable
ALTER TABLE "organization" ALTER COLUMN "name" DROP NOT NULL;

-- AlterTable
ALTER TABLE "organization_version" ALTER COLUMN "name" DROP NOT NULL;

-- CreateTable
CREATE TABLE "business" (
    "id" SERIAL NOT NULL,
    "abonent" VARCHAR,
    "legalName" VARCHAR,
    "certificate" VARCHAR,
    "site_description" VARCHAR,
    "address" VARCHAR,
    "logo" VARCHAR,
    "banner" VARCHAR,
    "email" VARCHAR,
    "work_time" JSON,
    "payment_types" JSON,
    "socials" JSON,
    "map" JSON,
    "phones" JSON,
    "pictures" JSON,
    "status" SMALLINT,
    "organization_id" INTEGER NOT NULL,
    "created_at" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3),
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "business_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "business" ADD CONSTRAINT "business_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
