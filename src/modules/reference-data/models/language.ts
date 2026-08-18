import { model } from "@medusajs/framework/utils"

export const Language = model.define("language", {
  id: model.id({ prefix: "lang" }).primaryKey(),
  code: model.text(),
  name: model.text(),
  native_name: model.text().nullable(),
  is_rtl: model.boolean().default(false),
  metadata: model.json().nullable(),
})
