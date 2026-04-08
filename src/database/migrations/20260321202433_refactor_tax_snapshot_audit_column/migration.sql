/*
  Warnings:

  - You are about to drop the column `tax_id` on the `order_taxes` table. All the data in the column will be lost.
  - You are about to drop the column `tax_rate` on the `order_taxes` table. All the data in the column will be lost.
  - You are about to drop the column `tax_id` on the `pricing_snapshot_taxes` table. All the data in the column will be lost.
  - You are about to drop the column `status` on the `pricing_snapshots` table. All the data in the column will be lost.
  - You are about to drop the column `usage_count` on the `promotions` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[order_id,order_item_id,tax_config_id]` on the table `order_taxes` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[snapshot_id,order_item_id,tax_config_id]` on the table `pricing_snapshot_taxes` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[order_id]` on the table `pricing_snapshots` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `charge_rate` to the `order_taxes` table without a default value. This is not possible if the table is not empty.
  - Added the required column `rate_type` to the `order_taxes` table without a default value. This is not possible if the table is not empty.
  - Added the required column `tax_config_id` to the `order_taxes` table without a default value. This is not possible if the table is not empty.
  - Added the required column `tax_type` to the `order_taxes` table without a default value. This is not possible if the table is not empty.
  - Added the required column `tax_config_id` to the `pricing_snapshot_taxes` table without a default value. This is not possible if the table is not empty.
  - Made the column `order_id` on table `pricing_snapshots` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE "order_taxes" DROP CONSTRAINT "order_taxes_tax_id_fkey";

-- DropForeignKey
ALTER TABLE "pricing_snapshot_taxes" DROP CONSTRAINT "pricing_snapshot_taxes_tax_id_fkey";

-- DropForeignKey
ALTER TABLE "pricing_snapshots" DROP CONSTRAINT "pricing_snapshots_order_id_fkey";

-- DropIndex
DROP INDEX "order_taxes_tax_id_idx";

-- DropIndex
DROP INDEX "pricing_snapshot_taxes_tax_id_idx";

-- AlterTable
ALTER TABLE "order_taxes" DROP COLUMN "tax_id",
DROP COLUMN "tax_rate",
ADD COLUMN     "charge_rate" DECIMAL(10,4) NOT NULL,
ADD COLUMN     "rate_type" "TaxRateType" NOT NULL,
ADD COLUMN     "tax_config_id" UUID NOT NULL,
ADD COLUMN     "tax_type" "TaxType" NOT NULL;

-- AlterTable
ALTER TABLE "pricing_snapshot_taxes" DROP COLUMN "tax_id",
ADD COLUMN     "order_item_id" UUID,
ADD COLUMN     "tax_config_id" UUID NOT NULL;

-- AlterTable
ALTER TABLE "pricing_snapshots" DROP COLUMN "status",
ALTER COLUMN "order_id" SET NOT NULL;

-- AlterTable
ALTER TABLE "promotions" DROP COLUMN "usage_count";

-- DropEnum
DROP TYPE "PricingSnapshotStatus";

-- CreateIndex
CREATE INDEX "order_taxes_tax_config_id_idx" ON "order_taxes"("tax_config_id");

-- CreateIndex
CREATE UNIQUE INDEX "order_taxes_order_id_order_item_id_tax_config_id_key" ON "order_taxes"("order_id", "order_item_id", "tax_config_id");

-- CreateIndex
CREATE INDEX "pricing_snapshot_taxes_tax_config_id_idx" ON "pricing_snapshot_taxes"("tax_config_id");

-- CreateIndex
CREATE INDEX "pricing_snapshot_taxes_order_item_id_idx" ON "pricing_snapshot_taxes"("order_item_id");

-- CreateIndex
CREATE UNIQUE INDEX "pricing_snapshot_taxes_snapshot_id_order_item_id_tax_config_key" ON "pricing_snapshot_taxes"("snapshot_id", "order_item_id", "tax_config_id");

-- CreateIndex
CREATE UNIQUE INDEX "pricing_snapshots_order_id_key" ON "pricing_snapshots"("order_id");

-- AddForeignKey
ALTER TABLE "pricing_snapshots" ADD CONSTRAINT "pricing_snapshots_order_id_fkey" FOREIGN KEY ("order_id") REFERENCES "orders"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
