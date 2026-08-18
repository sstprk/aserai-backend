import { Module } from "@medusajs/framework/utils"
import AseraiAddressModuleService from "./service"

export const ASERAI_ADDRESS_MODULE = "aseraiAddressModuleService"

export default Module(ASERAI_ADDRESS_MODULE, {
  service: AseraiAddressModuleService,
})
