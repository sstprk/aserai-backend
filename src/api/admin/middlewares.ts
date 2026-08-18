import { MiddlewareRoute } from "@medusajs/medusa";
import { adminCompaniesMiddlewares } from "./companies/middlewares";
import { adminQuotesMiddlewares } from "./quotes/middlewares";
import { adminApprovalsMiddlewares } from "./approvals/middlewares";
import { adminTenantsMiddlewares } from "./tenants/middlewares";
import { adminRolesMiddlewares } from "./roles/middlewares";

export const adminMiddlewares: MiddlewareRoute[] = [
  ...adminCompaniesMiddlewares,
  ...adminQuotesMiddlewares,
  ...adminApprovalsMiddlewares,
  ...adminTenantsMiddlewares,
  ...adminRolesMiddlewares,
];
