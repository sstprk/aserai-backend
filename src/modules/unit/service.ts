import { MedusaService } from "@medusajs/framework/utils"
import { Unit, UnitConversion } from "./models"

class UnitModuleService extends MedusaService({ Unit, UnitConversion }) {}

export default UnitModuleService
