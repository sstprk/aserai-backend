import { model } from "@medusajs/framework/utils"

export const TaxGroup = model.define("tax_group", {
  id: model.id({ prefix: "taxgrp" }).primaryKey(),
  tenant_id: model.text(),
  name: model.text(),
  description: model.text().nullable(),
  rates: model.json().nullable(),
  is_active: model.boolean().default(true),
  metadata: model.json().nullable(),
})
