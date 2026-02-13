/*
  Warnings:

  - The values [EXPIRED] on the enum `PricingSnapshotStatus` will be removed. If these variants are still used in the database, this will fail.
  - You are about to drop the column `expires_at` on the `pricing_snapshots` table. All the data in the column will be lost.

*/
-- CreateEnum
CREATE TYPE "TaxConfigEntityType" AS ENUM ('PRODUCT', 'CATEGORY', 'ZONE');

-- AlterEnum
BEGIN;
CREATE TYPE "PricingSnapshotStatus_new" AS ENUM ('QUOTED', 'CONSUMED');
ALTER TABLE "public"."pricing_snapshots" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "pricing_snapshots" ALTER COLUMN "status" TYPE "PricingSnapshotStatus_new" USING ("status"::text::"PricingSnapshotStatus_new");
ALTER TYPE "PricingSnapshotStatus" RENAME TO "PricingSnapshotStatus_old";
ALTER TYPE "PricingSnapshotStatus_new" RENAME TO "PricingSnapshotStatus";
DROP TYPE "public"."PricingSnapshotStatus_old";
ALTER TABLE "pricing_snapshots" ALTER COLUMN "status" SET DEFAULT 'QUOTED';
COMMIT;

-- AlterTable
ALTER TABLE "pricing_snapshots" DROP COLUMN "expires_at";

-- CreateTable
CREATE TABLE "entity_tax_configs" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "tax_id" UUID NOT NULL,
    "entity_id" UUID NOT NULL,
    "entity_type" "TaxConfigEntityType" NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "note" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "entity_tax_configs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "entity_tax_configs_tax_id_idx" ON "entity_tax_configs"("tax_id");

-- CreateIndex
CREATE INDEX "entity_tax_configs_entity_id_entity_type_idx" ON "entity_tax_configs"("entity_id", "entity_type");

-- AddForeignKey
ALTER TABLE "entity_tax_configs" ADD CONSTRAINT "entity_tax_configs_tax_id_fkey" FOREIGN KEY ("tax_id") REFERENCES "tax_configs"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
