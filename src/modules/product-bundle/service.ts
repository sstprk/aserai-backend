import { MedusaService } from "@medusajs/framework/utils"
import { ProductBundleItem } from "./models"

class ProductBundleModuleService extends MedusaService({ ProductBundleItem }) {}

export default ProductBundleModuleService
