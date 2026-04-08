/*
  Warnings:

  - You are about to drop the column `apply_after_vat` on the `tax_configs` table. All the prismaItems in the column will be lost.

*/
-- AlterTable
ALTER TABLE "tax_configs" DROP COLUMN "apply_after_vat";
