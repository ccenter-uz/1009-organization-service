/*
  Warnings:

  - You are about to alter the column `index` on the `area` table. The data in that column could be lost. The data in that column will be cast from `BigInt` to `Integer`.
  - You are about to alter the column `index` on the `avenue` table. The data in that column could be lost. The data in that column will be cast from `BigInt` to `Integer`.
  - You are about to alter the column `index` on the `district` table. The data in that column could be lost. The data in that column will be cast from `BigInt` to `Integer`.
  - You are about to alter the column `index` on the `impasse` table. The data in that column could be lost. The data in that column will be cast from `BigInt` to `Integer`.
  - You are about to alter the column `index` on the `lane` table. The data in that column could be lost. The data in that column will be cast from `BigInt` to `Integer`.
  - You are about to alter the column `index` on the `organization` table. The data in that column could be lost. The data in that column will be cast from `BigInt` to `Integer`.
  - You are about to alter the column `index` on the `organization_version` table. The data in that column could be lost. The data in that column will be cast from `BigInt` to `Integer`.
  - You are about to alter the column `index` on the `passage` table. The data in that column could be lost. The data in that column will be cast from `BigInt` to `Integer`.
  - You are about to alter the column `index` on the `residential_area` table. The data in that column could be lost. The data in that column will be cast from `BigInt` to `Integer`.
  - You are about to alter the column `index` on the `street` table. The data in that column could be lost. The data in that column will be cast from `BigInt` to `Integer`.
  - You are about to alter the column `index` on the `village` table. The data in that column could be lost. The data in that column will be cast from `BigInt` to `Integer`.

*/
-- AlterTable
ALTER TABLE "area" ALTER COLUMN "index" SET DATA TYPE INTEGER;

-- AlterTable
ALTER TABLE "avenue" ALTER COLUMN "index" SET DATA TYPE INTEGER;

-- AlterTable
ALTER TABLE "district" ALTER COLUMN "index" SET DATA TYPE INTEGER;

-- AlterTable
ALTER TABLE "impasse" ALTER COLUMN "index" SET DATA TYPE INTEGER;

-- AlterTable
ALTER TABLE "lane" ALTER COLUMN "index" SET DATA TYPE INTEGER;

-- AlterTable
ALTER TABLE "organization" ALTER COLUMN "index" SET DATA TYPE INTEGER;

-- AlterTable
ALTER TABLE "organization_version" ALTER COLUMN "index" SET DATA TYPE INTEGER;

-- AlterTable
ALTER TABLE "passage" ALTER COLUMN "index" SET DATA TYPE INTEGER;

-- AlterTable
ALTER TABLE "residential_area" ALTER COLUMN "index" SET DATA TYPE INTEGER;

-- AlterTable
ALTER TABLE "street" ALTER COLUMN "index" SET DATA TYPE INTEGER;

-- AlterTable
ALTER TABLE "village" ALTER COLUMN "index" SET DATA TYPE INTEGER;
