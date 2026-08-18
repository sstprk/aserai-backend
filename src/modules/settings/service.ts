import { MedusaService } from "@medusajs/framework/utils"
import { Setting } from "./models"

class SettingsModuleService extends MedusaService({ Setting }) {}

export default SettingsModuleService
