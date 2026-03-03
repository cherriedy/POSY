-- AlterTable
ALTER TABLE "table_sessions" ALTER COLUMN "session_token" SET DATA TYPE VARCHAR(512),
ALTER COLUMN "device_fingerprint" SET DATA TYPE VARCHAR(1024);
