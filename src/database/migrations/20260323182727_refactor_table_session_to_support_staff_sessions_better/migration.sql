/*
  Warnings:

  - You are about to drop the column `created_by` on the `table_sessions` table. All the data in the column will be lost.

*/
-- CreateEnum
CREATE TYPE "TableSessionType" AS ENUM ('GUEST', 'STAFF');

-- DropForeignKey
ALTER TABLE "table_sessions" DROP CONSTRAINT "table_sessions_created_by_fkey";

-- DropIndex
DROP INDEX "table_sessions_created_by_idx";

-- AlterTable
ALTER TABLE "table_sessions" DROP COLUMN "created_by",
ADD COLUMN     "session_type" "TableSessionType" NOT NULL DEFAULT 'GUEST',
ADD COLUMN     "user_id" UUID,
ALTER COLUMN "session_token" DROP NOT NULL,
ALTER COLUMN "device_fingerprint" DROP NOT NULL,
ALTER COLUMN "expires_at" DROP NOT NULL;

-- CreateIndex
CREATE INDEX "table_sessions_user_id_idx" ON "table_sessions"("user_id");

-- AddForeignKey
ALTER TABLE "table_sessions" ADD CONSTRAINT "table_sessions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
