import { model } from "@medusajs/framework/utils";

export const NotificationDelivery = model.define("notification_delivery", {
  id: model.id({ prefix: "ndel" }).primaryKey(),
  tenant_id: model.text(),
  channel: model.enum(["email", "sms"]),
  recipient: model.text(),
  template_key: model.text(),
  provider: model.text(),
  status: model.enum(["pending", "sent", "failed"]).default("pending"),
  provider_message_id: model.text().nullable(),
  error_message: model.text().nullable(),
  payload: model.json().nullable(),
  sent_at: model.dateTime().nullable(),
});
