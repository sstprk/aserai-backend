import { model } from "@medusajs/framework/utils"

export const Tenant = model.define("tenant", {
  id: model.id({ prefix: "tenant" }).primaryKey(),
  name: model.text(),
  slug: model.text(),
  domain: model.text().nullable(),
  is_active: model.boolean().default(true),
  config: model.json().nullable(),
  subscription_plan_id: model.text().nullable(),
  metadata: model.json().nullable(),
})
