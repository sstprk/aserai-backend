import { Module } from "@medusajs/framework/utils"
import TaxGroupModuleService from "./service"

export const TAX_GROUP_MODULE = "taxGroupModuleService"

export default Module(TAX_GROUP_MODULE, {
  service: TaxGroupModuleService,
})
