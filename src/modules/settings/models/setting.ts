import { model } from "@medusajs/framework/utils"

export const Setting = model.define("setting", {
  id: model.id({ prefix: "setting" }).primaryKey(),
  tenant_id: model.text(),
  group: model.text(),
  key: model.text(),
  value: model.json(),
  description: model.text().nullable(),
  metadata: model.json().nullable(),
})
