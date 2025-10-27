/*
  Warnings:

  - You are about to drop the column `sessionTime` on the `site_statistics` table. All the data in the column will be lost.
  - You are about to drop the column `sourceSite` on the `site_statistics` table. All the data in the column will be lost.
  - Added the required column `user_log_id` to the `site_statistics` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "site_statistics" DROP COLUMN "sessionTime",
DROP COLUMN "sourceSite",
ADD COLUMN     "session_time" VARCHAR,
ADD COLUMN     "source_site" VARCHAR,
ADD COLUMN     "user_log_id" INTEGER NOT NULL;
