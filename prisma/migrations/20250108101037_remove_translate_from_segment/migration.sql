/*
  Warnings:

  - You are about to drop the `segment_translations` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "segment_translations" DROP CONSTRAINT "segment_translations_segment_id_fkey";

-- AlterTable
ALTER TABLE "segment" ADD COLUMN     "name" TEXT NOT NULL DEFAULT 'segment';

-- DropTable
DROP TABLE "segment_translations";
