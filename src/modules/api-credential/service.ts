import { MedusaService } from "@medusajs/framework/utils"
import { ApiClient, ApiCredential } from "./models"

class ApiCredentialModuleService extends MedusaService({ ApiClient, ApiCredential }) {}

export default ApiCredentialModuleService
