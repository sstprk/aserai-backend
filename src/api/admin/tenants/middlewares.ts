import {
  authenticate,
  validateAndTransformBody,
} from "@medusajs/framework"
import type { MiddlewareRoute } from "@medusajs/medusa"
import { AdminCreateTenant, AdminUpdateTenant } from "./validators"

export const adminTenantsMiddlewares: MiddlewareRoute[] = [
  {
    method: "ALL",
    matcher: "/admin/tenants*",
    middlewares: [authenticate("user", ["session", "bearer"])],
  },
  {
    method: "POST",
    matcher: "/admin/tenants",
    middlewares: [validateAndTransformBody(AdminCreateTenant)],
  },
  {
    method: "POST",
    matcher: "/admin/tenants/:id",
    middlewares: [validateAndTransformBody(AdminUpdateTenant)],
  },
]
