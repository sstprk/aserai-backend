-- Aserai Commerce: Core Entity Extensions
-- Migration: Add custom columns to Medusa core entities
-- Policy: ADD COLUMN only (nullable/default) — no DROP, RENAME, ALTER TYPE

-- =============================================================
-- 1. Customer Extensions
-- =============================================================
ALTER TABLE IF EXISTS "customer"
  ADD COLUMN IF NOT EXISTS "customer_type" varchar(20) DEFAULT 'individual',
  ADD COLUMN IF NOT EXISTS "organization_id" text,
  ADD COLUMN IF NOT EXISTS "tax_id" text;

COMMENT ON COLUMN "customer"."customer_type" IS 'individual or corporate — enables B2C/B2B distinction';
COMMENT ON COLUMN "customer"."organization_id" IS 'FK to company table — nullable for B2C customers';
COMMENT ON COLUMN "customer"."tax_id" IS 'Tax identification number for corporate customers';

-- =============================================================
-- 2. Product Extensions
-- =============================================================
ALTER TABLE IF EXISTS "product"
  ADD COLUMN IF NOT EXISTS "product_kind" varchar(20) DEFAULT 'simple';

COMMENT ON COLUMN "product"."product_kind" IS 'simple, variant, or bundle — determines product behavior';

-- =============================================================
-- 3. ProductVariant Extensions
-- =============================================================
ALTER TABLE IF EXISTS "product_variant"
  ADD COLUMN IF NOT EXISTS "custom_attributes" jsonb DEFAULT '{}';

COMMENT ON COLUMN "product_variant"."custom_attributes" IS 'Custom key-value attributes separate from Medusa metadata';

-- =============================================================
-- 4. ProductCategory Extensions
-- =============================================================
ALTER TABLE IF EXISTS "product_category"
  ADD COLUMN IF NOT EXISTS "mpath" text;

CREATE INDEX CONCURRENTLY IF NOT EXISTS "idx_product_category_mpath"
  ON "product_category" ("mpath");

COMMENT ON COLUMN "product_category"."mpath" IS 'Materialized path for fast tree queries (e.g., "1.3.7.")';

-- =============================================================
-- 5. StockLocation/Warehouse Extensions
-- =============================================================
ALTER TABLE IF EXISTS "stock_location"
  ADD COLUMN IF NOT EXISTS "warehouse_type" varchar(20) DEFAULT 'physical',
  ADD COLUMN IF NOT EXISTS "tenant_id" text;

COMMENT ON COLUMN "stock_location"."warehouse_type" IS 'physical or virtual warehouse type';
COMMENT ON COLUMN "stock_location"."tenant_id" IS 'Tenant FK for multi-tenancy isolation';

-- =============================================================
-- 6. Company Extensions
-- =============================================================
ALTER TABLE IF EXISTS "company"
  ADD COLUMN IF NOT EXISTS "tenant_id" text,
  ADD COLUMN IF NOT EXISTS "tax_id" text,
  ADD COLUMN IF NOT EXISTS "trade_registry_no" text,
  ADD COLUMN IF NOT EXISTS "iban" text,
  ADD COLUMN IF NOT EXISTS "org_type" varchar(50);

COMMENT ON COLUMN "company"."tenant_id" IS 'Tenant ID for multi-tenant isolation';
COMMENT ON COLUMN "company"."tax_id" IS 'Tax identification number';
COMMENT ON COLUMN "company"."trade_registry_no" IS 'Trade registry registry number';
COMMENT ON COLUMN "company"."iban" IS 'IBAN for banking info';
COMMENT ON COLUMN "company"."org_type" IS 'Organization type (manufacturer/distributor/retailer/other)';

