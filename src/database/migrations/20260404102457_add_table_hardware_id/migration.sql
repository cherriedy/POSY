/*
  Warnings:

  - Made the column `hardware_id` on table `tables` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "tables" ALTER COLUMN "hardware_id" SET NOT NULL;
