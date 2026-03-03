/*
  Warnings:

  - Added the required column `device_fingerprint` to the `table_sessions` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "table_sessions" ADD COLUMN     "device_fingerprint" VARCHAR(255) NOT NULL;
