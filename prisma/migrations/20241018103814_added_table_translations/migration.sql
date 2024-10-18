-- CreateTable
CREATE TABLE "category_translations" (
    "id" SERIAL NOT NULL,
    "category_id" INTEGER NOT NULL,
    "language_code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "created_at" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP,

    CONSTRAINT "category_translations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sub_category_translations" (
    "id" SERIAL NOT NULL,
    "category_id" INTEGER NOT NULL,
    "language_code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "created_at" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP,

    CONSTRAINT "sub_category_translations_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "category_translations" ADD CONSTRAINT "category_translations_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "category"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sub_category_translations" ADD CONSTRAINT "sub_category_translations_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "sub_category"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
