/*
  Warnings:

  - You are about to alter the column `module` on the `api_logs` table. The data in that column could be lost. The data in that column will be cast from `VarChar` to `VarChar(100)`.

*/
-- AlterTable
ALTER TABLE "api_logs" ALTER COLUMN "organization_name" SET DATA TYPE VARCHAR,
ALTER COLUMN "module" SET DATA TYPE VARCHAR(100);
