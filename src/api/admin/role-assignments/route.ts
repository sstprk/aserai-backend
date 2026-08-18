import type { AuthenticatedMedusaRequest, MedusaResponse } from "@medusajs/framework"
import { RBAC_MODULE } from "../../../modules/rbac"
import type RbacModuleService from "../../../modules/rbac/service"
import { getTenantId } from "../../../types/tenant-context"
import type { AdminCreateRoleAssignmentType } from "../roles/validators"

export const GET = async (req: AuthenticatedMedusaRequest, res: MedusaResponse) => {
  const service: RbacModuleService = req.scope.resolve(RBAC_MODULE)
  const assignments = await service.listRoleAssignments(
    { tenant_id: getTenantId(req) },
    { relations: ["role", "role.permissions"] }
  )
  res.json({ role_assignments: assignments, count: assignments.length })
}

export const POST = async (
  req: AuthenticatedMedusaRequest<AdminCreateRoleAssignmentType>,
  res: MedusaResponse
) => {
  const service: RbacModuleService = req.scope.resolve(RBAC_MODULE)
  const tenantId = getTenantId(req)
  const role = (await service.listRoles({ id: req.validatedBody.role_id, tenant_id: tenantId }))[0]
  if (!role) return res.status(404).json({ error: { code: "ROLE_NOT_FOUND", message: "Role not found", details: {}, traceId: (req as any).trace_id } })
  const existing = await service.listRoleAssignments({ tenant_id: tenantId, actor_type: req.validatedBody.actor_type, actor_id: req.validatedBody.actor_id, role_id: role.id })
  if (existing.length) return res.status(409).json({ error: { code: "ROLE_ALREADY_ASSIGNED", message: "Role is already assigned to this actor", details: {}, traceId: (req as any).trace_id } })
  const role_assignment = await service.createRoleAssignments({ ...req.validatedBody, tenant_id: tenantId })
  res.status(201).json({ role_assignment })
}
