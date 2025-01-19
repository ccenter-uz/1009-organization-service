-- CreateTable
CREATE TABLE "additional_category" (
    "id" SERIAL NOT NULL,
    "staff_number" VARCHAR(40),
    "created_at" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3),
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "additional_category_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "additional_category_translations" (
    "id" SERIAL NOT NULL,
    "additional_category_id" INTEGER NOT NULL,
    "language_code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "created_at" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3),

    CONSTRAINT "additional_category_translations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "additional" (
    "id" SERIAL NOT NULL,
    "staff_number" VARCHAR(40),
    "additional_category_id" INTEGER NOT NULL,
    "created_at" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3),
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "additional_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "additional_translations" (
    "id" SERIAL NOT NULL,
    "additional_id" INTEGER NOT NULL,
    "language_code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "created_at" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3),

    CONSTRAINT "additional_translations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "additional_warning_translations" (
    "id" SERIAL NOT NULL,
    "additional_id" INTEGER NOT NULL,
    "language_code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "created_at" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3),

    CONSTRAINT "additional_warning_translations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "additional_mention_translations" (
    "id" SERIAL NOT NULL,
    "additional_id" INTEGER NOT NULL,
    "language_code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "created_at" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3),

    CONSTRAINT "additional_mention_translations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "additional_content" (
    "id" SERIAL NOT NULL,
    "additional_category_id" INTEGER NOT NULL,
    "created_at" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3),
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "additional_content_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "additional_content_name_translations" (
    "id" SERIAL NOT NULL,
    "additional_content_id" INTEGER NOT NULL,
    "language_code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "created_at" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3),

    CONSTRAINT "additional_content_name_translations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "additional_content_content_translations" (
    "id" SERIAL NOT NULL,
    "additional_id" INTEGER NOT NULL,
    "language_code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "created_at" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3),

    CONSTRAINT "additional_content_content_translations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "additional_table" (
    "id" SERIAL NOT NULL,
    "additional_id" INTEGER NOT NULL,
    "created_at" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3),
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "additional_table_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "additional_table_name_translations" (
    "id" SERIAL NOT NULL,
    "additional_table_id" INTEGER NOT NULL,
    "language_code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "created_at" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3),

    CONSTRAINT "additional_table_name_translations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "additional_table_content_translations" (
    "id" SERIAL NOT NULL,
    "additional_id" INTEGER NOT NULL,
    "language_code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "created_at" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3),

    CONSTRAINT "additional_table_content_translations_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "additional_category_translations" ADD CONSTRAINT "additional_category_translations_additional_category_id_fkey" FOREIGN KEY ("additional_category_id") REFERENCES "additional_category"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "additional" ADD CONSTRAINT "additional_additional_category_id_fkey" FOREIGN KEY ("additional_category_id") REFERENCES "additional_category"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "additional_translations" ADD CONSTRAINT "additional_translations_additional_id_fkey" FOREIGN KEY ("additional_id") REFERENCES "additional"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "additional_warning_translations" ADD CONSTRAINT "additional_warning_translations_additional_id_fkey" FOREIGN KEY ("additional_id") REFERENCES "additional"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "additional_mention_translations" ADD CONSTRAINT "additional_mention_translations_additional_id_fkey" FOREIGN KEY ("additional_id") REFERENCES "additional"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "additional_content" ADD CONSTRAINT "additional_content_additional_category_id_fkey" FOREIGN KEY ("additional_category_id") REFERENCES "additional"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "additional_content_name_translations" ADD CONSTRAINT "additional_content_name_translations_additional_content_id_fkey" FOREIGN KEY ("additional_content_id") REFERENCES "additional_content"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "additional_content_content_translations" ADD CONSTRAINT "additional_content_content_translations_additional_id_fkey" FOREIGN KEY ("additional_id") REFERENCES "additional_content"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "additional_table" ADD CONSTRAINT "additional_table_additional_id_fkey" FOREIGN KEY ("additional_id") REFERENCES "additional"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "additional_table_name_translations" ADD CONSTRAINT "additional_table_name_translations_additional_table_id_fkey" FOREIGN KEY ("additional_table_id") REFERENCES "additional_table"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "additional_table_content_translations" ADD CONSTRAINT "additional_table_content_translations_additional_id_fkey" FOREIGN KEY ("additional_id") REFERENCES "additional_table"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
