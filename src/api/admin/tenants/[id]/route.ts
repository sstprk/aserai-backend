import type {
  AuthenticatedMedusaRequest,
  MedusaResponse,
} from "@medusajs/framework"
import { TENANT_MODULE } from "../../../../modules/tenant"
import type TenantModuleService from "../../../../modules/tenant/service"
import type { AdminUpdateTenantType } from "../validators"

export const GET = async (
  req: AuthenticatedMedusaRequest,
  res: MedusaResponse
) => {
  const service: TenantModuleService = req.scope.resolve(TENANT_MODULE)
  const tenant = await service.retrieveTenant(req.params.id)
  res.json({ tenant })
}

export const POST = async (
  req: AuthenticatedMedusaRequest<AdminUpdateTenantType>,
  res: MedusaResponse
) => {
  const service: TenantModuleService = req.scope.resolve(TENANT_MODULE)
  const tenant = await service.updateTenants({
    id: req.params.id,
    ...req.validatedBody,
  })
  res.json({ tenant })
}
