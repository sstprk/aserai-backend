import { MedusaService } from "@medusajs/framework/utils"
import { Language, Timezone } from "./models"

class ReferenceDataModuleService extends MedusaService({ Language, Timezone }) {}

export default ReferenceDataModuleService
