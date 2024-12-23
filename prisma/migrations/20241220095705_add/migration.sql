-- CreateTable
CREATE TABLE "phone_types_id_translations" (
    "id" SERIAL NOT NULL,
    "phone_types_id" INTEGER NOT NULL,
    "language_code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "created_at" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3),

    CONSTRAINT "phone_types_id_translations_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "phone_types_id_translations" ADD CONSTRAINT "phone_types_id_translations_phone_types_id_fkey" FOREIGN KEY ("phone_types_id") REFERENCES "phone_types"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
