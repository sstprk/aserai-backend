import { model } from "@medusajs/framework/utils"

export const ApiClient = model.define("api_client", {
  id: model.id({ prefix: "apicli" }).primaryKey(),
  tenant_id: model.text(),
  name: model.text(),
  client_id: model.text(),
  client_secret_hash: model.text(),
  scopes: model.json().nullable(),
  is_active: model.boolean().default(true),
  metadata: model.json().nullable(),
})
