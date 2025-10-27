-- CreateTable
CREATE TABLE "site_statistics" (
    "id" SERIAL NOT NULL,
    "address" VARCHAR,
    "device" VARCHAR,
    "sourceSite" VARCHAR,
    "sessionTime" VARCHAR,
    "organization_id" INTEGER NOT NULL,
    "created_at" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3),
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "site_statistics_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "site_statistics" ADD CONSTRAINT "site_statistics_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
