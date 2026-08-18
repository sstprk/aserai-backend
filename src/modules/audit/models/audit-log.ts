import { model } from "@medusajs/framework/utils"

export const AuditLog = model.define("audit_log", {
  id: model.id({ prefix: "audit" }).primaryKey(),
  tenant_id: model.text(),
  entity_type: model.text(),
  entity_id: model.text(),
  action: model.enum(["create", "update", "delete"]).default("create"),
  actor_id: model.text().nullable(),
  actor_type: model.text().nullable(),
  diff: model.json().nullable(),
  ip_address: model.text().nullable(),
  user_agent: model.text().nullable(),
  metadata: model.json().nullable(),
})
