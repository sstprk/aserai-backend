import type {
  AuthenticatedMedusaRequest,
  MedusaResponse,
} from "@medusajs/framework"
import { TENANT_MODULE } from "../../../modules/tenant"
import type TenantModuleService from "../../../modules/tenant/service"
import type { AdminCreateTenantType } from "./validators"

export const GET = async (
  req: AuthenticatedMedusaRequest,
  res: MedusaResponse
) => {
  const service: TenantModuleService = req.scope.resolve(TENANT_MODULE)
  const tenants = await service.listTenants(
    {},
    { order: { created_at: "DESC" } }
  )
  res.json({ tenants, count: tenants.length })
}

export const POST = async (
  req: AuthenticatedMedusaRequest<AdminCreateTenantType>,
  res: MedusaResponse
) => {
  const service: TenantModuleService = req.scope.resolve(TENANT_MODULE)
  const existing = await service.listTenants({ slug: req.validatedBody.slug })

  if (existing.length) {
    res.status(409).json({
      error: {
        code: "TENANT_SLUG_EXISTS",
        message: "Tenant slug already exists",
        details: { slug: req.validatedBody.slug },
        traceId: (req as any).trace_id,
      },
    })
    return
  }

  const tenant = await service.createTenants(req.validatedBody)
  res.status(201).json({ tenant })
}
