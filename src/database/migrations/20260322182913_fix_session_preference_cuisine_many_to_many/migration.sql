/*
  Warnings:

  - You are about to drop the `_CuisineToSessionPreference` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "_CuisineToSessionPreference" DROP CONSTRAINT "_CuisineToSessionPreference_A_fkey";

-- DropForeignKey
ALTER TABLE "_CuisineToSessionPreference" DROP CONSTRAINT "_CuisineToSessionPreference_B_fkey";

-- AlterTable
ALTER TABLE "session_preferences" ADD COLUMN     "favorite_cuisines" UUID[];

-- DropTable
DROP TABLE "_CuisineToSessionPreference";
