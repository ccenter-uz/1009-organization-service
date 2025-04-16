-- CreateTable
CREATE TABLE "main_organization_translations" (
    "id" SERIAL NOT NULL,
    "main_organization_id" INTEGER NOT NULL,
    "language_code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "created_at" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3),

    CONSTRAINT "main_organization_translations_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "main_organization_translations" ADD CONSTRAINT "main_organization_translations_main_organization_id_fkey" FOREIGN KEY ("main_organization_id") REFERENCES "main_organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
