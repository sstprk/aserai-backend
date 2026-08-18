import { MedusaService } from "@medusajs/framework/utils"
import { FeatureFlag } from "./models"

class FeatureFlagModuleService extends MedusaService({ FeatureFlag }) {}

export default FeatureFlagModuleService
