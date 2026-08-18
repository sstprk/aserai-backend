import { model } from "@medusajs/framework/utils"

export const ApiCredential = model.define("api_credential", {
  id: model.id({ prefix: "apicred" }).primaryKey(),
  tenant_id: model.text(),
  provider: model.text(),
  credentials_encrypted: model.json(),
  is_active: model.boolean().default(true),
  metadata: model.json().nullable(),
})
