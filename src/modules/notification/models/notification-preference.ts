import { model } from "@medusajs/framework/utils";

export const NotificationPreference = model.define(
  "notification_preference",
  {
    id: model.id({ prefix: "npref" }).primaryKey(),
    tenant_id: model.text(),
    actor_type: model.enum(["user", "customer"]),
    actor_id: model.text(),
    channel: model.enum(["email", "sms"]),
    event_key: model.text(),
    enabled: model.boolean().default(true),
  }
);
