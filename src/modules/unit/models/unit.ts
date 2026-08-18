import { model } from "@medusajs/framework/utils"
import { UnitConversion } from "./unit-conversion"

export const Unit = model.define("unit", {
  id: model.id({ prefix: "unit" }).primaryKey(),
  tenant_id: model.text(),
  name: model.text(),
  code: model.text(),
  unit_type: model.enum(["weight", "length", "volume", "count", "area"]).default("count"),
  metadata: model.json().nullable(),
  conversions_from: model.hasMany(() => UnitConversion, { mappedBy: "from_unit" }),
})
