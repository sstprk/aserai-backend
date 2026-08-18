import { model } from "@medusajs/framework/utils"

export const ProductBundleItem = model.define("product_bundle_item", {
  id: model.id({ prefix: "pbi" }).primaryKey(),
  tenant_id: model.text(),
  product_id: model.text(),
  child_product_id: model.text(),
  quantity: model.number().default(1),
  sort_order: model.number().default(0),
  metadata: model.json().nullable(),
})
