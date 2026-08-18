import type {
  AuthenticatedMedusaRequest,
  MedusaResponse,
} from "@medusajs/framework"
import { RBAC_MODULE } from "../../../../modules/rbac"
import type RbacModuleService from "../../../../modules/rbac/service"
import { getTenantId } from "../../../../types/tenant-context"
import type { AdminUpdateRoleType } from "../validators"

const tenantRole = async (service: RbacModuleService, tenantId: string, id: string) => {
  const roles = await service.listRoles(
    { id, tenant_id: tenantId },
    { relations: ["permissions"] }
  )
  return roles[0]
}

export const GET = async (req: AuthenticatedMedusaRequest, res: MedusaResponse) => {
  const service: RbacModuleService = req.scope.resolve(RBAC_MODULE)
  const role = await tenantRole(service, getTenantId(req), req.params.id)
  if (!role) return res.status(404).json({ error: { code: "ROLE_NOT_FOUND", message: "Role not found", details: {}, traceId: (req as any).trace_id } })
  res.json({ role })
}

export const POST = async (
  req: AuthenticatedMedusaRequest<AdminUpdateRoleType>,
  res: MedusaResponse
) => {
  const service: RbacModuleService = req.scope.resolve(RBAC_MODULE)
  const tenantId = getTenantId(req)
  const current = await tenantRole(service, tenantId, req.params.id)
  if (!current) return res.status(404).json({ error: { code: "ROLE_NOT_FOUND", message: "Role not found", details: {}, traceId: (req as any).trace_id } })
  const role = await service.updateRoles({ id: current.id, ...req.validatedBody })
  res.json({ role })
}

export const DELETE = async (req: AuthenticatedMedusaRequest, res: MedusaResponse) => {
  const service: RbacModuleService = req.scope.resolve(RBAC_MODULE)
  const tenantId = getTenantId(req)
  const current = await tenantRole(service, tenantId, req.params.id)
  if (!current) return res.status(404).json({ error: { code: "ROLE_NOT_FOUND", message: "Role not found", details: {}, traceId: (req as any).trace_id } })
  if (current.is_system) return res.status(409).json({ error: { code: "SYSTEM_ROLE_IMMUTABLE", message: "System roles cannot be deleted", details: {}, traceId: (req as any).trace_id } })
  const assignments = await service.listRoleAssignments({ tenant_id: tenantId, role_id: current.id })
  if (assignments.length) return res.status(409).json({ error: { code: "ROLE_IN_USE", message: "Assigned roles cannot be deleted", details: { assignments: assignments.length }, traceId: (req as any).trace_id } })

  // permission.role_id has no ON DELETE CASCADE, so a role that still owns
  // permissions cannot be removed — the orphaned rows make the delete fail
  // with "such entity does not exist". Clear the children first.
  const permissions = await service.listPermissions({ role_id: current.id })
  if (permissions.length) {
    await service.deletePermissions(permissions.map((permission) => permission.id))
  }

  await service.deleteRoles(current.id)
  res.status(204).send()
}
