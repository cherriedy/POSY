/*
  Warnings:

  - You are about to drop the column `interaction_score` on the `session_product_interactions` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX "ingredient_usages_is_holiday_idx";

-- DropIndex
DROP INDEX "ingredient_usages_is_weekend_idx";

-- DropIndex
DROP INDEX "session_product_interactions_interaction_score_idx";

-- AlterTable
ALTER TABLE "session_product_interactions" DROP COLUMN "interaction_score";
