-- CreateTable
CREATE TABLE "residential_area" (
    "id" SERIAL NOT NULL,
    "region_id" INTEGER NOT NULL,
    "city_id" INTEGER NOT NULL,
    "index" INTEGER NOT NULL,
    "status" SMALLINT NOT NULL DEFAULT 1,
    "staff_id" INTEGER NOT NULL,
    "district_id" INTEGER NOT NULL,
    "created_at" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3),
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "residential_area_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "residential_area_translations" (
    "id" SERIAL NOT NULL,
    "residential_area_id" INTEGER NOT NULL,
    "language_code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "created_at" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3),

    CONSTRAINT "residential_area_translations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "residential_area_old_name_translations" (
    "id" SERIAL NOT NULL,
    "residential_area_id" INTEGER NOT NULL,
    "language_code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "created_at" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3),

    CONSTRAINT "residential_area_old_name_translations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "residential_area_new_name_translations" (
    "id" SERIAL NOT NULL,
    "residential_area_id" INTEGER NOT NULL,
    "language_code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "created_at" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3),

    CONSTRAINT "residential_area_new_name_translations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "impasse" (
    "id" SERIAL NOT NULL,
    "region_id" INTEGER NOT NULL,
    "city_id" INTEGER NOT NULL,
    "index" INTEGER NOT NULL,
    "status" SMALLINT NOT NULL DEFAULT 1,
    "staff_id" INTEGER NOT NULL,
    "district_id" INTEGER NOT NULL,
    "created_at" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3),
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "impasse_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "impasse_translations" (
    "id" SERIAL NOT NULL,
    "impasse_id" INTEGER NOT NULL,
    "language_code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "created_at" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3),

    CONSTRAINT "impasse_translations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "impasse_old_name_translations" (
    "id" SERIAL NOT NULL,
    "impasse_id" INTEGER NOT NULL,
    "language_code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "created_at" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3),

    CONSTRAINT "impasse_old_name_translations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "impasse_new_name_translations" (
    "id" SERIAL NOT NULL,
    "impasse_id" INTEGER NOT NULL,
    "language_code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "created_at" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3),

    CONSTRAINT "impasse_new_name_translations_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "residential_area" ADD CONSTRAINT "residential_area_region_id_fkey" FOREIGN KEY ("region_id") REFERENCES "region"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "residential_area" ADD CONSTRAINT "residential_area_city_id_fkey" FOREIGN KEY ("city_id") REFERENCES "city"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "residential_area" ADD CONSTRAINT "residential_area_district_id_fkey" FOREIGN KEY ("district_id") REFERENCES "district"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "residential_area_translations" ADD CONSTRAINT "residential_area_translations_residential_area_id_fkey" FOREIGN KEY ("residential_area_id") REFERENCES "residential_area"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "residential_area_old_name_translations" ADD CONSTRAINT "residential_area_old_name_translations_residential_area_id_fkey" FOREIGN KEY ("residential_area_id") REFERENCES "residential_area"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "residential_area_new_name_translations" ADD CONSTRAINT "residential_area_new_name_translations_residential_area_id_fkey" FOREIGN KEY ("residential_area_id") REFERENCES "residential_area"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "impasse" ADD CONSTRAINT "impasse_region_id_fkey" FOREIGN KEY ("region_id") REFERENCES "region"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "impasse" ADD CONSTRAINT "impasse_city_id_fkey" FOREIGN KEY ("city_id") REFERENCES "city"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "impasse" ADD CONSTRAINT "impasse_district_id_fkey" FOREIGN KEY ("district_id") REFERENCES "district"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "impasse_translations" ADD CONSTRAINT "impasse_translations_impasse_id_fkey" FOREIGN KEY ("impasse_id") REFERENCES "impasse"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "impasse_old_name_translations" ADD CONSTRAINT "impasse_old_name_translations_impasse_id_fkey" FOREIGN KEY ("impasse_id") REFERENCES "impasse"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "impasse_new_name_translations" ADD CONSTRAINT "impasse_new_name_translations_impasse_id_fkey" FOREIGN KEY ("impasse_id") REFERENCES "impasse"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
