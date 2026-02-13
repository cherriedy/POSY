/*
  Warnings:

  - You are about to drop the column `usage_count` on the `promotions` tables. All the data in the column will be lost.

*/
-- CreateEnum
CREATE TYPE "VendorStatus" AS ENUM ('ACTIVE', 'INACTIVE', 'SUSPENDED');

-- CreateEnum
CREATE TYPE "PricingSnapshotStatus" AS ENUM ('QUOTED', 'CONSUMED', 'EXPIRED');

-- CreateEnum
CREATE TYPE "TableStatus" AS ENUM ('AVAILABLE', 'OCCUPIED', 'RESERVED');

-- CreateEnum
CREATE TYPE "TableSessionStatus" AS ENUM ('ACTIVE', 'COMPLETED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "OrderStatus" AS ENUM ('PENDING', 'PREPARING', 'READY', 'SERVING', 'SERVED', 'COMPLETED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "OrderItemStatus" AS ENUM ('WAITING', 'PREPARING', 'DONE', 'SERVING', 'SERVED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "TaxType" AS ENUM ('VAT', 'SERVICE_CHARGE', 'ENVIRONMENTAL', 'LOCAL_TAX', 'OTHER');

-- CreateEnum
CREATE TYPE "TaxRateType" AS ENUM ('PERCENTAGE', 'FIXED_AMOUNT', 'PER_UNIT');

-- CreateEnum
CREATE TYPE "PaymentProvider" AS ENUM ('CASH', 'MOMO', 'VNPAY');

-- CreateEnum
CREATE TYPE "PaymentFeeType" AS ENUM ('PERCENTAGE', 'FIXED_AMOUNT');

-- CreateEnum
CREATE TYPE "PaymentStatus" AS ENUM ('PENDING', 'COMPLETED', 'FAILED', 'REFUNDED', 'EXPIRED');

-- CreateEnum
CREATE TYPE "Season" AS ENUM ('SPRING', 'SUMMER', 'AUTUMN', 'WINTER');

-- CreateEnum
CREATE TYPE "MealSession" AS ENUM ('BREAKFAST', 'LUNCH', 'DINNER', 'SNACK');

-- CreateEnum
CREATE TYPE "Taste" AS ENUM ('SPICY', 'SWEET', 'SOUR', 'SALTY', 'BITTER');

-- CreateEnum
CREATE TYPE "DietaryTag" AS ENUM ('VEGETARIAN', 'VEGAN', 'GLUTEN_FREE', 'DAIRY_FREE', 'NUT_FREE', 'HALAL', 'KOSHER');

-- CreateEnum
CREATE TYPE "NotificationSource" AS ENUM ('SYSTEM', 'USER');

-- CreateEnum
CREATE TYPE "NotificationType" AS ENUM ('INGRIDIENT_ALERT', 'ANNOUCEMENT', 'CUSTOM');

-- CreateEnum
CREATE TYPE "NotificationPriority" AS ENUM ('LOW', 'MEDIUM', 'HIGH');

-- AlterTable
ALTER TABLE "promotions" DROP COLUMN "usage_count";

-- CreateTable
CREATE TABLE "groups" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "name" VARCHAR(100) NOT NULL,
    "description" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "groups_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_groups" (
    "user_id" UUID NOT NULL,
    "group_id" UUID NOT NULL,

    CONSTRAINT "user_groups_pkey" PRIMARY KEY ("user_id","group_id")
);

-- CreateTable
CREATE TABLE "vendors" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "name" VARCHAR(255) NOT NULL,
    "contact_name" VARCHAR(100),
    "email" VARCHAR(255),
    "phone" VARCHAR(10),
    "address" TEXT,
    "tax_code" VARCHAR(50),
    "payment_term" SMALLINT,
    "note" TEXT,
    "status" "VendorStatus" NOT NULL DEFAULT 'ACTIVE',
    "suspended_reason" TEXT,
    "suspended_at" TIMESTAMP(3),
    "suspended_until" TIMESTAMP(3),
    "is_deleted" BOOLEAN NOT NULL DEFAULT false,
    "deleted_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "vendors_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "units" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "name" VARCHAR(50) NOT NULL,
    "abbreviation" VARCHAR(10) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "units_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ingredients" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "vendor_id" UUID NOT NULL,
    "unit_id" UUID NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "stock" SMALLINT NOT NULL,
    "min_stock" SMALLINT NOT NULL,
    "unit_cost" DECIMAL(10,2) NOT NULL,
    "expired_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ingredients_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "product_ingredients" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "product_id" UUID NOT NULL,
    "ingredient_id" UUID NOT NULL,
    "quantity" DECIMAL(10,4) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "product_ingredients_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ingredient_usages" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "ingredient_id" UUID NOT NULL,
    "usage_date" DATE NOT NULL,
    "quantity_used" DECIMAL(10,4) NOT NULL,
    "order_count" INTEGER NOT NULL,
    "day_of_week" SMALLINT NOT NULL,
    "hour_of_day" SMALLINT,
    "is_weekend" BOOLEAN NOT NULL DEFAULT false,
    "is_holiday" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ingredient_usages_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ingredient_forecasts" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "ingredient_id" UUID NOT NULL,
    "forecast_date" DATE NOT NULL,
    "predicted_usage" DECIMAL(10,4) NOT NULL,
    "lower_bound" DECIMAL(10,4) NOT NULL,
    "upper_bound" DECIMAL(10,4) NOT NULL,
    "confidence_level" DECIMAL(3,2) NOT NULL DEFAULT 0.95,
    "model_version" VARCHAR(50) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ingredient_forecasts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "seasonal_patterns" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "name" VARCHAR(100) NOT NULL,
    "pattern_type" VARCHAR(50) NOT NULL,
    "start_date" DATE,
    "end_date" DATE,
    "day_of_week" SMALLINT,
    "hour_of_day" SMALLINT,
    "multiplier" DECIMAL(5,2) NOT NULL DEFAULT 1.0,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "description" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "seasonal_patterns_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pricing_snapshots" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "subtotal_amount" DECIMAL(10,2) NOT NULL,
    "discount_amount" DECIMAL(10,2) NOT NULL,
    "total_tax_amount" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "total_amount" DECIMAL(10,2) NOT NULL,
    "status" "PricingSnapshotStatus" NOT NULL DEFAULT 'QUOTED',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expires_at" TIMESTAMP(3),

    CONSTRAINT "pricing_snapshots_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pricing_snapshot_taxes" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "snapshot_id" UUID NOT NULL,
    "tax_id" UUID NOT NULL,
    "tax_name" VARCHAR(100) NOT NULL,
    "tax_type" "TaxType" NOT NULL,
    "rate_type" "TaxRateType" NOT NULL,
    "charge_rate" DECIMAL(10,4) NOT NULL,
    "taxable_base" DECIMAL(10,2) NOT NULL,
    "quantity" INTEGER,
    "tax_amount" DECIMAL(10,2) NOT NULL,

    CONSTRAINT "pricing_snapshot_taxes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pricing_snapshot_promotions" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "snapshot_id" UUID NOT NULL,
    "promotion_id" UUID NOT NULL,
    "promotion_code" TEXT NOT NULL,
    "promotion_version" INTEGER NOT NULL,
    "discount_amount" DECIMAL(10,2) NOT NULL,

    CONSTRAINT "pricing_snapshot_promotions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "promotion_redemptions" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "promotion_id" UUID NOT NULL,
    "snapshot_id" UUID NOT NULL,
    "order_id" UUID NOT NULL,
    "redeemed_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "promotion_redemptions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "floors" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "name" VARCHAR(50) NOT NULL,
    "order" SMALLINT NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "floors_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "zones" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "name" VARCHAR(50) NOT NULL,
    "description" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "zones_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tables" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "floor_id" UUID,
    "zone_id" UUID,
    "name" VARCHAR(100) NOT NULL,
    "capacity" SMALLINT NOT NULL,
    "status" "TableStatus" NOT NULL DEFAULT 'AVAILABLE',
    "pos_x" SMALLINT,
    "pos_y" SMALLINT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "tables_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "table_sessions" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "table_id" UUID NOT NULL,
    "created_by" UUID NOT NULL,
    "session_token" VARCHAR(255) NOT NULL,
    "status" "TableSessionStatus" NOT NULL DEFAULT 'ACTIVE',
    "start_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "end_at" TIMESTAMP(3),

    CONSTRAINT "table_sessions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "orders" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "created_by" UUID NOT NULL,
    "table_id" UUID NOT NULL,
    "snapshot_id" UUID NOT NULL,
    "session_id" UUID NOT NULL,
    "status" "OrderStatus" NOT NULL,
    "note" TEXT,
    "subtotal_amount" DECIMAL(10,2) NOT NULL,
    "total_amount" DECIMAL(10,2) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "orders_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "order_items" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "order_id" UUID NOT NULL,
    "product_id" UUID NOT NULL,
    "quantity" INTEGER NOT NULL DEFAULT 1,
    "unit_price" DECIMAL(10,2) NOT NULL,
    "subtotal" DECIMAL(10,2) NOT NULL,
    "note" TEXT,
    "status" "OrderItemStatus" NOT NULL DEFAULT 'WAITING',
    "started_at" TIMESTAMP(3),
    "completed_at" TIMESTAMP(3),
    "served_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "order_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tax_configs" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "type" "TaxType" NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "display_name" VARCHAR(100) NOT NULL,
    "description" TEXT,
    "rate_type" "TaxRateType" NOT NULL,
    "charge_rate" DECIMAL(10,4) NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "is_included" BOOLEAN NOT NULL DEFAULT false,
    "apply_after_vat" BOOLEAN NOT NULL DEFAULT false,
    "sort_order" SMALLINT NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "tax_configs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "order_taxes" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "tax_id" UUID NOT NULL,
    "order_id" UUID NOT NULL,
    "order_item_id" UUID,
    "tax_name" VARCHAR(100) NOT NULL,
    "tax_rate" DECIMAL(10,4) NOT NULL,
    "taxable_base" DECIMAL(10,2) NOT NULL,
    "tax_amount" DECIMAL(10,2) NOT NULL,
    "quantity" INTEGER,

    CONSTRAINT "order_taxes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "payment_methods" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "provider" "PaymentProvider" NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "display_name" VARCHAR(100) NOT NULL,
    "icon_url" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "fee_type" "PaymentFeeType",
    "fee_value" DECIMAL(10,2),
    "sort_order" SMALLINT NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "payment_methods_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "payments" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "method_id" UUID NOT NULL,
    "order_id" UUID NOT NULL,
    "created_by" UUID NOT NULL,
    "amount" DECIMAL(10,2) NOT NULL,
    "fee_amount" DECIMAL(10,2),
    "reference_number" VARCHAR(255),
    "status" "PaymentStatus" NOT NULL DEFAULT 'PENDING',
    "payment_url" TEXT,
    "paid_at" TIMESTAMP(3),
    "expired_at" TIMESTAMP(3),
    "metadata" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "payments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "cuisines" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "name" VARCHAR(100) NOT NULL,
    "region" VARCHAR(100),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "sessionPreferenceId" UUID,

    CONSTRAINT "cuisines_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "product_attributes" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "cuisine_id" UUID,
    "product_id" UUID NOT NULL,
    "meal_session" "MealSession",
    "taste_profile" "Taste"[],
    "dietary_tags" "DietaryTag"[],
    "preparation_time" SMALLINT,
    "spice_level" SMALLINT,
    "is_seasonal" BOOLEAN NOT NULL DEFAULT false,
    "season" "Season",
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "product_attributes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "session_preferences" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "session_id" UUID NOT NULL,
    "favorite_meal_sessions" "MealSession"[],
    "favorite_taste_profile" "Taste"[],
    "dietary_restrictions" "DietaryTag"[],
    "avg_spice_preference" DECIMAL(3,2),
    "avg_price_range" DECIMAL(10,2),
    "order_count" INTEGER NOT NULL DEFAULT 0,
    "last_order_date" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "session_preferences_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "session_product_interactions" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "session_id" UUID NOT NULL,
    "product_id" UUID NOT NULL,
    "view_count" INTEGER NOT NULL DEFAULT 0,
    "order_count" INTEGER NOT NULL DEFAULT 0,
    "total_quantity" INTEGER NOT NULL DEFAULT 0,
    "total_spent" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "last_ordered" TIMESTAMP(3),
    "interaction_score" DECIMAL(5,4) NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "session_product_interactions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "product_similarities" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "product_a_id" UUID NOT NULL,
    "product_b_id" UUID NOT NULL,
    "similarity_score" DECIMAL(5,4) NOT NULL,
    "content_score" DECIMAL(5,4) NOT NULL,
    "collaborative_score" DECIMAL(5,4) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "product_similarities_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "session_similarities" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "session_a_id" UUID NOT NULL,
    "session_b_id" UUID NOT NULL,
    "similarity_score" DECIMAL(5,4) NOT NULL,
    "common_products" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "session_similarities_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "recommendations" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "session_id" UUID NOT NULL,
    "product_id" UUID NOT NULL,
    "collaborative_score" DECIMAL(5,4) NOT NULL,
    "content_score" DECIMAL(5,4) NOT NULL,
    "hybrid_score" DECIMAL(5,4) NOT NULL,
    "rank" SMALLINT NOT NULL,
    "reason" TEXT,
    "model_version" VARCHAR(50) NOT NULL,
    "expires_at" TIMESTAMP(3) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "recommendations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "session_behavior_logs" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "session_id" UUID NOT NULL,
    "product_id" UUID NOT NULL,
    "action" VARCHAR(50) NOT NULL,
    "context" JSONB,
    "duration_sec" SMALLINT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "session_behavior_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Notification" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "group_id" UUID,
    "title" VARCHAR(200) NOT NULL,
    "content" TEXT NOT NULL,
    "source" "NotificationSource" NOT NULL,
    "type" "NotificationType" NOT NULL,
    "priority" "NotificationPriority" NOT NULL,
    "created_by" UUID,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Notification_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "notification_targets" (
    "notification_id" UUID NOT NULL,
    "group_id" UUID NOT NULL,

    CONSTRAINT "notification_targets_pkey" PRIMARY KEY ("notification_id","group_id")
);

-- CreateTable
CREATE TABLE "user_notifications" (
    "notification_id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "is_read" BOOLEAN NOT NULL DEFAULT false,
    "read_at" TIMESTAMP(3),
    "delivered_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "user_notifications_pkey" PRIMARY KEY ("notification_id","user_id")
);

-- CreateIndex
CREATE UNIQUE INDEX "groups_name_key" ON "groups"("name");

-- CreateIndex
CREATE INDEX "user_groups_group_id_idx" ON "user_groups"("group_id");

-- CreateIndex
CREATE INDEX "vendors_status_idx" ON "vendors"("status");

-- CreateIndex
CREATE INDEX "vendors_is_deleted_idx" ON "vendors"("is_deleted");

-- CreateIndex
CREATE UNIQUE INDEX "units_name_key" ON "units"("name");

-- CreateIndex
CREATE UNIQUE INDEX "units_abbreviation_key" ON "units"("abbreviation");

-- CreateIndex
CREATE INDEX "ingredients_vendor_id_idx" ON "ingredients"("vendor_id");

-- CreateIndex
CREATE INDEX "ingredients_expired_at_idx" ON "ingredients"("expired_at");

-- CreateIndex
CREATE INDEX "product_ingredients_product_id_idx" ON "product_ingredients"("product_id");

-- CreateIndex
CREATE INDEX "product_ingredients_ingredient_id_idx" ON "product_ingredients"("ingredient_id");

-- CreateIndex
CREATE UNIQUE INDEX "product_ingredients_product_id_ingredient_id_key" ON "product_ingredients"("product_id", "ingredient_id");

-- CreateIndex
CREATE INDEX "ingredient_usages_ingredient_id_idx" ON "ingredient_usages"("ingredient_id");

-- CreateIndex
CREATE INDEX "ingredient_usages_usage_date_idx" ON "ingredient_usages"("usage_date");

-- CreateIndex
CREATE INDEX "ingredient_usages_day_of_week_idx" ON "ingredient_usages"("day_of_week");

-- CreateIndex
CREATE INDEX "ingredient_usages_is_weekend_idx" ON "ingredient_usages"("is_weekend");

-- CreateIndex
CREATE INDEX "ingredient_usages_is_holiday_idx" ON "ingredient_usages"("is_holiday");

-- CreateIndex
CREATE UNIQUE INDEX "ingredient_usages_ingredient_id_usage_date_hour_of_day_key" ON "ingredient_usages"("ingredient_id", "usage_date", "hour_of_day");

-- CreateIndex
CREATE INDEX "ingredient_forecasts_ingredient_id_idx" ON "ingredient_forecasts"("ingredient_id");

-- CreateIndex
CREATE INDEX "ingredient_forecasts_forecast_date_idx" ON "ingredient_forecasts"("forecast_date");

-- CreateIndex
CREATE INDEX "ingredient_forecasts_created_at_idx" ON "ingredient_forecasts"("created_at");

-- CreateIndex
CREATE UNIQUE INDEX "ingredient_forecasts_ingredient_id_forecast_date_key" ON "ingredient_forecasts"("ingredient_id", "forecast_date");

-- CreateIndex
CREATE INDEX "seasonal_patterns_pattern_type_idx" ON "seasonal_patterns"("pattern_type");

-- CreateIndex
CREATE INDEX "seasonal_patterns_start_date_end_date_idx" ON "seasonal_patterns"("start_date", "end_date");

-- CreateIndex
CREATE INDEX "seasonal_patterns_day_of_week_idx" ON "seasonal_patterns"("day_of_week");

-- CreateIndex
CREATE INDEX "seasonal_patterns_is_active_idx" ON "seasonal_patterns"("is_active");

-- CreateIndex
CREATE INDEX "pricing_snapshot_taxes_snapshot_id_idx" ON "pricing_snapshot_taxes"("snapshot_id");

-- CreateIndex
CREATE INDEX "pricing_snapshot_taxes_tax_id_idx" ON "pricing_snapshot_taxes"("tax_id");

-- CreateIndex
CREATE UNIQUE INDEX "pricing_snapshot_promotions_snapshot_id_promotion_id_key" ON "pricing_snapshot_promotions"("snapshot_id", "promotion_id");

-- CreateIndex
CREATE UNIQUE INDEX "promotion_redemptions_promotion_id_order_id_key" ON "promotion_redemptions"("promotion_id", "order_id");

-- CreateIndex
CREATE INDEX "floors_order_idx" ON "floors"("order");

-- CreateIndex
CREATE UNIQUE INDEX "floors_name_key" ON "floors"("name");

-- CreateIndex
CREATE UNIQUE INDEX "zones_name_key" ON "zones"("name");

-- CreateIndex
CREATE INDEX "tables_name_idx" ON "tables"("name");

-- CreateIndex
CREATE INDEX "tables_status_idx" ON "tables"("status");

-- CreateIndex
CREATE INDEX "tables_floor_id_idx" ON "tables"("floor_id");

-- CreateIndex
CREATE INDEX "tables_zone_id_idx" ON "tables"("zone_id");

-- CreateIndex
CREATE UNIQUE INDEX "tables_name_floor_id_key" ON "tables"("name", "floor_id");

-- CreateIndex
CREATE INDEX "table_sessions_session_token_idx" ON "table_sessions"("session_token");

-- CreateIndex
CREATE INDEX "table_sessions_table_id_idx" ON "table_sessions"("table_id");

-- CreateIndex
CREATE INDEX "table_sessions_created_by_idx" ON "table_sessions"("created_by");

-- CreateIndex
CREATE INDEX "table_sessions_status_idx" ON "table_sessions"("status");

-- CreateIndex
CREATE INDEX "table_sessions_start_at_end_at_idx" ON "table_sessions"("start_at", "end_at");

-- CreateIndex
CREATE UNIQUE INDEX "table_sessions_session_token_key" ON "table_sessions"("session_token");

-- CreateIndex
CREATE INDEX "orders_session_id_idx" ON "orders"("session_id");

-- CreateIndex
CREATE INDEX "orders_created_by_idx" ON "orders"("created_by");

-- CreateIndex
CREATE INDEX "orders_table_id_idx" ON "orders"("table_id");

-- CreateIndex
CREATE INDEX "orders_status_idx" ON "orders"("status");

-- CreateIndex
CREATE INDEX "orders_created_at_idx" ON "orders"("created_at");

-- CreateIndex
CREATE UNIQUE INDEX "orders_snapshot_id_key" ON "orders"("snapshot_id");

-- CreateIndex
CREATE INDEX "order_items_order_id_idx" ON "order_items"("order_id");

-- CreateIndex
CREATE INDEX "order_items_product_id_idx" ON "order_items"("product_id");

-- CreateIndex
CREATE INDEX "order_items_status_idx" ON "order_items"("status");

-- CreateIndex
CREATE INDEX "tax_configs_type_idx" ON "tax_configs"("type");

-- CreateIndex
CREATE INDEX "tax_configs_is_active_idx" ON "tax_configs"("is_active");

-- CreateIndex
CREATE INDEX "order_taxes_order_id_idx" ON "order_taxes"("order_id");

-- CreateIndex
CREATE INDEX "order_taxes_tax_id_idx" ON "order_taxes"("tax_id");

-- CreateIndex
CREATE INDEX "order_taxes_order_item_id_idx" ON "order_taxes"("order_item_id");

-- CreateIndex
CREATE INDEX "payment_methods_is_active_idx" ON "payment_methods"("is_active");

-- CreateIndex
CREATE INDEX "payment_methods_sort_order_idx" ON "payment_methods"("sort_order");

-- CreateIndex
CREATE UNIQUE INDEX "payment_methods_name_display_name_provider_key" ON "payment_methods"("name", "display_name", "provider");

-- CreateIndex
CREATE INDEX "payments_order_id_idx" ON "payments"("order_id");

-- CreateIndex
CREATE INDEX "payments_method_id_idx" ON "payments"("method_id");

-- CreateIndex
CREATE INDEX "payments_status_idx" ON "payments"("status");

-- CreateIndex
CREATE INDEX "payments_paid_at_idx" ON "payments"("paid_at");

-- CreateIndex
CREATE INDEX "payments_reference_number_idx" ON "payments"("reference_number");

-- CreateIndex
CREATE UNIQUE INDEX "cuisines_name_key" ON "cuisines"("name");

-- CreateIndex
CREATE INDEX "product_attributes_meal_session_idx" ON "product_attributes"("meal_session");

-- CreateIndex
CREATE INDEX "product_attributes_is_seasonal_idx" ON "product_attributes"("is_seasonal");

-- CreateIndex
CREATE UNIQUE INDEX "product_attributes_product_id_key" ON "product_attributes"("product_id");

-- CreateIndex
CREATE INDEX "session_preferences_session_id_idx" ON "session_preferences"("session_id");

-- CreateIndex
CREATE UNIQUE INDEX "session_preferences_session_id_key" ON "session_preferences"("session_id");

-- CreateIndex
CREATE INDEX "session_product_interactions_session_id_idx" ON "session_product_interactions"("session_id");

-- CreateIndex
CREATE INDEX "session_product_interactions_product_id_idx" ON "session_product_interactions"("product_id");

-- CreateIndex
CREATE INDEX "session_product_interactions_interaction_score_idx" ON "session_product_interactions"("interaction_score");

-- CreateIndex
CREATE INDEX "session_product_interactions_last_ordered_idx" ON "session_product_interactions"("last_ordered");

-- CreateIndex
CREATE UNIQUE INDEX "session_product_interactions_session_id_product_id_key" ON "session_product_interactions"("session_id", "product_id");

-- CreateIndex
CREATE INDEX "product_similarities_product_a_id_idx" ON "product_similarities"("product_a_id");

-- CreateIndex
CREATE INDEX "product_similarities_product_b_id_idx" ON "product_similarities"("product_b_id");

-- CreateIndex
CREATE INDEX "product_similarities_similarity_score_idx" ON "product_similarities"("similarity_score");

-- CreateIndex
CREATE UNIQUE INDEX "product_similarities_product_a_id_product_b_id_key" ON "product_similarities"("product_a_id", "product_b_id");

-- CreateIndex
CREATE INDEX "session_similarities_session_a_id_idx" ON "session_similarities"("session_a_id");

-- CreateIndex
CREATE INDEX "session_similarities_session_b_id_idx" ON "session_similarities"("session_b_id");

-- CreateIndex
CREATE INDEX "session_similarities_similarity_score_idx" ON "session_similarities"("similarity_score");

-- CreateIndex
CREATE UNIQUE INDEX "session_similarities_session_a_id_session_b_id_key" ON "session_similarities"("session_a_id", "session_b_id");

-- CreateIndex
CREATE INDEX "recommendations_session_id_idx" ON "recommendations"("session_id");

-- CreateIndex
CREATE INDEX "recommendations_product_id_idx" ON "recommendations"("product_id");

-- CreateIndex
CREATE INDEX "recommendations_hybrid_score_idx" ON "recommendations"("hybrid_score");

-- CreateIndex
CREATE INDEX "recommendations_expires_at_idx" ON "recommendations"("expires_at");

-- CreateIndex
CREATE INDEX "recommendations_rank_idx" ON "recommendations"("rank");

-- CreateIndex
CREATE UNIQUE INDEX "recommendations_session_id_product_id_model_version_key" ON "recommendations"("session_id", "product_id", "model_version");

-- CreateIndex
CREATE INDEX "session_behavior_logs_session_id_idx" ON "session_behavior_logs"("session_id");

-- CreateIndex
CREATE INDEX "session_behavior_logs_product_id_idx" ON "session_behavior_logs"("product_id");

-- CreateIndex
CREATE INDEX "session_behavior_logs_action_idx" ON "session_behavior_logs"("action");

-- CreateIndex
CREATE INDEX "session_behavior_logs_created_at_idx" ON "session_behavior_logs"("created_at");

-- AddForeignKey
ALTER TABLE "user_groups" ADD CONSTRAINT "user_groups_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_groups" ADD CONSTRAINT "user_groups_group_id_fkey" FOREIGN KEY ("group_id") REFERENCES "groups"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ingredients" ADD CONSTRAINT "ingredients_vendor_id_fkey" FOREIGN KEY ("vendor_id") REFERENCES "vendors"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ingredients" ADD CONSTRAINT "ingredients_unit_id_fkey" FOREIGN KEY ("unit_id") REFERENCES "units"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "product_ingredients" ADD CONSTRAINT "product_ingredients_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "products"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "product_ingredients" ADD CONSTRAINT "product_ingredients_ingredient_id_fkey" FOREIGN KEY ("ingredient_id") REFERENCES "ingredients"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ingredient_usages" ADD CONSTRAINT "ingredient_usages_ingredient_id_fkey" FOREIGN KEY ("ingredient_id") REFERENCES "ingredients"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ingredient_forecasts" ADD CONSTRAINT "ingredient_forecasts_ingredient_id_fkey" FOREIGN KEY ("ingredient_id") REFERENCES "ingredients"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pricing_snapshot_taxes" ADD CONSTRAINT "pricing_snapshot_taxes_snapshot_id_fkey" FOREIGN KEY ("snapshot_id") REFERENCES "pricing_snapshots"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pricing_snapshot_taxes" ADD CONSTRAINT "pricing_snapshot_taxes_tax_id_fkey" FOREIGN KEY ("tax_id") REFERENCES "tax_configs"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pricing_snapshot_promotions" ADD CONSTRAINT "pricing_snapshot_promotions_snapshot_id_fkey" FOREIGN KEY ("snapshot_id") REFERENCES "pricing_snapshots"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pricing_snapshot_promotions" ADD CONSTRAINT "pricing_snapshot_promotions_promotion_id_fkey" FOREIGN KEY ("promotion_id") REFERENCES "promotions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "promotion_redemptions" ADD CONSTRAINT "promotion_redemptions_promotion_id_fkey" FOREIGN KEY ("promotion_id") REFERENCES "promotions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "promotion_redemptions" ADD CONSTRAINT "promotion_redemptions_snapshot_id_fkey" FOREIGN KEY ("snapshot_id") REFERENCES "pricing_snapshots"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "promotion_redemptions" ADD CONSTRAINT "promotion_redemptions_order_id_fkey" FOREIGN KEY ("order_id") REFERENCES "orders"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tables" ADD CONSTRAINT "tables_zone_id_fkey" FOREIGN KEY ("zone_id") REFERENCES "zones"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tables" ADD CONSTRAINT "tables_floor_id_fkey" FOREIGN KEY ("floor_id") REFERENCES "floors"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "table_sessions" ADD CONSTRAINT "table_sessions_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "table_sessions" ADD CONSTRAINT "table_sessions_table_id_fkey" FOREIGN KEY ("table_id") REFERENCES "tables"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "orders" ADD CONSTRAINT "orders_snapshot_id_fkey" FOREIGN KEY ("snapshot_id") REFERENCES "pricing_snapshots"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "orders" ADD CONSTRAINT "orders_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "orders" ADD CONSTRAINT "orders_table_id_fkey" FOREIGN KEY ("table_id") REFERENCES "tables"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "orders" ADD CONSTRAINT "orders_session_id_fkey" FOREIGN KEY ("session_id") REFERENCES "table_sessions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "order_items" ADD CONSTRAINT "order_items_order_id_fkey" FOREIGN KEY ("order_id") REFERENCES "orders"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "order_items" ADD CONSTRAINT "order_items_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "products"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "order_taxes" ADD CONSTRAINT "order_taxes_order_id_fkey" FOREIGN KEY ("order_id") REFERENCES "orders"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "order_taxes" ADD CONSTRAINT "order_taxes_tax_id_fkey" FOREIGN KEY ("tax_id") REFERENCES "tax_configs"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "order_taxes" ADD CONSTRAINT "order_taxes_order_item_id_fkey" FOREIGN KEY ("order_item_id") REFERENCES "order_items"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payments" ADD CONSTRAINT "payments_order_id_fkey" FOREIGN KEY ("order_id") REFERENCES "orders"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payments" ADD CONSTRAINT "payments_method_id_fkey" FOREIGN KEY ("method_id") REFERENCES "payment_methods"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payments" ADD CONSTRAINT "payments_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cuisines" ADD CONSTRAINT "cuisines_sessionPreferenceId_fkey" FOREIGN KEY ("sessionPreferenceId") REFERENCES "session_preferences"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "product_attributes" ADD CONSTRAINT "product_attributes_cuisine_id_fkey" FOREIGN KEY ("cuisine_id") REFERENCES "cuisines"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "product_attributes" ADD CONSTRAINT "product_attributes_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "products"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "session_preferences" ADD CONSTRAINT "session_preferences_session_id_fkey" FOREIGN KEY ("session_id") REFERENCES "table_sessions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "session_product_interactions" ADD CONSTRAINT "session_product_interactions_session_id_fkey" FOREIGN KEY ("session_id") REFERENCES "table_sessions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "session_product_interactions" ADD CONSTRAINT "session_product_interactions_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "products"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "product_similarities" ADD CONSTRAINT "product_similarities_product_a_id_fkey" FOREIGN KEY ("product_a_id") REFERENCES "products"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "product_similarities" ADD CONSTRAINT "product_similarities_product_b_id_fkey" FOREIGN KEY ("product_b_id") REFERENCES "products"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "session_similarities" ADD CONSTRAINT "session_similarities_session_a_id_fkey" FOREIGN KEY ("session_a_id") REFERENCES "table_sessions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "session_similarities" ADD CONSTRAINT "session_similarities_session_b_id_fkey" FOREIGN KEY ("session_b_id") REFERENCES "table_sessions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "recommendations" ADD CONSTRAINT "recommendations_session_id_fkey" FOREIGN KEY ("session_id") REFERENCES "table_sessions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "recommendations" ADD CONSTRAINT "recommendations_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "products"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "session_behavior_logs" ADD CONSTRAINT "session_behavior_logs_session_id_fkey" FOREIGN KEY ("session_id") REFERENCES "table_sessions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "session_behavior_logs" ADD CONSTRAINT "session_behavior_logs_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "products"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Notification" ADD CONSTRAINT "Notification_group_id_fkey" FOREIGN KEY ("group_id") REFERENCES "groups"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Notification" ADD CONSTRAINT "Notification_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notification_targets" ADD CONSTRAINT "notification_targets_notification_id_fkey" FOREIGN KEY ("notification_id") REFERENCES "Notification"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notification_targets" ADD CONSTRAINT "notification_targets_group_id_fkey" FOREIGN KEY ("group_id") REFERENCES "groups"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_notifications" ADD CONSTRAINT "user_notifications_notification_id_fkey" FOREIGN KEY ("notification_id") REFERENCES "Notification"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_notifications" ADD CONSTRAINT "user_notifications_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

