import { model } from "@medusajs/framework/utils"
import { Role } from "./role"

export const RoleAssignment = model.define("role_assignment", {
  id: model.id({ prefix: "rassign" }).primaryKey(),
  tenant_id: model.text(),
  actor_type: model.enum(["user", "customer", "api_client"]),
  actor_id: model.text(),
  role: model.belongsTo(() => Role, { mappedBy: "assignments" }),
  metadata: model.json().nullable(),
})
