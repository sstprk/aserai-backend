import { model } from "@medusajs/framework/utils"

export const Dealer = model.define("dealer", {
  id: model.id({ prefix: "dealer" }).primaryKey(),
  tenant_id: model.text(),
  name: model.text(),
  code: model.text(),
  status: model.enum(["active", "inactive", "suspended"]).default("active"),
  metadata: model.json().nullable(),
})
