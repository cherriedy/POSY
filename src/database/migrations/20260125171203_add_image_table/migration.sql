-- CreateTable
CREATE TABLE "images" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "file_name" VARCHAR(255) NOT NULL,
    "original_name" VARCHAR(255) NOT NULL,
    "mime_type" VARCHAR(100) NOT NULL,
    "size" INTEGER NOT NULL,
    "path" VARCHAR(500) NOT NULL,
    "entity_type" VARCHAR(100),
    "entity_id" UUID,
    "session_id" UUID,
    "is_confirmed" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "images_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "images_entity_id_entity_type_idx" ON "images"("entity_id", "entity_type");

-- CreateIndex
CREATE INDEX "images_session_id_idx" ON "images"("session_id");

-- CreateIndex
CREATE INDEX "images_is_confirmed_created_at_idx" ON "images"("is_confirmed", "created_at");
