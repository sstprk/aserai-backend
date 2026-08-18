import type { AuthenticatedMedusaRequest, MedusaResponse } from "@medusajs/framework"
import { RBAC_MODULE } from "../../../../../../modules/rbac"
import type RbacModuleService from "../../../../../../modules/rbac/service"
import { getTenantId } from "../../../../../../types/tenant-context"

export const DELETE = async (req: AuthenticatedMedusaRequest, res: MedusaResponse) => {
  const service: RbacModuleService = req.scope.resolve(RBAC_MODULE)
  const permission = (await service.listPermissions({ id: req.params.permissionId, tenant_id: getTenantId(req), role_id: req.params.id }))[0]
  if (!permission) return res.status(404).json({ error: { code: "PERMISSION_NOT_FOUND", message: "Permission not found", details: {}, traceId: (req as any).trace_id } })
  await service.deletePermissions(permission.id)
  res.status(204).send()
}
