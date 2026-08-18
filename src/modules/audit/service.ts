import { MedusaService } from "@medusajs/framework/utils"
import { AuditLog } from "./models"

class AuditModuleService extends MedusaService({ AuditLog }) {}

export default AuditModuleService
