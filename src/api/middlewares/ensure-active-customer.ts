import type {
  AuthenticatedMedusaRequest,
  MedusaNextFunction,
  MedusaRequest,
  MedusaResponse,
} from "@medusajs/framework";
import { ContainerRegistrationKeys } from "@medusajs/framework/utils";
import type { TenantAwareRequest } from "../../types/tenant-context";

type RequestRoute = Pick<MedusaRequest, "method" | "path" | "originalUrl">;

/**
 * A newly registered auth identity has no customer record until this request
 * completes. Running the active-customer lookup here would reject the request
 * that creates that record with 403 Forbidden.
 */
export const isCustomerRegistrationRequest = (req: RequestRoute) => {
  if (req.method.toUpperCase() !== "POST") {
    return false;
  }

  const paths = [req.path, req.originalUrl?.split("?")[0]].filter(Boolean);
  return paths.some((path) => path?.replace(/\/$/, "") === "/store/customers");
};

export const resolveCustomerId = (
  authContext: AuthenticatedMedusaRequest["auth_context"] | undefined
) =>
  (authContext?.app_metadata?.customer_id as string | undefined) ??
  (authContext?.actor_type === "customer" ? authContext.actor_id : undefined);

export const ensureActiveCustomer = async (
  req: AuthenticatedMedusaRequest,
  res: MedusaResponse,
  next: MedusaNextFunction
) => {
  if (isCustomerRegistrationRequest(req)) {
    next();
    return;
  }

  // Medusa's customer auth token carries the linked customer in app_metadata;
  // actor_id can still be the auth identity during parts of registration.
  const customerId = resolveCustomerId(req.auth_context);

  if (!customerId) {
    next();
    return;
  }

  const query = req.scope.resolve(ContainerRegistrationKeys.QUERY);
  const { data } = await query.graph({
    entity: "customer",
    fields: ["id", "metadata"],
    filters: { id: customerId },
  });
  const customer = data[0];

  if (!customer || customer.metadata?.is_active === false) {
    res.status(403).json({
      // Clients read the top-level `message`; without it the Medusa JS SDK
      // falls back to the bare status text and every caller sees "Forbidden".
      message: "This customer account is inactive",
      error: {
        code: "CUSTOMER_INACTIVE",
        message: "This customer account is inactive",
        details: { customer_id: customerId },
        traceId: (req as unknown as TenantAwareRequest).trace_id,
      },
    });
    return;
  }

  next();
};
