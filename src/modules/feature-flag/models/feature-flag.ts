import { model } from "@medusajs/framework/utils"

export const FeatureFlag = model.define("feature_flag", {
  id: model.id({ prefix: "ff" }).primaryKey(),
  tenant_id: model.text(),
  flag_key: model.text(),
  is_enabled: model.boolean().default(false),
  description: model.text().nullable(),
  config: model.json().nullable(),
  metadata: model.json().nullable(),
})
