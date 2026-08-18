import { model } from "@medusajs/framework/utils"

export const Timezone = model.define("timezone", {
  id: model.id({ prefix: "tz" }).primaryKey(),
  identifier: model.text(),
  utc_offset: model.text(),
  display_name: model.text(),
  metadata: model.json().nullable(),
})
