import type { AuthenticatedMedusaRequest, MedusaResponse } from "@medusajs/framework"
import { RBAC_MODULE } from "../../../../../modules/rbac"
import type RbacModuleService from "../../../../../modules/rbac/service"
import { getTenantId } from "../../../../../types/tenant-context"
import type { AdminCreatePermissionType } from "../../validators"

export const POST = async (
  req: AuthenticatedMedusaRequest<AdminCreatePermissionType>,
  res: MedusaResponse
) => {
  const service: RbacModuleService = req.scope.resolve(RBAC_MODULE)
  const tenantId = getTenantId(req)
  const role = (await service.listRoles({ id: req.params.id, tenant_id: tenantId }))[0]
  if (!role) return res.status(404).json({ error: { code: "ROLE_NOT_FOUND", message: "Role not found", details: {}, traceId: (req as any).trace_id } })
  const permission = await service.createPermissions({ ...req.validatedBody, tenant_id: tenantId, role_id: role.id })
  res.status(201).json({ permission })
}
