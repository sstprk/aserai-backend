import { QUOTE_MODULE } from "./src/modules/quote";
import { APPROVAL_MODULE } from "./src/modules/approval";
import { COMPANY_MODULE } from "./src/modules/company";
import { TENANT_MODULE } from "./src/modules/tenant";
import { BRAND_MODULE } from "./src/modules/brand";
import { RBAC_MODULE } from "./src/modules/rbac";
import { SETTINGS_MODULE } from "./src/modules/settings";
import { FEATURE_FLAG_MODULE } from "./src/modules/feature-flag";
import { SUBSCRIPTION_PLAN_MODULE } from "./src/modules/subscription-plan";
import { ASERAI_ADDRESS_MODULE } from "./src/modules/aserai-address";
import { UNIT_MODULE } from "./src/modules/unit";
import { TAX_GROUP_MODULE } from "./src/modules/tax-group";
import { DEALER_MODULE } from "./src/modules/dealer";
import { AUDIT_MODULE } from "./src/modules/audit";
import { WEBHOOK_MODULE } from "./src/modules/webhook";
import { API_CREDENTIAL_MODULE } from "./src/modules/api-credential";
import { REFERENCE_DATA_MODULE } from "./src/modules/reference-data";
import { PRODUCT_BUNDLE_MODULE } from "./src/modules/product-bundle";
import { NOTIFICATION_MODULE } from "./src/modules/notification";
import { loadEnv, defineConfig, Modules } from "@medusajs/framework/utils";

loadEnv(process.env.NODE_ENV!, process.cwd());

module.exports = defineConfig({
  projectConfig: {
    databaseUrl: process.env.DATABASE_URL,
    // Enable SSL only when the target DB requires it (e.g. Supabase for testing).
    // Local Postgres (used for deploy) leaves DATABASE_SSL unset → no SSL.
    databaseDriverOptions:
      process.env.DATABASE_SSL === "true"
        ? { connection: { ssl: { rejectUnauthorized: false } } }
        : {},
    http: {
      storeCors: process.env.STORE_CORS!,
      adminCors: process.env.ADMIN_CORS!,
      authCors: process.env.AUTH_CORS!,
      jwtSecret: process.env.JWT_SECRET || "supersecret",
      cookieSecret: process.env.COOKIE_SECRET || "supersecret",
    },
  },
  modules: {
    // --- B2B Starter Modules (preserved) ---
    [COMPANY_MODULE]: {
      resolve: "./modules/company",
    },
    [QUOTE_MODULE]: {
      resolve: "./modules/quote",
    },
    [APPROVAL_MODULE]: {
      resolve: "./modules/approval",
    },
    // --- Aserai Commerce: Identity Domain ---
    [TENANT_MODULE]: {
      resolve: "./modules/tenant",
    },
    [SUBSCRIPTION_PLAN_MODULE]: {
      resolve: "./modules/subscription-plan",
    },
    [RBAC_MODULE]: {
      resolve: "./modules/rbac",
    },
    [REFERENCE_DATA_MODULE]: {
      resolve: "./modules/reference-data",
    },
    // --- Aserai Commerce: Master Data Domain ---
    [BRAND_MODULE]: {
      resolve: "./modules/brand",
    },
    [UNIT_MODULE]: {
      resolve: "./modules/unit",
    },
    [TAX_GROUP_MODULE]: {
      resolve: "./modules/tax-group",
    },
    [PRODUCT_BUNDLE_MODULE]: {
      resolve: "./modules/product-bundle",
    },
    // --- Aserai Commerce: Commerce Primitive Domain ---
    [ASERAI_ADDRESS_MODULE]: {
      resolve: "./modules/aserai-address",
    },
    [DEALER_MODULE]: {
      resolve: "./modules/dealer",
    },
    // --- Aserai Commerce: Infrastructure Domain ---
    [AUDIT_MODULE]: {
      resolve: "./modules/audit",
    },
    [WEBHOOK_MODULE]: {
      resolve: "./modules/webhook",
    },
    [API_CREDENTIAL_MODULE]: {
      resolve: "./modules/api-credential",
    },
    [SETTINGS_MODULE]: {
      resolve: "./modules/settings",
    },
    [FEATURE_FLAG_MODULE]: {
      resolve: "./modules/feature-flag",
    },
    [NOTIFICATION_MODULE]: {
      resolve: "./modules/notification",
    },
    // --- Medusa Core Module Overrides ---
    [Modules.CACHE]: {
      resolve: "@medusajs/medusa/cache-inmemory",
    },
    [Modules.WORKFLOW_ENGINE]: {
      resolve: "@medusajs/medusa/workflow-engine-inmemory",
    },
  },
});
