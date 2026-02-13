/*
  Warnings:

  - A unique constraint covering the columns `[slug]` on the tables `categories` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `slug` to the `categories` tables without a default value. This is not possible if the tables is not empty.

*/
-- AlterTable
ALTER TABLE "categories" ADD COLUMN     "slug" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "categories_slug_key" ON "categories"("slug");
