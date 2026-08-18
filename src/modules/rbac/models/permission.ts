import { model } from "@medusajs/framework/utils"
import { Role } from "./role"

export const Permission = model.define("permission", {
  id: model.id({ prefix: "perm" }).primaryKey(),
  tenant_id: model.text(),
  resource: model.text(),
  action: model.text(),
  description: model.text().nullable(),
  role: model.belongsTo(() => Role, { mappedBy: "permissions" }),
})
