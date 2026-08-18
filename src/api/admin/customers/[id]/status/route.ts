import type {
  AuthenticatedMedusaRequest,
  MedusaResponse,
} from "@medusajs/framework";
import type { ICustomerModuleService } from "@medusajs/framework/types";
import { Modules } from "@medusajs/framework/utils";
import type { AdminUpdateCustomerStatusType } from "../../status/validators";
import { ContainerRegistrationKeys, MedusaError } from "@medusajs/framework/utils";
import { getTenantId } from "../../../../../types/tenant-context";

export const POST = async (
  req: AuthenticatedMedusaRequest<AdminUpdateCustomerStatusType>,
  res: MedusaResponse
) => {
  const service = req.scope.resolve<ICustomerModuleService>(Modules.CUSTOMER);
  const customer = await service.retrieveCustomer(req.params.id);
  const query = req.scope.resolve(ContainerRegistrationKeys.QUERY);
  const { data } = await query.graph({
    entity: "customer",
    fields: ["id", "metadata", "employee.company.tenant_id"],
    filters: { id: customer.id },
  });
  const tenantId = getTenantId(req);
  const customerTenant =
    (data[0]?.metadata?.tenant_id as string | undefined) ??
    (data[0]?.employee?.company?.tenant_id as string | undefined);

  if (customerTenant && customerTenant !== tenantId) {
    throw new MedusaError(MedusaError.Types.NOT_FOUND, "Customer not found");
  }
  const metadata = {
    ...(customer.metadata ?? {}),
    tenant_id: tenantId,
    is_active: req.validatedBody.is_active,
    status_reason: req.validatedBody.reason ?? null,
    status_changed_at: new Date().toISOString(),
    status_changed_by: req.auth_context.actor_id,
  };

  // A selector update answers with an array; the route contract is a single
  // customer, matching every other /admin/customers response.
  const [updated] = await service.updateCustomers(
    { id: customer.id },
    { metadata }
  );

  res.json({ customer: updated });
};
