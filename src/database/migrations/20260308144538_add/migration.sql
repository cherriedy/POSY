/*
  Warnings:

  - A unique constraint covering the columns `[tax_id,entity_type,entity_id]` on the table `entity_tax_configs` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "entity_tax_configs_tax_id_entity_type_entity_id_key" ON "entity_tax_configs"("tax_id", "entity_type", "entity_id");
