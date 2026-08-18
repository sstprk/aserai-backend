import { Module } from "@medusajs/framework/utils"
import DealerModuleService from "./service"

export const DEALER_MODULE = "dealerModuleService"

export default Module(DEALER_MODULE, {
  service: DealerModuleService,
})
