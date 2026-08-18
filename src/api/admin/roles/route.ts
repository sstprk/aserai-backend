import type {
  AuthenticatedMedusaRequest,
  MedusaResponse,
} from "@medusajs/framework"
import { RBAC_MODULE } from "../../../modules/rbac"
import type RbacModuleService from "../../../modules/rbac/service"
import { getTenantId } from "../../../types/tenant-context"
import type { AdminCreateRoleType } from "./validators"

export const GET = async (
  req: AuthenticatedMedusaRequest,
  res: MedusaResponse
) => {
  const service: RbacModuleService = req.scope.resolve(RBAC_MODULE)
  const tenantId = getTenantId(req)
  const roles = await service.listRoles(
    { tenant_id: tenantId },
    { relations: ["permissions"], order: { name: "ASC" } }
  )
  res.json({ roles, count: roles.length })
}

export const POST = async (
  req: AuthenticatedMedusaRequest<AdminCreateRoleType>,
  res: MedusaResponse
) => {
  const service: RbacModuleService = req.scope.resolve(RBAC_MODULE)
  const tenantId = getTenantId(req)
  const { permissions, ...input } = req.validatedBody
  const duplicate = await service.listRoles({ tenant_id: tenantId, slug: input.slug })

  if (duplicate.length) {
    res.status(409).json({ error: { code: "ROLE_SLUG_EXISTS", message: "Role slug already exists", details: { slug: input.slug }, traceId: (req as any).trace_id } })
    return
  }

  const role = await service.createRoles({ ...input, tenant_id: tenantId })
  if (permissions.length) {
    await service.createPermissions(
      permissions.map((permission) => ({
        ...permission,
        tenant_id: tenantId,
        role_id: role.id,
      }))
    )
  }

  const created = await service.retrieveRole(role.id, { relations: ["permissions"] })
  res.status(201).json({ role: created })
}
