import { model } from "@medusajs/framework/utils"

export const WebhookEndpoint = model.define("webhook_endpoint", {
  id: model.id({ prefix: "whep" }).primaryKey(),
  tenant_id: model.text(),
  url: model.text(),
  events: model.json(),
  secret: model.text().nullable(),
  is_active: model.boolean().default(true),
  description: model.text().nullable(),
  metadata: model.json().nullable(),
})
