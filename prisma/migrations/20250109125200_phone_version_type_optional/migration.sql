-- DropForeignKey
ALTER TABLE "phone_version" DROP CONSTRAINT "phone_version_phone_type_id_fkey";

-- AlterTable
ALTER TABLE "phone_version" ALTER COLUMN "phone_type_id" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "phone_version" ADD CONSTRAINT "phone_version_phone_type_id_fkey" FOREIGN KEY ("phone_type_id") REFERENCES "phone_types"("id") ON DELETE SET NULL ON UPDATE CASCADE;
