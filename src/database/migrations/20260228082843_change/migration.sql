/*
  Warnings:

  - You are about to drop the column `sessionPreferenceId` on the `cuisines` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "cuisines" DROP CONSTRAINT "cuisines_sessionPreferenceId_fkey";

-- AlterTable
ALTER TABLE "cuisines" DROP COLUMN "sessionPreferenceId";

-- CreateTable
CREATE TABLE "_CuisineToSessionPreference" (
    "A" UUID NOT NULL,
    "B" UUID NOT NULL,

    CONSTRAINT "_CuisineToSessionPreference_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE INDEX "_CuisineToSessionPreference_B_index" ON "_CuisineToSessionPreference"("B");

-- AddForeignKey
ALTER TABLE "_CuisineToSessionPreference" ADD CONSTRAINT "_CuisineToSessionPreference_A_fkey" FOREIGN KEY ("A") REFERENCES "cuisines"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_CuisineToSessionPreference" ADD CONSTRAINT "_CuisineToSessionPreference_B_fkey" FOREIGN KEY ("B") REFERENCES "session_preferences"("id") ON DELETE CASCADE ON UPDATE CASCADE;
