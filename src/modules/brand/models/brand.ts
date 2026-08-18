import { model } from "@medusajs/framework/utils"

export const Brand = model.define("brand", {
  id: model.id({ prefix: "brand" }).primaryKey(),
  tenant_id: model.text(),
  name: model.text(),
  slug: model.text(),
  logo_url: model.text().nullable(),
  description: model.text().nullable(),
  metadata: model.json().nullable(),
})
