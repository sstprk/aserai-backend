import {
  authenticate,
  validateAndTransformBody,
} from "@medusajs/framework"
import type { MiddlewareRoute } from "@medusajs/medusa"
import {
  AdminCreatePermission,
  AdminCreateRole,
  AdminCreateRoleAssignment,
  AdminUpdateRole,
} from "./validators"

export const adminRolesMiddlewares: MiddlewareRoute[] = [
  {
    method: "ALL",
    matcher: "/admin/roles*",
    middlewares: [authenticate("user", ["session", "bearer"])],
  },
  {
    method: "ALL",
    matcher: "/admin/role-assignments*",
    middlewares: [authenticate("user", ["session", "bearer"])],
  },
  {
    method: "POST",
    matcher: "/admin/roles",
    middlewares: [validateAndTransformBody(AdminCreateRole)],
  },
  {
    method: "POST",
    matcher: "/admin/roles/:id",
    middlewares: [validateAndTransformBody(AdminUpdateRole)],
  },
  {
    method: "POST",
    matcher: "/admin/roles/:id/permissions",
    middlewares: [validateAndTransformBody(AdminCreatePermission)],
  },
  {
    method: "POST",
    matcher: "/admin/role-assignments",
    middlewares: [validateAndTransformBody(AdminCreateRoleAssignment)],
  },
]
