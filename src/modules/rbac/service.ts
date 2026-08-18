import { MedusaService } from "@medusajs/framework/utils"
import { Role, Permission, RoleAssignment } from "./models"

class RbacModuleService extends MedusaService({ Role, Permission, RoleAssignment }) {}

export default RbacModuleService
