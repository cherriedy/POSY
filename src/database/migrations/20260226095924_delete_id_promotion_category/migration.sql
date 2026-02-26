/*
  Warnings:

  - The primary key for the `promotion_categories` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `id` on the `promotion_categories` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX "promotion_categories_promotion_id_category_id_key";

-- AlterTable
ALTER TABLE "promotion_categories" DROP CONSTRAINT "promotion_categories_pkey",
DROP COLUMN "id",
ADD CONSTRAINT "promotion_categories_pkey" PRIMARY KEY ("promotion_id", "category_id");
