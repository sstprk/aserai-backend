import { model } from "@medusajs/framework/utils"
import { Unit } from "./unit"

export const UnitConversion = model.define("unit_conversion", {
  id: model.id({ prefix: "uconv" }).primaryKey(),
  tenant_id: model.text(),
  from_unit: model.belongsTo(() => Unit, { mappedBy: "conversions_from" }),
  to_unit_id: model.text(),
  factor: model.bigNumber(),
  metadata: model.json().nullable(),
})
