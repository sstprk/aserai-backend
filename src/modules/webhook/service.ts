import { MedusaService } from "@medusajs/framework/utils"
import { WebhookEndpoint } from "./models"

class WebhookModuleService extends MedusaService({ WebhookEndpoint }) {}

export default WebhookModuleService
