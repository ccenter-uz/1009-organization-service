-- CreateTable
CREATE TABLE "nearby_category" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "staff_number" INTEGER NOT NULL,
    "status" SMALLINT NOT NULL DEFAULT 1,
    "created_at" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3),
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "nearby_category_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "nearby" (
    "id" SERIAL NOT NULL,
    "staff_number" INTEGER NOT NULL,
    "status" SMALLINT NOT NULL DEFAULT 1,
    "nearby_category_id" INTEGER NOT NULL,
    "region_id" INTEGER NOT NULL,
    "city_id" INTEGER NOT NULL,
    "created_at" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3),
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "nearby_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "nearby_translations" (
    "id" SERIAL NOT NULL,
    "nearby_id" INTEGER NOT NULL,
    "language_code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "created_at" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3),

    CONSTRAINT "nearby_translations_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "nearby" ADD CONSTRAINT "nearby_nearby_category_id_fkey" FOREIGN KEY ("nearby_category_id") REFERENCES "nearby_category"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "nearby" ADD CONSTRAINT "nearby_region_id_fkey" FOREIGN KEY ("region_id") REFERENCES "region"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "nearby" ADD CONSTRAINT "nearby_city_id_fkey" FOREIGN KEY ("city_id") REFERENCES "city"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "nearby_translations" ADD CONSTRAINT "nearby_translations_nearby_id_fkey" FOREIGN KEY ("nearby_id") REFERENCES "nearby"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
