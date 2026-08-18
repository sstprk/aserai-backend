import { MedusaService } from "@medusajs/framework/utils"
import { Tenant } from "./models"

class TenantModuleService extends MedusaService({ Tenant }) {}

export default TenantModuleService
