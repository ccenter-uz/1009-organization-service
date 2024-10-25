-- CreateTable
CREATE TABLE "main_organization" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "staff_number" INTEGER NOT NULL,
    "status" SMALLINT NOT NULL DEFAULT 1,
    "created_at" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3),
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "main_organization_pkey" PRIMARY KEY ("id")
);
