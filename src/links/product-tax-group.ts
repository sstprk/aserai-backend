import { defineLink } from "@medusajs/framework/utils";
import ProductModule from "@medusajs/medusa/product";
import TaxGroupModule from "../modules/tax-group";

export default defineLink(
  ProductModule.linkable.product,
  TaxGroupModule.linkable.taxGroup
);
