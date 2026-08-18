import { Module } from "@medusajs/framework/utils"
import UnitModuleService from "./service"

export const UNIT_MODULE = "unitModuleService"

export default Module(UNIT_MODULE, {
  service: UnitModuleService,
})
