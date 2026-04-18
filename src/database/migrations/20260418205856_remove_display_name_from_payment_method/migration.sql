/*
  Warnings:

  - You are about to drop the column `display_name` on the `payment_methods` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[name,provider]` on the table `payment_methods` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "payment_methods_name_display_name_provider_key";

-- AlterTable
ALTER TABLE "payment_methods" DROP COLUMN "display_name";

-- CreateIndex
CREATE UNIQUE INDEX "payment_methods_name_provider_key" ON "payment_methods"("name", "provider");
