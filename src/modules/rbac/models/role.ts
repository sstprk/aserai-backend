import { model } from "@medusajs/framework/utils"
import { Permission } from "./permission"
import { RoleAssignment } from "./role-assignment"

export const Role = model.define("role", {
  id: model.id({ prefix: "role" }).primaryKey(),
  tenant_id: model.text(),
  name: model.text(),
  slug: model.text(),
  description: model.text().nullable(),
  is_system: model.boolean().default(false),
  permissions: model.hasMany(() => Permission),
  assignments: model.hasMany(() => RoleAssignment),
  metadata: model.json().nullable(),
})
