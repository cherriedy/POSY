-- AlterTable
ALTER TABLE "tax_configs" ADD COLUMN     "deleted_at" TIMESTAMP(3),
ADD COLUMN     "is_deleted" BOOLEAN NOT NULL DEFAULT false;

-- CreateIndex
CREATE INDEX "tax_configs_is_deleted_idx" ON "tax_configs"("is_deleted");

-- CreateIndex
CREATE INDEX "tax_configs_is_active_is_deleted_idx" ON "tax_configs"("is_active", "is_deleted");
