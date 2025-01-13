/*
  Warnings:

  - A unique constraint covering the columns `[client_id]` on the table `organization` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[client_id]` on the table `organization_version` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "organization_client_id_key" ON "organization"("client_id");

-- CreateIndex
CREATE UNIQUE INDEX "organization_version_client_id_key" ON "organization_version"("client_id");
