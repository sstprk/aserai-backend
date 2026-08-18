import {
  MedusaNextFunction,
  MedusaRequest,
  MedusaResponse,
} from "@medusajs/framework";
import { defineMiddlewares } from "@medusajs/medusa";
import { adminMiddlewares } from "./admin/middlewares";
import { storeMiddlewares } from "./store/middlewares";
import { resolveTenantContext } from "./middlewares/tenant-context";
import { attachTraceContext } from "./middlewares/trace-context";
import { requireTenantEntity } from "./middlewares/require-tenant-entity";
import { requirePermission } from "./middlewares/require-permission";
import { ensureActiveCustomer } from "./middlewares/ensure-active-customer";
import { validateAndTransformBody } from "@medusajs/framework";
import { AdminUpdateCustomerStatus } from "./admin/customers/status/validators";

export default defineMiddlewares({
  routes: [
    {
      matcher: "/store/*",
      middlewares: [attachTraceContext, resolveTenantContext],
    },
    {
      matcher: "/admin/*",
      middlewares: [attachTraceContext],
    },
    // Every route guarded by requirePermission needs the tenant resolved first;
    // without it the permission check has no tenant to scope roles by and
    // rejects the request with RBAC_CONTEXT_MISSING.
    ...[
      "/admin/companies*",
      "/admin/quotes*",
      "/admin/approvals*",
      "/admin/roles*",
      "/admin/role-assignments*",
      "/admin/tenants*",
      "/admin/customers/:id/status",
    ].map((matcher) => ({ matcher, middlewares: [resolveTenantContext] })),
    {
      matcher: "/admin/companies/:id*",
      middlewares: [requireTenantEntity("companies")],
    },
    {
      matcher: "/store/companies/:id*",
      middlewares: [requireTenantEntity("companies")],
    },
    {
      matcher: "/admin/quotes/:id*",
      middlewares: [requireTenantEntity("quote")],
    },
    {
      matcher: "/store/quotes/:id*",
      middlewares: [requireTenantEntity("quote")],
    },
    {
      matcher: "/admin/approvals/:id*",
      middlewares: [requireTenantEntity("approval")],
    },
    {
      matcher: "/store/approvals/:id*",
      middlewares: [requireTenantEntity("approval")],
    },
    {
      method: "GET",
      matcher: "/admin/companies*",
      middlewares: [requirePermission("company", "read")],
    },
    {
      method: ["POST", "DELETE"],
      matcher: "/admin/companies*",
      middlewares: [requirePermission("company", "write")],
    },
    {
      method: "GET",
      matcher: "/admin/quotes*",
      middlewares: [requirePermission("quote", "read")],
    },
    {
      method: "POST",
      matcher: "/admin/quotes*",
      middlewares: [requirePermission("quote", "write")],
    },
    {
      matcher: "/admin/approvals*",
      middlewares: [requirePermission("approval", "manage")],
    },
    {
      matcher: "/admin/tenants*",
      middlewares: [requirePermission("tenant", "manage")],
    },
    {
      matcher: "/admin/roles*",
      middlewares: [requirePermission("role", "manage")],
    },
    {
      matcher: "/admin/role-assignments*",
      middlewares: [requirePermission("role", "manage")],
    },
    ...adminMiddlewares,
    ...storeMiddlewares,
    {
      matcher: "/store/*",
      middlewares: [ensureActiveCustomer],
    },
    {
      method: "POST",
      matcher: "/admin/customers/:id/status",
      middlewares: [
        requirePermission("customer", "manage"),
        validateAndTransformBody(AdminUpdateCustomerStatus),
      ],
    },
    {
      matcher: "/store/customers/me",
      middlewares: [
        (req: MedusaRequest, res: MedusaResponse, next: MedusaNextFunction) => {
          req.allowed = ["employee"];
          next();
        },
      ],
    },
  ],
});
