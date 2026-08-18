import { model } from "@medusajs/framework/utils";

export const NotificationTemplate = model.define("notification_template", {
  id: model.id({ prefix: "ntpl" }).primaryKey(),
  tenant_id: model.text(),
  key: model.text(),
  channel: model.enum(["email", "sms"]),
  subject: model.text().nullable(),
  body: model.text(),
  locale: model.text().default("tr-TR"),
  is_active: model.boolean().default(true),
  metadata: model.json().nullable(),
});
