import { Module } from "@medusajs/framework/utils"
import TenantModuleService from "./service"

export const TENANT_MODULE = "tenantModuleService"

export default Module(TENANT_MODULE, {
  service: TenantModuleService,
})
