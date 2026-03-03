/*
  Warnings:

  - You are about to drop the column `floorId` on the `promotion_products` table. All the data in the column will be lost.
  - You are about to drop the column `zoneId` on the `promotion_products` table. All the data in the column will be lost.
  - Added the required column `expires_at` to the `table_sessions` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "promotion_products" DROP CONSTRAINT "promotion_products_floorId_fkey";

-- DropForeignKey
ALTER TABLE "promotion_products" DROP CONSTRAINT "promotion_products_zoneId_fkey";

-- AlterTable
ALTER TABLE "promotion_products" DROP COLUMN "floorId",
DROP COLUMN "zoneId";

-- AlterTable
ALTER TABLE "table_sessions" ADD COLUMN     "expires_at" TIMESTAMP(3) NOT NULL;

-- CreateIndex
CREATE INDEX "table_sessions_expires_at_idx" ON "table_sessions"("expires_at");
