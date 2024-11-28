-- CreateTable
CREATE TABLE "village" (
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

    CONSTRAINT "village_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "village_translations" (
    "id" SERIAL NOT NULL,
    "village_id" INTEGER NOT NULL,
    "language_code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "created_at" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3),

    CONSTRAINT "village_translations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "village_old_name_translations" (
    "id" SERIAL NOT NULL,
    "village_id" INTEGER NOT NULL,
    "language_code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "created_at" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3),

    CONSTRAINT "village_old_name_translations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "village_new_name_translations" (
    "id" SERIAL NOT NULL,
    "village_id" INTEGER NOT NULL,
    "language_code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "created_at" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3),

    CONSTRAINT "village_new_name_translations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "lane" (
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

    CONSTRAINT "lane_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "lane_translations" (
    "id" SERIAL NOT NULL,
    "lane_id" INTEGER NOT NULL,
    "language_code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "created_at" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3),

    CONSTRAINT "lane_translations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "lane_old_name_translations" (
    "id" SERIAL NOT NULL,
    "lane_id" INTEGER NOT NULL,
    "language_code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "created_at" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3),

    CONSTRAINT "lane_old_name_translations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "lane_new_name_translations" (
    "id" SERIAL NOT NULL,
    "lane_id" INTEGER NOT NULL,
    "language_code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "created_at" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3),

    CONSTRAINT "lane_new_name_translations_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "village" ADD CONSTRAINT "village_region_id_fkey" FOREIGN KEY ("region_id") REFERENCES "region"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "village" ADD CONSTRAINT "village_city_id_fkey" FOREIGN KEY ("city_id") REFERENCES "city"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "village" ADD CONSTRAINT "village_district_id_fkey" FOREIGN KEY ("district_id") REFERENCES "district"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "village_translations" ADD CONSTRAINT "village_translations_village_id_fkey" FOREIGN KEY ("village_id") REFERENCES "village"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "village_old_name_translations" ADD CONSTRAINT "village_old_name_translations_village_id_fkey" FOREIGN KEY ("village_id") REFERENCES "village"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "village_new_name_translations" ADD CONSTRAINT "village_new_name_translations_village_id_fkey" FOREIGN KEY ("village_id") REFERENCES "village"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "lane" ADD CONSTRAINT "lane_region_id_fkey" FOREIGN KEY ("region_id") REFERENCES "region"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "lane" ADD CONSTRAINT "lane_city_id_fkey" FOREIGN KEY ("city_id") REFERENCES "city"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "lane" ADD CONSTRAINT "lane_district_id_fkey" FOREIGN KEY ("district_id") REFERENCES "district"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "lane_translations" ADD CONSTRAINT "lane_translations_lane_id_fkey" FOREIGN KEY ("lane_id") REFERENCES "lane"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "lane_old_name_translations" ADD CONSTRAINT "lane_old_name_translations_lane_id_fkey" FOREIGN KEY ("lane_id") REFERENCES "lane"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "lane_new_name_translations" ADD CONSTRAINT "lane_new_name_translations_lane_id_fkey" FOREIGN KEY ("lane_id") REFERENCES "lane"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
