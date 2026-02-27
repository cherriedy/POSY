/*
  Warnings:

  - You are about to drop the column `floorId` on the `promotion_products` table. All the data in the column will be lost.
  - You are about to drop the column `zoneId` on the `promotion_products` table. All the data in the column will be lost.
  - Added the required column `floor_id` to the `zones` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "promotion_products" DROP CONSTRAINT "promotion_products_floorId_fkey";

-- DropForeignKey
ALTER TABLE "promotion_products" DROP CONSTRAINT "promotion_products_zoneId_fkey";

-- AlterTable
ALTER TABLE "promotion_products" DROP COLUMN "floorId",
DROP COLUMN "zoneId";

-- AlterTable
ALTER TABLE "zones" ADD COLUMN     "floor_id" UUID NOT NULL;

-- AddForeignKey
ALTER TABLE "zones" ADD CONSTRAINT "zones_floor_id_fkey" FOREIGN KEY ("floor_id") REFERENCES "floors"("id") ON DELETE CASCADE ON UPDATE CASCADE;
