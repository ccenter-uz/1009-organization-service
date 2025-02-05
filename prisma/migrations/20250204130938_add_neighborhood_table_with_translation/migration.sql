-- AlterTable
ALTER TABLE "organization" ADD COLUMN     "neighborhood_id" INTEGER;

-- AlterTable
ALTER TABLE "organization_version" ADD COLUMN     "neighborhood_id" INTEGER;

-- CreateTable
CREATE TABLE "neighborhood" (
    "id" SERIAL NOT NULL,
    "region_id" INTEGER NOT NULL,
    "city_id" INTEGER NOT NULL,
    "index" VARCHAR(1000) NOT NULL,
    "status" SMALLINT NOT NULL DEFAULT 1,
    "staff_number" VARCHAR(40),
    "district_id" INTEGER,
    "order_number" INTEGER,
    "created_at" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3),
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "neighborhood_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "neighborhood_translations" (
    "id" SERIAL NOT NULL,
    "neighborhood_id" INTEGER NOT NULL,
    "language_code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "created_at" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3),

    CONSTRAINT "neighborhood_translations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "neighborhood_old_name_translations" (
    "id" SERIAL NOT NULL,
    "neighborhood_id" INTEGER NOT NULL,
    "language_code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "created_at" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3),

    CONSTRAINT "neighborhood_old_name_translations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "neighborhood_new_name_translations" (
    "id" SERIAL NOT NULL,
    "neighborhood_id" INTEGER NOT NULL,
    "language_code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "created_at" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3),

    CONSTRAINT "neighborhood_new_name_translations_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "neighborhood" ADD CONSTRAINT "neighborhood_region_id_fkey" FOREIGN KEY ("region_id") REFERENCES "region"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "neighborhood" ADD CONSTRAINT "neighborhood_city_id_fkey" FOREIGN KEY ("city_id") REFERENCES "city"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "neighborhood" ADD CONSTRAINT "neighborhood_district_id_fkey" FOREIGN KEY ("district_id") REFERENCES "district"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "neighborhood_translations" ADD CONSTRAINT "neighborhood_translations_neighborhood_id_fkey" FOREIGN KEY ("neighborhood_id") REFERENCES "neighborhood"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "neighborhood_old_name_translations" ADD CONSTRAINT "neighborhood_old_name_translations_neighborhood_id_fkey" FOREIGN KEY ("neighborhood_id") REFERENCES "neighborhood"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "neighborhood_new_name_translations" ADD CONSTRAINT "neighborhood_new_name_translations_neighborhood_id_fkey" FOREIGN KEY ("neighborhood_id") REFERENCES "neighborhood"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "organization" ADD CONSTRAINT "organization_neighborhood_id_fkey" FOREIGN KEY ("neighborhood_id") REFERENCES "neighborhood"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "organization_version" ADD CONSTRAINT "organization_version_neighborhood_id_fkey" FOREIGN KEY ("neighborhood_id") REFERENCES "neighborhood"("id") ON DELETE SET NULL ON UPDATE CASCADE;
