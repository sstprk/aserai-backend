import { Module } from "@medusajs/framework/utils"
import AuditModuleService from "./service"

export const AUDIT_MODULE = "auditModuleService"

export default Module(AUDIT_MODULE, {
  service: AuditModuleService,
})
