/*
  Warnings:

  - You are about to drop the column `snapshot_id` on the `orders` tables. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "orders" DROP CONSTRAINT "orders_snapshot_id_fkey";

-- DropIndex
DROP INDEX "orders_snapshot_id_key";

-- AlterTable
ALTER TABLE "orders" DROP COLUMN "snapshot_id";

-- AlterTable
ALTER TABLE "pricing_snapshots" ADD COLUMN     "order_id" UUID;

-- AddForeignKey
ALTER TABLE "pricing_snapshots" ADD CONSTRAINT "pricing_snapshots_order_id_fkey" FOREIGN KEY ("order_id") REFERENCES "orders"("id") ON DELETE SET NULL ON UPDATE CASCADE;
