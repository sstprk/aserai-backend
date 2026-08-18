import { model } from "@medusajs/framework/utils"

export const SubscriptionPlan = model.define("subscription_plan", {
  id: model.id({ prefix: "subplan" }).primaryKey(),
  name: model.text(),
  slug: model.text(),
  tier: model.enum(["free", "starter", "pro", "enterprise"]).default("free"),
  price_monthly: model.bigNumber().default(0),
  price_yearly: model.bigNumber().default(0),
  max_products: model.number().nullable(),
  max_orders_per_month: model.number().nullable(),
  max_users: model.number().nullable(),
  features: model.json().nullable(),
  is_active: model.boolean().default(true),
  metadata: model.json().nullable(),
})
