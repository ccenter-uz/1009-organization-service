-- CreateTable
CREATE TABLE "avenue" (
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

    CONSTRAINT "avenue_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "avenue_translations" (
    "id" SERIAL NOT NULL,
    "avenue_id" INTEGER NOT NULL,
    "language_code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "created_at" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3),

    CONSTRAINT "avenue_translations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "avenue_old_name_translations" (
    "id" SERIAL NOT NULL,
    "avenue_id" INTEGER NOT NULL,
    "language_code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "created_at" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3),

    CONSTRAINT "avenue_old_name_translations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "avenue_new_name_translations" (
    "id" SERIAL NOT NULL,
    "avenue_id" INTEGER NOT NULL,
    "language_code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "created_at" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3),

    CONSTRAINT "avenue_new_name_translations_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "avenue" ADD CONSTRAINT "avenue_region_id_fkey" FOREIGN KEY ("region_id") REFERENCES "region"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "avenue" ADD CONSTRAINT "avenue_city_id_fkey" FOREIGN KEY ("city_id") REFERENCES "city"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "avenue" ADD CONSTRAINT "avenue_district_id_fkey" FOREIGN KEY ("district_id") REFERENCES "district"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "avenue_translations" ADD CONSTRAINT "avenue_translations_avenue_id_fkey" FOREIGN KEY ("avenue_id") REFERENCES "avenue"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "avenue_old_name_translations" ADD CONSTRAINT "avenue_old_name_translations_avenue_id_fkey" FOREIGN KEY ("avenue_id") REFERENCES "avenue"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "avenue_new_name_translations" ADD CONSTRAINT "avenue_new_name_translations_avenue_id_fkey" FOREIGN KEY ("avenue_id") REFERENCES "avenue"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
