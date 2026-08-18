import type {
  AuthenticatedMedusaRequest,
  MedusaNextFunction,
  MedusaResponse,
} from "@medusajs/framework"
import { RBAC_MODULE } from "../../modules/rbac"
import type RbacModuleService from "../../modules/rbac/service"
import type { TenantAwareRequest } from "../../types/tenant-context"

type PermissionAssignment = {
  role?: { permissions?: Array<{ resource: string; action: string }> }
}

export const hasPermission = (
  assignments: PermissionAssignment[],
  resource: string,
  action: string
) => assignments.some((assignment) =>
  (assignment.role?.permissions ?? []).some(
    (permission) =>
      (permission.resource === resource || permission.resource === "*") &&
      (permission.action === action || permission.action === "*")
  )
)

export const requirePermission = (resource: string, action: string) => {
  return async (
    req: AuthenticatedMedusaRequest,
    res: MedusaResponse,
    next: MedusaNextFunction
  ) => {
    if (process.env.RBAC_ENFORCEMENT === "false") {
      next()
      return
    }

    const tenantId = (req as unknown as TenantAwareRequest).tenant_context
      ?.tenant_id
    const actorId =
      req.auth_context.actor_id ??
      (req.auth_context.app_metadata?.user_id as string | undefined) ??
      (req.auth_context.app_metadata?.customer_id as string | undefined)

    if (!tenantId || !actorId) {
      res.status(403).json({
        message: "Tenant and actor context are required",
        error: {
          code: "RBAC_CONTEXT_MISSING",
          message: "Tenant and actor context are required",
          details: { resource, action },
          traceId: (req as unknown as TenantAwareRequest).trace_id,
        },
      })
      return
    }

    const service: RbacModuleService = req.scope.resolve(RBAC_MODULE)
    const assignments = (await service.listRoleAssignments(
      { tenant_id: tenantId, actor_id: actorId },
      { relations: ["role", "role.permissions"] }
    )) as any[]

    // The first authenticated admin can bootstrap the first assignment.
    // Once any assignment exists, permission checks become strict.
    if (!assignments.length) {
      const tenantAssignments = await service.listRoleAssignments(
        { tenant_id: tenantId },
        { take: 1 }
      )
      if (!tenantAssignments.length) {
        next()
        return
      }
    }

    const allowed = hasPermission(assignments, resource, action)

    if (!allowed) {
      res.status(403).json({
        message: "The actor does not have the required permission",
        error: {
          code: "PERMISSION_DENIED",
          message: "The actor does not have the required permission",
          details: { resource, action },
          traceId: (req as unknown as TenantAwareRequest).trace_id,
        },
      })
      return
    }

    next()
  }
}
