-- DropForeignKey
ALTER TABLE "phone" DROP CONSTRAINT "phone_phone_type_id_fkey";

-- AlterTable
ALTER TABLE "phone" ALTER COLUMN "phone_type_id" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "phone" ADD CONSTRAINT "phone_phone_type_id_fkey" FOREIGN KEY ("phone_type_id") REFERENCES "phone_types"("id") ON DELETE SET NULL ON UPDATE CASCADE;
