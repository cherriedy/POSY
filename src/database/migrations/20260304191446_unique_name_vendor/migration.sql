/*
  Warnings:

  - A unique constraint covering the columns `[name]` on the table `seasonal_patterns` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[name]` on the table `tables` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[name]` on the table `vendors` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "tables_name_zone_id_key";

-- CreateIndex
CREATE UNIQUE INDEX "seasonal_patterns_name_key" ON "seasonal_patterns"("name");

-- CreateIndex
CREATE UNIQUE INDEX "tables_name_key" ON "tables"("name");

-- CreateIndex
CREATE UNIQUE INDEX "vendors_name_key" ON "vendors"("name");
