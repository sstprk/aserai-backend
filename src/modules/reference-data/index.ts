import { Module } from "@medusajs/framework/utils"
import ReferenceDataModuleService from "./service"

export const REFERENCE_DATA_MODULE = "referenceDataModuleService"

export default Module(REFERENCE_DATA_MODULE, {
  service: ReferenceDataModuleService,
})
