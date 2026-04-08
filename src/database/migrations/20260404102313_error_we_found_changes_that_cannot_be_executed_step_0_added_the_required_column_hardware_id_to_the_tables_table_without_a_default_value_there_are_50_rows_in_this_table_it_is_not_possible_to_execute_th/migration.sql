/*
  Warnings:

  - A unique constraint covering the columns `[hardware_id]` on the table `tables` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `hardware_id` to the `tables` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "tables" ADD COLUMN     "current_token" VARCHAR(9),
ADD COLUMN     "hardware_id" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "tables_hardware_id_key" ON "tables"("hardware_id");
