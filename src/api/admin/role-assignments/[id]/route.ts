import type { AuthenticatedMedusaRequest, MedusaResponse } from "@medusajs/framework"
import { RBAC_MODULE } from "../../../../modules/rbac"
import type RbacModuleService from "../../../../modules/rbac/service"
import { getTenantId } from "../../../../types/tenant-context"

export const DELETE = async (req: AuthenticatedMedusaRequest, res: MedusaResponse) => {
  const service: RbacModuleService = req.scope.resolve(RBAC_MODULE)
  const assignment = (await service.listRoleAssignments({ id: req.params.id, tenant_id: getTenantId(req) }))[0]
  if (!assignment) return res.status(404).json({ error: { code: "ROLE_ASSIGNMENT_NOT_FOUND", message: "Role assignment not found", details: {}, traceId: (req as any).trace_id } })
  await service.deleteRoleAssignments(assignment.id)
  res.status(204).send()
}
