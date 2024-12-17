-- CreateTable
CREATE TABLE "phone_types" (
    "id" SERIAL NOT NULL,
    "name" VARCHAR NOT NULL,
    "staff_number" VARCHAR(40) NOT NULL,
    "status" SMALLINT NOT NULL DEFAULT 1,
    "created_at" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3),

    CONSTRAINT "phone_types_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "organization" (
    "id" SERIAL NOT NULL,
    "name" VARCHAR NOT NULL,
    "lagel_name" VARCHAR NOT NULL,
    "secret" TEXT NOT NULL,
    "kvartal" VARCHAR NOT NULL,
    "address" VARCHAR NOT NULL,
    "home" INTEGER NOT NULL,
    "apartment" INTEGER NOT NULL,
    "payment_types" JSON NOT NULL,
    "inn" VARCHAR NOT NULL,
    "bank_number" VARCHAR NOT NULL,
    "account" VARCHAR NOT NULL,
    "mail" VARCHAR NOT NULL,
    "client_id" VARCHAR NOT NULL,
    "maneger" VARCHAR NOT NULL,
    "index" INTEGER NOT NULL,
    "work_time" JSON NOT NULL,
    "transport" JSON NOT NULL,
    "created_by" VARCHAR NOT NULL,
    "nearby_description" VARCHAR NOT NULL,
    "main_organization_id" INTEGER NOT NULL,
    "sub_category_id" INTEGER NOT NULL,
    "product_service_category_id" INTEGER NOT NULL,
    "product_service_sub_category_id" INTEGER NOT NULL,
    "region_id" INTEGER NOT NULL,
    "city_id" INTEGER NOT NULL,
    "district_id" INTEGER NOT NULL,
    "village_id" INTEGER NOT NULL,
    "avenue_id" INTEGER NOT NULL,
    "residential_id" INTEGER NOT NULL,
    "area_id" INTEGER NOT NULL,
    "street_id" INTEGER NOT NULL,
    "lane_id" INTEGER NOT NULL,
    "impasse_id" INTEGER NOT NULL,
    "nearby_id" INTEGER NOT NULL,
    "segment_id" INTEGER NOT NULL,
    "section_id" INTEGER NOT NULL,
    "status" SMALLINT NOT NULL,
    "created_at" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3),
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "organization_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "picture" (
    "id" SERIAL NOT NULL,
    "link" VARCHAR NOT NULL,
    "organization_id" INTEGER NOT NULL,
    "created_at" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3),

    CONSTRAINT "picture_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "phone" (
    "id" SERIAL NOT NULL,
    "phone" VARCHAR NOT NULL,
    "phone_type_id" INTEGER NOT NULL,
    "organization_id" INTEGER NOT NULL,
    "created_at" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3),

    CONSTRAINT "phone_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "organization_version" (
    "id" SERIAL NOT NULL,
    "name" VARCHAR NOT NULL,
    "lagel_name" VARCHAR NOT NULL,
    "secret" TEXT NOT NULL,
    "kvartal" VARCHAR NOT NULL,
    "address" VARCHAR NOT NULL,
    "home" INTEGER NOT NULL,
    "apartment" INTEGER NOT NULL,
    "payment_types" JSON NOT NULL,
    "inn" VARCHAR NOT NULL,
    "bank_number" VARCHAR NOT NULL,
    "account" VARCHAR NOT NULL,
    "mail" VARCHAR NOT NULL,
    "client_id" VARCHAR NOT NULL,
    "maneger" VARCHAR NOT NULL,
    "index" INTEGER NOT NULL,
    "work_time" JSON NOT NULL,
    "transport" JSON NOT NULL,
    "created_by" VARCHAR NOT NULL,
    "nearby_description" VARCHAR NOT NULL,
    "main_organization_id" INTEGER NOT NULL,
    "sub_category_id" INTEGER NOT NULL,
    "product_service_category_id" INTEGER NOT NULL,
    "product_service_sub_category_id" INTEGER NOT NULL,
    "region_id" INTEGER NOT NULL,
    "city_id" INTEGER NOT NULL,
    "district_id" INTEGER NOT NULL,
    "village_id" INTEGER NOT NULL,
    "avenue_id" INTEGER NOT NULL,
    "residential_id" INTEGER NOT NULL,
    "area_id" INTEGER NOT NULL,
    "street_id" INTEGER NOT NULL,
    "lane_id" INTEGER NOT NULL,
    "impasse_id" INTEGER NOT NULL,
    "nearby_id" INTEGER NOT NULL,
    "segment_id" INTEGER NOT NULL,
    "section_id" INTEGER NOT NULL,
    "status" SMALLINT NOT NULL,
    "created_at" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3),
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "organization_version_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "picture_version" (
    "id" SERIAL NOT NULL,
    "link" VARCHAR NOT NULL,
    "picture_action" VARCHAR NOT NULL,
    "organization_version_id" INTEGER NOT NULL,
    "created_at" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3),

    CONSTRAINT "picture_version_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "phone_version" (
    "id" SERIAL NOT NULL,
    "phone" VARCHAR NOT NULL,
    "phone_action" VARCHAR NOT NULL,
    "phone_type_id" INTEGER NOT NULL,
    "organization_version_id" INTEGER NOT NULL,
    "created_at" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3),

    CONSTRAINT "phone_version_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "organization" ADD CONSTRAINT "organization_main_organization_id_fkey" FOREIGN KEY ("main_organization_id") REFERENCES "main_organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "organization" ADD CONSTRAINT "organization_sub_category_id_fkey" FOREIGN KEY ("sub_category_id") REFERENCES "sub_category"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "organization" ADD CONSTRAINT "organization_product_service_category_id_fkey" FOREIGN KEY ("product_service_category_id") REFERENCES "product_service_category"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "organization" ADD CONSTRAINT "organization_product_service_sub_category_id_fkey" FOREIGN KEY ("product_service_sub_category_id") REFERENCES "product_service_sub_category"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "organization" ADD CONSTRAINT "organization_region_id_fkey" FOREIGN KEY ("region_id") REFERENCES "region"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "organization" ADD CONSTRAINT "organization_city_id_fkey" FOREIGN KEY ("city_id") REFERENCES "city"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "organization" ADD CONSTRAINT "organization_district_id_fkey" FOREIGN KEY ("district_id") REFERENCES "district"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "organization" ADD CONSTRAINT "organization_village_id_fkey" FOREIGN KEY ("village_id") REFERENCES "village"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "organization" ADD CONSTRAINT "organization_avenue_id_fkey" FOREIGN KEY ("avenue_id") REFERENCES "avenue"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "organization" ADD CONSTRAINT "organization_residential_id_fkey" FOREIGN KEY ("residential_id") REFERENCES "residential_area"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "organization" ADD CONSTRAINT "organization_area_id_fkey" FOREIGN KEY ("area_id") REFERENCES "area"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "organization" ADD CONSTRAINT "organization_street_id_fkey" FOREIGN KEY ("street_id") REFERENCES "street"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "organization" ADD CONSTRAINT "organization_lane_id_fkey" FOREIGN KEY ("lane_id") REFERENCES "lane"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "organization" ADD CONSTRAINT "organization_impasse_id_fkey" FOREIGN KEY ("impasse_id") REFERENCES "impasse"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "organization" ADD CONSTRAINT "organization_nearby_id_fkey" FOREIGN KEY ("nearby_id") REFERENCES "nearby"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "organization" ADD CONSTRAINT "organization_segment_id_fkey" FOREIGN KEY ("segment_id") REFERENCES "segment"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "organization" ADD CONSTRAINT "organization_section_id_fkey" FOREIGN KEY ("section_id") REFERENCES "section"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "picture" ADD CONSTRAINT "picture_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "phone" ADD CONSTRAINT "phone_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "phone" ADD CONSTRAINT "phone_phone_type_id_fkey" FOREIGN KEY ("phone_type_id") REFERENCES "phone_types"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "picture_version" ADD CONSTRAINT "picture_version_organization_version_id_fkey" FOREIGN KEY ("organization_version_id") REFERENCES "organization_version"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "phone_version" ADD CONSTRAINT "phone_version_organization_version_id_fkey" FOREIGN KEY ("organization_version_id") REFERENCES "organization_version"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
