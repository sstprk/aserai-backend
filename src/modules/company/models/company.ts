import { model } from "@medusajs/framework/utils";
import { Employee } from "./employee";

export const Company = model.define("company", {
  id: model
    .id({
      prefix: "comp",
    })
    .primaryKey(),
  name: model.text(),
  email: model.text(),
  phone: model.text().nullable(),
  address: model.text().nullable(),
  city: model.text().nullable(),
  state: model.text().nullable(),
  zip: model.text().nullable(),
  country: model.text().nullable(),
  logo_url: model.text().nullable(),
  currency_code: model.text().nullable(),
  spending_limit_reset_frequency: model
    .enum(["never", "daily", "weekly", "monthly", "yearly"])
    .default("monthly"),
  // --- Aserai Commerce Extensions ---
  tenant_id: model.text(),
  tax_id: model.text().nullable(),
  trade_registry_no: model.text().nullable(),
  iban: model.text().nullable(),
  org_type: model
    .enum(["manufacturer", "distributor", "retailer", "other"])
    .nullable(),
  // --- Relations ---
  employees: model.hasMany(() => Employee),
});
