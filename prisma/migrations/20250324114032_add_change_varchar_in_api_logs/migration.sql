/*
  Warnings:

  - You are about to alter the column `organization_name` on the `api_logs` table. The data in that column could be lost. The data in that column will be cast from `VarChar` to `VarChar(100)`.

*/
-- AlterTable
ALTER TABLE "api_logs" ALTER COLUMN "organization_name" SET DATA TYPE VARCHAR(100);
