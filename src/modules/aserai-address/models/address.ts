import { model } from "@medusajs/framework/utils"

export const Address = model.define("aserai_address", {
  id: model.id({ prefix: "addr" }).primaryKey(),
  tenant_id: model.text(),
  owner_type: model.text(),
  owner_id: model.text(),
  type: model.enum(["billing", "shipping", "default"]).default("default"),
  label: model.text().nullable(),
  first_name: model.text().nullable(),
  last_name: model.text().nullable(),
  company_name: model.text().nullable(),
  address_1: model.text(),
  address_2: model.text().nullable(),
  city: model.text(),
  province: model.text().nullable(),
  postal_code: model.text().nullable(),
  country_code: model.text(),
  phone: model.text().nullable(),
  is_default: model.boolean().default(false),
  metadata: model.json().nullable(),
})
